/* eslint-disable @typescript-eslint/no-explicit-any */
import { OperationalReportService } from '../../../src/modules/reports-module/operational-report-module/operational-report.service';
import { DatabaseService } from '../../../src/common/database/database.service';

describe('OperationalReportService', () => {
  let service: OperationalReportService;

  const prismaMock = {
    complaints: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    securityReports: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    residents: {
      count: jest.fn(),
    },
    units: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  } as unknown as DatabaseService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OperationalReportService(prismaMock);
  });

  const filterFull = {
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    unitStatus: 'OCCUPIED',
  };

  // ===================================================================
  // getComplaintStatistics()
  // ===================================================================
  describe('getComplaintStatistics()', () => {
    it('Positive Case - Mengembalikan total & groupBy (by category & status) dengan where filter lengkap', async () => {
      (prismaMock.complaints.count as any).mockResolvedValue(10);
      (prismaMock.complaints.groupBy as any)
        .mockResolvedValueOnce([
          { category: 'MAINTENANCE', _count: { id: 6 } },
          { category: 'NOISE', _count: { id: 4 } },
        ]) // for complaintsByCategory
        .mockResolvedValueOnce([
          { status: 'OPEN', _count: { id: 3 } },
          { status: 'CLOSED', _count: { id: 7 } },
        ]); // for complaintsByStatus

      const res = await service.getComplaintStatistics(filterFull as any);

      // verifikasi where clause dikirim ke Prisma
      expect(prismaMock.complaints.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          createdAt: {
            gte: new Date('2025-01-01'),
            lte: new Date('2025-01-31'),
          },
          unit: { status: 'OCCUPIED' },
        }),
      });

      expect(prismaMock.complaints.groupBy).toHaveBeenNthCalledWith(1, {
        by: ['category'],
        _count: { id: true },
        where: expect.objectContaining({
          createdAt: {
            gte: new Date('2025-01-01'),
            lte: new Date('2025-01-31'),
          },
          unit: { status: 'OCCUPIED' },
        }),
      });

      expect(prismaMock.complaints.groupBy).toHaveBeenNthCalledWith(2, {
        by: ['status'],
        _count: { id: true },
        where: expect.objectContaining({
          createdAt: {
            gte: new Date('2025-01-01'),
            lte: new Date('2025-01-31'),
          },
          unit: { status: 'OCCUPIED' },
        }),
      });

      expect(res.totalComplaints).toBe(10);
      expect(res.complaintsByCategory).toHaveLength(2);
      expect(res.complaintsByStatus).toHaveLength(2);
    });

    it('Positive Case - Filter parsial (hanya startDate)', async () => {
      (prismaMock.complaints.count as any).mockResolvedValue(2);
      (prismaMock.complaints.groupBy as any)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const res = await service.getComplaintStatistics({
        startDate: '2025-02-01',
      } as any);

      expect(prismaMock.complaints.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          createdAt: { gte: new Date('2025-02-01') },
        }),
      });
      expect(res.totalComplaints).toBe(2);
    });

    it('Negative Case - Prisma error diteruskan (reject)', async () => {
      (prismaMock.complaints.count as any).mockRejectedValue(new Error('db err'));

      await expect(service.getComplaintStatistics({} as any)).rejects.toThrow('db err');
    });
  });

  // ===================================================================
  // getSecurityReportStatistics()
  // ===================================================================
  describe('getSecurityReportStatistics()', () => {
    it('Positive Case - Mengembalikan total & groupBy (by status) dengan where filter lengkap', async () => {
      (prismaMock.securityReports.count as any).mockResolvedValue(5);
      (prismaMock.securityReports.groupBy as any).mockResolvedValue([
        { status: 'OPEN', _count: { id: 2 } },
        { status: 'CLOSED', _count: { id: 3 } },
      ]);

      const res = await service.getSecurityReportStatistics(filterFull as any);

      expect(prismaMock.securityReports.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          createdAt: {
            gte: new Date('2025-01-01'),
            lte: new Date('2025-01-31'),
          },
          unit: { status: 'OCCUPIED' },
        }),
      });

      expect(prismaMock.securityReports.groupBy).toHaveBeenCalledWith({
        by: ['status'],
        _count: { id: true },
        where: expect.objectContaining({
          createdAt: {
            gte: new Date('2025-01-01'),
            lte: new Date('2025-01-31'),
          },
          unit: { status: 'OCCUPIED' },
        }),
      });

      expect(res.totalSecurityReports).toBe(5);
      expect(res.reportsByStatus).toHaveLength(2);
    });

    it('Positive Case - Tanpa filter (where kosong)', async () => {
      (prismaMock.securityReports.count as any).mockResolvedValue(1);
      (prismaMock.securityReports.groupBy as any).mockResolvedValue([]);

      const res = await service.getSecurityReportStatistics({} as any);

      expect(prismaMock.securityReports.count).toHaveBeenCalledWith({
        where: {},
      });
      expect(res.totalSecurityReports).toBe(1);
    });

    it('Negative Case - Prisma error diteruskan (reject)', async () => {
      (prismaMock.securityReports.count as any).mockRejectedValue(new Error('oops'));

      await expect(service.getSecurityReportStatistics({} as any)).rejects.toThrow('oops');
    });
  });

  // ===================================================================
  // getUnitAndResidentStatistics()
  // ===================================================================
  describe('getUnitAndResidentStatistics()', () => {
    it('Positive Case - Mengembalikan counts dan groupBy status unit', async () => {
      (prismaMock.residents.count as any).mockResolvedValue(20);
      (prismaMock.units.count as any).mockResolvedValue(15);
      (prismaMock.units.groupBy as any).mockResolvedValue([
        { status: 'OCCUPIED', _count: { id: 8 } },
        { status: 'VACANT', _count: { id: 7 } },
      ]);

      const res = await service.getUnitAndResidentStatistics();

      expect(prismaMock.residents.count).toHaveBeenCalledWith();
      expect(prismaMock.units.count).toHaveBeenCalledWith();
      expect(prismaMock.units.groupBy).toHaveBeenCalledWith({
        by: ['status'],
        _count: { id: true },
      });

      expect(res.totalResidents).toBe(20);
      expect(res.totalUnits).toBe(15);
      expect(res.unitsByStatus).toHaveLength(2);
    });

    it('Negative Case - Prisma error diteruskan (reject)', async () => {
      (prismaMock.residents.count as any).mockRejectedValue(new Error('db fail'));

      await expect(service.getUnitAndResidentStatistics()).rejects.toThrow('db fail');
    });
  });
});
