import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { getThreadById, createThread } from '../threadController';

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

describe('Thread Controller', () => {
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

  describe('getThreadById', () => {
    it('should return thread with users and messages', async () => {
      const mockThread = { id: 1, created_at: '2023-01-01' };
      const mockUsers = [{ id: 1, username: 'user1' }];
      const mockMessages = [{ id: 1, thread_id: 1, sender_id: 1, message: 'Hello', sent_at: '2023-01-01' }];
      mockConnection.query
        .mockResolvedValueOnce([[mockThread]])
        .mockResolvedValueOnce([mockUsers])
        .mockResolvedValueOnce([mockMessages]);
      mockRequest = { params: { id: '1', numberofmessages: '10' } };

      await getThreadById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(sendMock).toHaveBeenCalledWith({
        thread: mockThread,
        users: mockUsers,
        messages: mockMessages
      });
    });

    it('should return 400 for invalid id', async () => {
      mockRequest = { params: { id: 'invalid' } };

      await getThreadById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('Invalid thread id.');
    });

    it('should return 404 when thread not found', async () => {
      mockConnection.query.mockResolvedValueOnce([[]]);
      mockRequest = { params: { id: '1' } };

      await getThreadById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(sendMock).toHaveBeenCalledWith('Thread not found.');
    });
  });

  describe('createThread', () => {
    it('should create thread successfully', async () => {
      const mockThreadInsert = { insertId: 1 };
      const mockThread = { id: 1, created_at: '2023-01-01' };
      mockConnection.query
        .mockResolvedValueOnce([[{ id: 1 }]]) // user1 check
        .mockResolvedValueOnce([[{ id: 2 }]]) // user2 check
        .mockResolvedValueOnce([[]]) // existing thread check
        .mockResolvedValueOnce([mockThreadInsert]) // insert thread
        .mockResolvedValueOnce([]) // insert thread_users
        .mockResolvedValueOnce([[mockThread]]); // select thread
      mockRequest = { body: { user1_id: '1', user2_id: '2' } };

      await createThread(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(sendMock).toHaveBeenCalledWith({
        thread: mockThread,
        users: [{ id: 1 }, { id: 2 }]
      });
    });

    it('should return 400 when user ids are missing', async () => {
      mockRequest = { body: {} };

      await createThread(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('Both user IDs are required.');
    });

    it('should return 404 when user1 not found', async () => {
      mockConnection.query.mockResolvedValueOnce([[]]); // user1 check
      mockRequest = { body: { user1_id: '1', user2_id: '2' } };

      await createThread(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(sendMock).toHaveBeenCalledWith('User 1 not found.');
    });
  });
});