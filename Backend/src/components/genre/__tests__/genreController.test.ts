import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { getGenreById, createGenre, getAllGenres } from '../genreController';

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

describe('Genre Controller', () => {
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

  describe('getGenreById', () => {
    it('should return genre when found', async () => {
      const mockGenre = { id: 1, name: 'Rock' };
      mockConnection.query.mockResolvedValueOnce([[mockGenre]]);
      mockRequest = { params: { id: '1' } };

      await getGenreById(mockRequest as Request, mockResponse as Response);

      expect(mockConnection.query).toHaveBeenCalledWith(
        'SELECT id, name FROM musical_styles WHERE id = ?',
        [1]
      );
      expect(mockConnection.end).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(sendMock).toHaveBeenCalledWith(mockGenre);
    });

    it('should return 400 for invalid id', async () => {
      mockRequest = { params: { id: 'invalid' } };

      await getGenreById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('Invalid genre id.');
    });

    it('should return 404 when genre not found', async () => {
      mockConnection.query.mockResolvedValueOnce([[]]);
      mockRequest = { params: { id: '1' } };

      await getGenreById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(sendMock).toHaveBeenCalledWith('Genre not found.');
    });

    it('should return 500 on database error', async () => {
      mockConnection.query.mockRejectedValueOnce(new Error('DB Error'));
      mockRequest = { params: { id: '1' } };

      await getGenreById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(sendMock).toHaveBeenCalledWith('Error fetching genre.');
    });
  });

  describe('createGenre', () => {
    it('should create genre successfully', async () => {
      const mockInsertResult = { insertId: 1 };
      const mockGenre = { id: 1, name: 'Jazz' };
      mockConnection.query
        .mockResolvedValueOnce([mockInsertResult])
        .mockResolvedValueOnce([[mockGenre]]);
      mockRequest = { body: { name: 'Jazz' } };

      await createGenre(mockRequest as Request, mockResponse as Response);

      expect(mockConnection.query).toHaveBeenNthCalledWith(1,
        'INSERT INTO musical_styles (name) VALUES (?)',
        ['Jazz']
      );
      expect(mockConnection.query).toHaveBeenNthCalledWith(2,
        'SELECT id, name FROM musical_styles WHERE id = ?',
        [1]
      );
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(sendMock).toHaveBeenCalledWith(mockGenre);
    });

    it('should return 400 when name is missing', async () => {
      mockRequest = { body: {} };

      await createGenre(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('Genre name is required.');
    });

    it('should return 409 on duplicate entry', async () => {
      const error = new Error('Duplicate entry');
      (error as any).code = 'ER_DUP_ENTRY';
      mockConnection.query.mockRejectedValueOnce(error);
      mockRequest = { body: { name: 'Rock' } };

      await createGenre(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(sendMock).toHaveBeenCalledWith('Genre with this name already exists.');
    });

    it('should return 500 on insert failure', async () => {
      mockConnection.query.mockResolvedValueOnce([{}]); // No insertId
      mockRequest = { body: { name: 'Jazz' } };

      await createGenre(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(sendMock).toHaveBeenCalledWith('Unable to create genre.');
    });
  });

  describe('getAllGenres', () => {
    it('should return all genres', async () => {
      const mockGenres = [
        { id: 1, name: 'Rock' },
        { id: 2, name: 'Jazz' }
      ];
      mockConnection.query.mockResolvedValueOnce([mockGenres]);

      await getAllGenres(mockRequest as Request, mockResponse as Response);

      expect(mockConnection.query).toHaveBeenCalledWith(
        'SELECT id, name FROM musical_styles ORDER BY name ASC'
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(sendMock).toHaveBeenCalledWith(mockGenres);
    });

    it('should return 500 on database error', async () => {
      mockConnection.query.mockRejectedValueOnce(new Error('DB Error'));

      await getAllGenres(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(sendMock).toHaveBeenCalledWith('Error fetching genres.');
    });
  });
});