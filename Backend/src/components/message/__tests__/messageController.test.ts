import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { createMessage, deleteMessage } from '../messageController';

// Mock mysql2/promise
jest.mock('mysql2/promise');

// Mock config
jest.mock('../../../config/config', () => ({
  database: {
    host: 'localhost',
    user: 'test',
    password: 'test',
    database: 'test'
  }
}));

// Mock console.log to avoid test output noise
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('Message Controller', () => {
  let mockConnection: any;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    mockConnection = {
      query: jest.fn(),
      end: jest.fn()
    };

    (mysql.createConnection as jest.Mock).mockResolvedValue(mockConnection);

    statusMock = jest.fn().mockReturnThis();
    sendMock = jest.fn();

    mockResponse = {
      status: statusMock,
      send: sendMock
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMessage', () => {
    it('should create message successfully', async () => {
      const mockInsertResult = { insertId: 1 };
      const mockMessage = { id: 1, thread_id: 1, sender_id: 1, message: 'Hello', sent_at: '2023-01-01' };
      mockConnection.query
        .mockResolvedValueOnce([[{ id: 1 }]]) // thread check
        .mockResolvedValueOnce([[{ id: 1 }]]) // sender check
        .mockResolvedValueOnce([[{ thread_id: 1 }]]) // membership check
        .mockResolvedValueOnce([mockInsertResult]) // insert
        .mockResolvedValueOnce([[mockMessage]]); // select
      mockRequest = { body: { thread_id: '1', sender_id: '1', message: 'Hello' } };

      await createMessage(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(sendMock).toHaveBeenCalledWith(mockMessage);
    });

    it('should return 400 when required fields are missing', async () => {
      mockRequest = { body: {} };

      await createMessage(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('Thread ID, sender ID, and message are required.');
    });

    it('should return 404 when thread not found', async () => {
      mockConnection.query.mockResolvedValueOnce([[]]); // thread check
      mockRequest = { body: { thread_id: '1', sender_id: '1', message: 'Hello' } };

      await createMessage(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(sendMock).toHaveBeenCalledWith('Thread not found.');
    });
  });

  describe('deleteMessage', () => {
    it('should delete message successfully', async () => {
      mockConnection.query
        .mockResolvedValueOnce([[{ id: 1 }]]) // message check
        .mockResolvedValueOnce([]); // delete
      mockRequest = { params: { id: '1' } };

      await deleteMessage(mockRequest as Request, mockResponse as Response);

      expect(mockConnection.query).toHaveBeenNthCalledWith(2,
        'DELETE FROM messages WHERE id = ?',
        [1]
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(sendMock).toHaveBeenCalledWith({ message: 'Message deleted successfully.' });
    });

    it('should return 400 for invalid id', async () => {
      mockRequest = { params: { id: 'invalid' } };

      await deleteMessage(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('Invalid message id.');
    });

    it('should return 404 when message not found', async () => {
      mockConnection.query.mockResolvedValueOnce([[]]); // message check
      mockRequest = { params: { id: '1' } };

      await deleteMessage(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(sendMock).toHaveBeenCalledWith('Message not found.');
    });
  });
});