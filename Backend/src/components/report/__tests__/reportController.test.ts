import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { getAllReport, getReportById, createReport, deleteReport, updateReportStatus } from '../reportController';

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

describe('Report Controller', () => {
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

  describe('getAllReport', () => {
    it('should return all reports', async () => {
      const mockReports = [
        { id: 1, report_message: 'Test report 1' },
        { id: 2, report_message: 'Test report 2' }
      ];
      mockConnection.query.mockResolvedValueOnce([mockReports]);

      await getAllReport(mockRequest as Request, mockResponse as Response);

      expect(mockConnection.query).toHaveBeenCalledWith(
        'SELECT * FROM reports ORDER BY created_at DESC, id DESC'
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(sendMock).toHaveBeenCalledWith(mockReports);
    });

    it('should return 500 on database error', async () => {
      mockConnection.query.mockRejectedValueOnce(new Error('DB Error'));

      await getAllReport(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(sendMock).toHaveBeenCalledWith('Error fetching reports.');
    });
  });

  describe('getReportById', () => {
    it('should return report when found', async () => {
      const mockReport = { id: 1, report_message: 'Test report' };
      mockConnection.query.mockResolvedValueOnce([[mockReport]]);
      mockRequest = { params: { id: '1' } };

      await getReportById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(sendMock).toHaveBeenCalledWith(mockReport);
    });

    it('should return 400 for invalid id', async () => {
      mockRequest = { params: { id: 'invalid' } };

      await getReportById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('Invalid report id.');
    });

    it('should return 404 when report not found', async () => {
      mockConnection.query.mockResolvedValueOnce([[]]);
      mockRequest = { params: { id: '1' } };

      await getReportById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(sendMock).toHaveBeenCalledWith('Report not found.');
    });
  });

  describe('createReport', () => {
    it('should create report successfully', async () => {
      const mockInsertResult = { insertId: 1 };
      const mockReport = { id: 1, reporter_id: 1, report_message: 'Test report', report_status: 'open' };
      mockConnection.query
        .mockResolvedValueOnce([[{ id: 1 }]]) // reporter check
        .mockResolvedValueOnce([[{ id: 2 }]]) // reported user check
        .mockResolvedValueOnce([mockInsertResult])
        .mockResolvedValueOnce([[mockReport]]);
      mockRequest = { body: { reporter_id: '1', reported_user_id: '2', report_message: 'Test report' } };

      await createReport(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(sendMock).toHaveBeenCalledWith(mockReport);
    });

    it('should return 400 when required fields are missing', async () => {
      mockRequest = { body: {} };

      await createReport(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('Reporter ID and report message are required.');
    });

    it('should return 400 when no target is specified', async () => {
      mockRequest = { body: { reporter_id: '1', report_message: 'Test' } };

      await createReport(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('At least one target (user, band, or post) is required.');
    });

    it('should return 404 when reporter not found', async () => {
      mockConnection.query.mockResolvedValueOnce([[]]); // reporter check
      mockRequest = { body: { reporter_id: '1', reported_user_id: '2', report_message: 'Test' } };

      await createReport(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(sendMock).toHaveBeenCalledWith('Reporter not found.');
    });
  });

  describe('deleteReport', () => {
    it('should delete report successfully', async () => {
      mockConnection.query
        .mockResolvedValueOnce([[{ id: 1 }]]) // report check
        .mockResolvedValueOnce([]); // delete
      mockRequest = { params: { id: '1' } };

      await deleteReport(mockRequest as Request, mockResponse as Response);

      expect(mockConnection.query).toHaveBeenNthCalledWith(2,
        'DELETE FROM reports WHERE id = ?',
        [1]
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(sendMock).toHaveBeenCalledWith({ message: 'Report deleted successfully.' });
    });

    it('should return 400 for invalid id', async () => {
      mockRequest = { params: { id: 'invalid' } };

      await deleteReport(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('Invalid report id.');
    });

    it('should return 404 when report not found', async () => {
      mockConnection.query.mockResolvedValueOnce([[]]); // report check
      mockRequest = { params: { id: '1' } };

      await deleteReport(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(sendMock).toHaveBeenCalledWith('Report not found.');
    });
  });

  describe('updateReportStatus', () => {
    it('should update report status successfully', async () => {
      const mockReport = { id: 1, report_status: 'resolved' };
      mockConnection.query
        .mockResolvedValueOnce([[{ id: 1 }]]) // report check
        .mockResolvedValueOnce([]) // update
        .mockResolvedValueOnce([[mockReport]]); // select
      mockRequest = { params: { id: '1' }, body: { report_status: 'resolved' } };

      await updateReportStatus(mockRequest as Request, mockResponse as Response);

      expect(mockConnection.query).toHaveBeenNthCalledWith(2,
        'UPDATE reports SET report_status = ? WHERE id = ?',
        ['resolved', 1]
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(sendMock).toHaveBeenCalledWith(mockReport);
    });

    it('should return 400 for invalid status', async () => {
      mockRequest = { params: { id: '1' }, body: { report_status: 'invalid' } };

      await updateReportStatus(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith('Invalid report status.');
    });

    it('should return 404 when report not found', async () => {
      mockConnection.query.mockResolvedValueOnce([[]]); // report check
      mockRequest = { params: { id: '1' }, body: { report_status: 'resolved' } };

      await updateReportStatus(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(sendMock).toHaveBeenCalledWith('Report not found.');
    });
  });
});