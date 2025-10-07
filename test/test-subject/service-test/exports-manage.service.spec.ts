import { Test, TestingModule } from '@nestjs/testing';
import { ExportsManageService } from '../../../src/common/helper/exports/exports-manage.service';
import { OperationalReportService } from '../../../src/modules/reports-module/operational-report-module/operational-report.service';
import { PaymentsReportService } from '../../../src/modules/reports-module/payments-report-module/payments-report.service';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs/promises';
import * as Handlebars from 'handlebars';
import { PaymentStatus, PaymentType } from '../../../src/common/database/generated/prisma';

jest.mock('puppeteer');
// jest.mock('fs/promises');
jest.mock('fs/promises', () => {
  return {
    __esModule: true,
    default: {  // kalau service pakai `require("fs/promises")`
      readFile: jest.fn(),
    },
    readFile: jest.fn(), // cover juga kalau dipanggil langsung
  };
});

describe('ExportsManageService (Granular)', () => {
  let service: ExportsManageService;
  let operationalMock: jest.Mocked<OperationalReportService>;
  let paymentsMock: jest.Mocked<PaymentsReportService>;
  let pageMock: any;
  let browserMock: any;

  beforeEach(async () => {
    operationalMock = {
      getComplaintStatistics: jest.fn(),
      getSecurityReportStatistics: jest.fn(),
      getUnitAndResidentStatistics: jest.fn(),
    } as any;

    paymentsMock = {
      getTotalRevenue: jest.fn(),
      getPaymentHistoryByMonth: jest.fn(),
    } as any;

    pageMock = {
      setContent: jest.fn().mockResolvedValue(null),
      pdf: jest.fn().mockResolvedValue(Buffer.from('pdf')),
      close: jest.fn(),
    };

    browserMock = {
      newPage: jest.fn().mockResolvedValue(pageMock),
      close: jest.fn(),
    };

    (puppeteer.launch as jest.Mock).mockResolvedValue(browserMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportsManageService,
        { provide: OperationalReportService, useValue: operationalMock },
        { provide: PaymentsReportService, useValue: paymentsMock },
      ],
    }).compile();

    service = module.get<ExportsManageService>(ExportsManageService);
  });

  // === Lifecycle ===
  it('should init puppeteer browser', async () => {
    await service.onModuleInit();
    expect(puppeteer.launch).toHaveBeenCalled();
  });

  it('should close browser on destroy', async () => {
    await service.onModuleInit();
    await service.onModuleDestroy();
    expect(browserMock.close).toHaveBeenCalled();
  });

  // === Helpers ===
  it('formatPeriod should handle all cases', () => {
    expect(service['formatPeriod']('', '')).toBe('Semua periode');
    expect(service['formatPeriod']('', '2025-01-01')).toContain('Sampai');
    expect(service['formatPeriod']('2025-01-01', '')).toContain('Dari');
    expect(service['formatPeriod']('2025-01-01', '2025-01-31')).toContain(' - ');
  });

  it('formatCurrency should format IDR', () => {
    const s = (service as any).formatCurrency(5000);
    expect(s).toContain('5.000');
    expect(s).toMatch(/^Rp/);
  });

  it('groupPaymentsByMonth should group correctly', () => {
    const payments = [
      { paymentDate: '2025-01-01', amount: 100 },
      { paymentDate: '2025-01-15', amount: 200 },
    ];
    const result = service['groupPaymentsByMonth'](payments as any);
    expect(result[0]).toHaveProperty('month');
    expect(result[0]).toHaveProperty('total');
  });

  it('getStatusLabel should map correctly', () => {
    expect(service['getStatusLabel']('PAID')).toBe('Lunas');
    expect(service['getStatusLabel']('PENDING')).toBe('Tertunda');
    expect(service['getStatusLabel']('OVERDUE')).toBe('Terlambat');
    expect(service['getStatusLabel']('CANCELLED')).toBe('Dibatalkan');
    expect(service['getStatusLabel']('UNKNOWN')).toBe('Lunas');
  });

  it('isLatePayment should detect overdue', () => {
    const payment = { paymentDate: '2025-02-01', bill: { dueDate: '2025-01-01' } };
    expect(service['isLatePayment'](payment as any)).toBe(true);
  });

  it('analyzePaymentsByBillType should aggregate correctly', () => {
    const payments = [{ bill: { type: 'MAINTENANCE' }, amount: 100 }];
    const result = service['analyzePaymentsByBillType'](payments as any);
    expect(result[0].billType).toBe('MAINTENANCE');
  });

  it('analyzePaymentsByMethod should aggregate correctly', () => {
    const payments = [{ paymentMethod: 'Cash', amount: 100 }];
    const result = service['analyzePaymentsByMethod'](payments as any);
    expect(result[0].method).toBe('Cash');
  });

  // === Template Loader ===
  it('loadTemplate should return content if file exists', async () => {
    // mock isi file dengan konten HTML sederhana
    (fs.readFile as jest.Mock).mockResolvedValue('<!DOCTYPE html><html><body>OK</body></html>');

    const tpl = await service['loadTemplate']('operational-report');

    expect(fs.readFile).toHaveBeenCalledWith(
      expect.stringContaining('operational-report.hbs'),
      'utf-8'
    );
    expect(tpl).toContain('<body>OK</body>');
  });

  // === Template Loader ===
  it('loadTemplate should return default if file missing', async () => {
    (fs.readFile as jest.Mock).mockRejectedValue(new Error('not found'));
    const tpl = await service['loadTemplate']('operational-report');
    expect(tpl).toContain('<!DOCTYPE html>'); 
    expect(fs.readFile).toHaveBeenCalled(); 
  });

  // === PDF Generator ===
  it('generatePdfFromHtml should generate buffer', async () => {
    await service.onModuleInit();
    const buffer = await service['generatePdfFromHtml']('<html></html>');
    expect(buffer).toBeInstanceOf(Buffer);
  });

  // === Export Operational ===
  it('exportOperationalReportToPdf should generate PDF', async () => {
    operationalMock.getComplaintStatistics.mockResolvedValue({
      complaintsByCategory: [{ category: 'LOW', _count: { id: 1 } }],
      complaintsByStatus: [{ status: 'IN_PROGRESS', _count: { id: 1 } }],
      totalComplaints: 1,
    });
    operationalMock.getSecurityReportStatistics.mockResolvedValue({
      reportsByStatus: [{ status: 'IN_PROGRESS', _count: { id: 1 } }],
      totalSecurityReports: 1,
    });
    operationalMock.getUnitAndResidentStatistics.mockResolvedValue({
      totalResidents: 10,
      totalUnits: 5,
      unitsByStatus: [{ status: 'OCCUPIED', _count: { id: 5 } }],
    });

    await service.onModuleInit();
    const pdf = await service.exportOperationalReportToPdf({}, '');
    expect(pdf).toBeInstanceOf(Buffer);
  });

  // === Export Payments ===
  it('exportPaymentsReportToPdf should generate PDF', async () => {
    paymentsMock.getTotalRevenue.mockResolvedValue({
      totalPaid: 1000,
      totalOverdue: 200,
    });
    paymentsMock.getPaymentHistoryByMonth.mockResolvedValue([
      {
        paymentDate: new Date('2025-01-02'),
        amount: 500,
        resident: { user: { fullName: 'John' } },
        bill: { type: PaymentType.CICILAN_KPR },
      },
    ]);

    await service.onModuleInit();
    const pdf = await service.exportPaymentsReportToPdf({}, '');
    expect(pdf).toBeInstanceOf(Buffer);
  });
});
