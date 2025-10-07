/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsReportService } from '../../../src/modules/reports-module/payments-report-module/payments-report.service';
import { DatabaseService } from '../../../src/common/database/database.service';
import { PaymentStatus } from '../../../src/common/database/generated/prisma';

describe('PaymentsReportService', () => {
 let service: PaymentsReportService;
  const prismaMock = {
    payments: { aggregate: jest.fn(), findMany: jest.fn() },
    bills: { aggregate: jest.fn() },
  } as unknown as DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsReportService,
        { provide: DatabaseService, useValue: prismaMock }, // <-- kunci
      ],
    }).compile();

    service = module.get<PaymentsReportService>(PaymentsReportService);
    jest.clearAllMocks();
  });

  const filterFull = {
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    status: PaymentStatus.PAID,
    paymentType: 'MAINTENANCE',
  };

  // =========================================================
  // getTotalRevenue()
  // =========================================================
  describe('getTotalRevenue()', () => {
    it('Positive Case - Mengembalikan totalPaid & totalOverdue (filter lengkap)', async () => {
      (prismaMock.payments.aggregate as any).mockResolvedValue({
        _sum: { amount: 1500000 },
      });
      (prismaMock.bills.aggregate as any).mockResolvedValue({
        _sum: { amount: 250000 },
      });

      const res = await service.getTotalRevenue(filterFull as any);

      // verifikasi aggregate payments
      expect(prismaMock.payments.aggregate).toHaveBeenCalledWith({
        _sum: { amount: true },
        where: expect.objectContaining({
          paymentDate: {
            gte: new Date('2025-01-01'),
            lte: new Date('2025-01-31'),
          },
          status: PaymentStatus.PAID, // service override status=PAID untuk totalPaid
          bill: { type: 'MAINTENANCE' },
        }),
      });

      // verifikasi aggregate bills (overdue)
      const billsArgs = (prismaMock.bills.aggregate as jest.Mock).mock.calls[0][0];
      expect(billsArgs).toMatchObject({
        _sum: { amount: true },
        where: expect.objectContaining({
          paymentDate: {
            gte: new Date('2025-01-01'),
            lte: new Date('2025-01-31'),
          },
          isPaid: false,
          dueDate: expect.objectContaining({ lt: expect.any(Date) }),
          status: PaymentStatus.PAID, // service override status=PAID untuk totalPaid
          bill: { type: 'MAINTENANCE' },
        }),
      });

      expect(res).toEqual({ totalPaid: 1500000, totalOverdue: 250000 });
    });

    it('Positive Case - Nilai null pada aggregate → fallback 0', async () => {
      (prismaMock.payments.aggregate as any).mockResolvedValue({ _sum: { amount: null } });
      (prismaMock.bills.aggregate as any).mockResolvedValue({ _sum: { amount: undefined } });

      const res = await service.getTotalRevenue({} as any);
      expect(res).toEqual({ totalPaid: 0, totalOverdue: 0 });
    });

    it('Negative Case - Error dari Prisma diteruskan (payments.aggregate)', async () => {
      (prismaMock.payments.aggregate as any).mockRejectedValue(new Error('db err'));
      await expect(service.getTotalRevenue({} as any)).rejects.toThrow('db err');
    });

    it('Negative Case - Error dari Prisma diteruskan (bills.aggregate)', async () => {
      (prismaMock.payments.aggregate as any).mockResolvedValue({ _sum: { amount: 100 } });
      (prismaMock.bills.aggregate as any).mockRejectedValue(new Error('bills err'));
      await expect(service.getTotalRevenue({} as any)).rejects.toThrow('bills err');
    });
  });

  // =========================================================
  // getPaymentHistoryByMonth()
  // =========================================================
  describe('getPaymentHistoryByMonth()', () => {
    it('Positive Case - Mengembalikan daftar pembayaran (urut paymentDate asc) + verify where', async () => {
      (prismaMock.payments.findMany as any).mockResolvedValue([
        {
          paymentDate: new Date('2025-01-02'),
          amount: 100000,
          resident: { user: { fullName: 'Budi' } },
          bill: { type: 'MAINTENANCE' },
        },
      ]);

      const res = await service.getPaymentHistoryByMonth(filterFull as any);

      expect(prismaMock.payments.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          paymentDate: {
            gte: new Date('2025-01-01'),
            lte: new Date('2025-01-31'),
          },
          status: PaymentStatus.PAID,
          bill: { type: 'MAINTENANCE' },
        }),
        select: {
          paymentDate: true,
          amount: true,
          resident: { select: { user: { select: { fullName: true } } } },
          bill: { select: { type: true } },
        },
        orderBy: { paymentDate: 'asc' },
      });

      expect(res).toHaveLength(1);
      expect(res[0].resident.user.fullName).toBe('Budi');
    });

    it('Positive Case - Filter parsial (hanya startDate)', async () => {
      (prismaMock.payments.findMany as any).mockResolvedValue([]);
      await service.getPaymentHistoryByMonth({ startDate: '2025-02-01' } as any);

      expect(prismaMock.payments.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            paymentDate: { gte: new Date('2025-02-01') },
          }),
        }),
      );
    });

    it('Positive Case - Tanpa filter (where kosong)', async () => {
      (prismaMock.payments.findMany as any).mockResolvedValue([]);
      await service.getPaymentHistoryByMonth({} as any);

      const args = (prismaMock.payments.findMany as jest.Mock).mock.calls[0][0];
      expect(args.where).toEqual({});
    });

    it('Negative Case - Error dari Prisma diteruskan', async () => {
      (prismaMock.payments.findMany as any).mockRejectedValue(new Error('fail'));
      await expect(service.getPaymentHistoryByMonth({} as any)).rejects.toThrow('fail');
    });
  });
});
