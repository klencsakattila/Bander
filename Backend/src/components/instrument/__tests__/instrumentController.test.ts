import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { getInstrumentById, createInstrument, getAllInstruments } from '../instrumentController';

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

describe('Instrument Controller', () => {
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

  describe('getInstrumentById', () => {
    it('should return instrument when found', async () => {
      const mockInstrument = { id: 1, name: 'Guitar' };
      mockConnection.query.mockResolvedValueOnce([[mockInstrument]]);
      mockRequest = { params: { id: '1' } };

      await getInstrumentById(mockRequest as Request, mockResponse as Response);

      expect(mockConnection.query).toHaveBeenCalledWith(
        'SELECT id, name FROM instruments WHERE id = ?',
        [1]
      );
      expect(mockConnection.end).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(sendMock).toHaveBeenCalledWith(mockInstrument);
    });

    it('should return 400 for invalid id', async () => {
      mockRequest = { params: { id: 'invalid' } };

      await getInstrumentById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('Invalid instrument id.');
    });

    it('should return 404 when instrument not found', async () => {
      mockConnection.query.mockResolvedValueOnce([[]]);
      mockRequest = { params: { id: '1' } };

      await getInstrumentById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(sendMock).toHaveBeenCalledWith('Instrument not found.');
    });

    it('should return 500 on database error', async () => {
      mockConnection.query.mockRejectedValueOnce(new Error('DB Error'));
      mockRequest = { params: { id: '1' } };

      await getInstrumentById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(sendMock).toHaveBeenCalledWith('Error fetching instrument.');
    });
  });

  describe('createInstrument', () => {
    it('should create instrument successfully', async () => {
      const mockInsertResult = { insertId: 1 };
      const mockInstrument = { id: 1, name: 'Drums' };
      mockConnection.query
        .mockResolvedValueOnce([mockInsertResult])
        .mockResolvedValueOnce([[mockInstrument]]);
      mockRequest = { body: { name: 'Drums' } };

      await createInstrument(mockRequest as Request, mockResponse as Response);

      expect(mockConnection.query).toHaveBeenNthCalledWith(1,
        'INSERT INTO instruments (name) VALUES (?)',
        ['Drums']
      );
      expect(mockConnection.query).toHaveBeenNthCalledWith(2,
        'SELECT id, name FROM instruments WHERE id = ?',
        [1]
      );
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(sendMock).toHaveBeenCalledWith(mockInstrument);
    });

    it('should return 400 when name is missing', async () => {
      mockRequest = { body: {} };

      await createInstrument(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('Instrument name is required.');
    });

    it('should return 409 on duplicate entry', async () => {
      const error = new Error('Duplicate entry');
      (error as any).code = 'ER_DUP_ENTRY';
      mockConnection.query.mockRejectedValueOnce(error);
      mockRequest = { body: { name: 'Guitar' } };

      await createInstrument(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(sendMock).toHaveBeenCalledWith('Instrument with this name already exists.');
    });

    it('should return 500 on insert failure', async () => {
      mockConnection.query.mockResolvedValueOnce([{}]); // No insertId
      mockRequest = { body: { name: 'Drums' } };

      await createInstrument(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(sendMock).toHaveBeenCalledWith('Unable to create instrument.');
    });
  });

  describe('getAllInstruments', () => {
    it('should return all instruments', async () => {
      const mockInstruments = [
        { id: 1, name: 'Guitar' },
        { id: 2, name: 'Drums' }
      ];
      mockConnection.query.mockResolvedValueOnce([mockInstruments]);

      await getAllInstruments(mockRequest as Request, mockResponse as Response);

      expect(mockConnection.query).toHaveBeenCalledWith(
        'SELECT id, name FROM instruments ORDER BY name ASC'
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(sendMock).toHaveBeenCalledWith(mockInstruments);
    });

    it('should return 500 on database error', async () => {
      mockConnection.query.mockRejectedValueOnce(new Error('DB Error'));

      await getAllInstruments(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(sendMock).toHaveBeenCalledWith('Error fetching instruments.');
    });
  });
});