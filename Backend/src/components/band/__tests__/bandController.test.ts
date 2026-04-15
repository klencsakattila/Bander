import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { getBandById, createBand, getBandsLimit, getBandPostById } from '../bandController';

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

describe('Band Controller', () => {
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

    mockRequest = {
      params: {},
      query: {},
      body: {}
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBandById', () => {
    it('should return band with members and styles', async () => {
      const mockBand = { id: 1, name: 'Test Band', city: 'Test City' };
      const mockMembers = [{ id: 1, username: 'user1', instruments: 'Guitar, Drums' }];
      const mockStyles = [{ id: 1, name: 'Rock' }];
      mockConnection.query
        .mockResolvedValueOnce([[mockBand]])
        .mockResolvedValueOnce([mockMembers])
        .mockResolvedValueOnce([mockStyles]);
      mockRequest = { params: { id: '1' } };

      await getBandById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(sendMock).toHaveBeenCalledWith({
        ...mockBand,
        members: [{ id: 1, username: 'user1', instruments: ['Guitar', 'Drums'] }],
        styles: ['Rock']
      });
    });

    it('should return 400 for invalid id', async () => {
      mockRequest = { params: { id: 'invalid' } };

      await getBandById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('Invalid band id.');
    });

    it('should return 404 when band not found', async () => {
      mockConnection.query.mockResolvedValueOnce([[]]);
      mockRequest = { params: { id: '1' } };

      await getBandById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(sendMock).toHaveBeenCalledWith('No band found with the given id.');
    });
  });

  describe('createBand', () => {
    it('should create band successfully', async () => {
      const mockInsertResult = { insertId: 1 };
      const mockBand = { id: 1, name: 'New Band', city: 'Test City' };
      mockConnection.query
        .mockResolvedValueOnce([mockInsertResult])
        .mockResolvedValueOnce([[mockBand]])
        .mockResolvedValueOnce([[]]) // members
        .mockResolvedValueOnce([[]]); // styles
      mockRequest = { body: { name: 'New Band', city: 'Test City' } };

      await createBand(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(sendMock).toHaveBeenCalledWith({
        ...mockBand,
        members: [],
        styles: []
      });
    });

    it('should return 400 when name is missing', async () => {
      mockRequest = { body: {} };

      await createBand(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('Band name is required.');
    });

    it('should return 409 on duplicate name', async () => {
      const error = new Error('Duplicate entry');
      (error as any).code = 'ER_DUP_ENTRY';
      mockConnection.query.mockRejectedValueOnce(error);
      mockRequest = { body: { name: 'Existing Band' } };

      await createBand(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(sendMock).toHaveBeenCalledWith('Band with this name already exists.');
    });
  });

  describe('getBandsLimit', () => {
    it('should return bands with default limit', async () => {
      const mockBands = [
        { id: 1, name: 'Band 1', city: 'City 1' },
        { id: 2, name: 'Band 2', city: 'City 2' }
      ];
      mockConnection.query.mockResolvedValueOnce([mockBands]);

      await getBandsLimit(mockRequest as Request, mockResponse as Response);

      expect(mockConnection.query).toHaveBeenCalledWith(
        'SELECT id, name, city, profile_image_url, banner_image_url, created_at FROM bands ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [10, 0]
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(sendMock).toHaveBeenCalledWith(mockBands);
    });

    it('should handle custom limit and offset from params', async () => {
      const mockBands = [{ id: 1, name: 'Band 1' }];
      mockConnection.query.mockResolvedValueOnce([mockBands]);
      mockRequest = { params: { limit: '5', offset: '10' } };

      await getBandsLimit(mockRequest as Request, mockResponse as Response);

      expect(mockConnection.query).toHaveBeenCalledWith(
        'SELECT id, name, city, profile_image_url, banner_image_url, created_at FROM bands ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [5, 10]
      );
    });
  });

  describe('getBandPostById', () => {
    it('should return band post when found', async () => {
      const mockPost = { id: 1, band_id: 1, post_type: 'announcement', post_message: 'Test', band_name: 'Test Band' };
      mockConnection.query.mockResolvedValueOnce([[mockPost]]);
      mockRequest = { params: { id: '1' } };

      await getBandPostById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(sendMock).toHaveBeenCalledWith(mockPost);
    });

    it('should return 400 for invalid id', async () => {
      mockRequest = { params: { id: 'invalid' } };

      await getBandPostById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('Invalid post id.');
    });

    it('should return 404 when post not found', async () => {
      mockConnection.query.mockResolvedValueOnce([[]]);
      mockRequest = { params: { id: '1' } };

      await getBandPostById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(sendMock).toHaveBeenCalledWith('Band post not found.');
    });
  });
});