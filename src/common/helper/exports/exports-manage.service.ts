import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as Handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';
import { OperationalReportFilterDto } from '../../../dtos/requests/operational-report-filter';
import { PaymentsReportFilterDto } from '../../../dtos/requests/payments-report-filter-dto';
import { OperationalReportService } from '../../../modules/reports-module/operational-report-module/operational-report.service';
import { PaymentsReportService } from '../../../modules/reports-module/payments-report-module/payments-report.service';
import {
  PdfOptions,
  ComplaintStatistic,
  StatusStatistic,
  ReportData,
  PaymentHistoryItem,
} from './export-interfaces';
@Injectable()
export class ExportsManageService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ExportsManageService.name);
  private browser: puppeteer.Browser | null = null;
  private readonly templatesPath = path.join(process.cwd(), '.', 'templates');

  constructor(
    private readonly operationalReportService: OperationalReportService,
    private readonly paymentsReportService: PaymentsReportService,
  ) {
    this.registerHandlebarsHelpers();
  }

  async onModuleInit(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
        ],
      });
      this.logger.log('Puppeteer browser initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Puppeteer browser:', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.logger.log('Puppeteer browser closed');
    }
  }

  private registerHandlebarsHelpers(): void {
    Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
    Handlebars.registerHelper('gte', (a: number, b: number) => a >= b);

    Handlebars.registerHelper('percentage', (value: number, total: number) => {
      if (total === 0) return 0;
      return Math.round((value / total) * 100);
    });
  }

  private async generatePdfFromHtml(
    html: string,
    options: PdfOptions = {},
  ): Promise<Buffer> {
    if (!this.browser) {
      throw new Error('Browser is not initialized');
    }

    const page = await this.browser.newPage();

    try {
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      const defaultOptions: puppeteer.PDFOptions = {
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          bottom: '20px',
          left: '20px',
          right: '20px',
        },
        ...options,
      };

      const pdf = await page.pdf(defaultOptions);
      return Buffer.from(pdf);
    } catch (error) {
      this.logger.error('Error generating PDF:', error);
      throw new Error(
        `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      await page.close();
    }
  }

  private async loadTemplate(templateName: string): Promise<string> {
    try {
      const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
      return await fs.readFile(templatePath, 'utf-8');
    } catch (error) {
      console.error((error as Error).message);
      this.logger.warn(
        `Failed to load template ${templateName}, using default template`,
      );
      return this.templatesPath;
    }
  }

  async exportOperationalReportToPdf(
    filter: OperationalReportFilterDto,
    template?: string,
  ): Promise<Buffer> {
    try {
      const [complaintStats, securityStats, unitResidentStats] =
        await Promise.all([
          this.operationalReportService.getComplaintStatistics(filter),
          this.operationalReportService.getSecurityReportStatistics(filter),
          this.operationalReportService.getUnitAndResidentStatistics(),
        ]);

      const totalComplaints = complaintStats.complaintsByCategory.reduce(
        (sum: number, item: ComplaintStatistic) => sum + item._count.id,
        0,
      );
      const totalComplaintsByStatus = complaintStats.complaintsByStatus.reduce(
        (sum: number, item: StatusStatistic) => sum + item._count.id,
        0,
      );
      const totalReportsByStatus = securityStats.reportsByStatus.reduce(
        (sum: number, item: StatusStatistic) => sum + item._count.id,
        0,
      );
      const totalUnitsByStatus = unitResidentStats.unitsByStatus.reduce(
        (sum: number, item: StatusStatistic) => sum + item._count.id,
        0,
      );

      const reportData: ReportData = {
        title: 'Laporan Operasional',
        generatedDate: new Date().toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        period: this.formatPeriod(filter.startDate, filter.endDate),

        totalComplaints,
        complaintsByCategory: complaintStats.complaintsByCategory.map(
          (item: ComplaintStatistic) => ({
            category: item.category,
            count: item._count.id,
            percentage:
              totalComplaints > 0
                ? Math.round((item._count.id / totalComplaints) * 100)
                : 0,
          }),
        ),
        complaintsByStatus: complaintStats.complaintsByStatus.map(
          (item: StatusStatistic) => ({
            status: item.status,
            count: item._count.id,
            percentage:
              totalComplaintsByStatus > 0
                ? Math.round((item._count.id / totalComplaintsByStatus) * 100)
                : 0,
          }),
        ),

        totalSecurityReports: securityStats.totalSecurityReports,
        reportsByStatus: securityStats.reportsByStatus.map(
          (item: StatusStatistic) => ({
            status: item.status,
            count: item._count.id,
            percentage:
              totalReportsByStatus > 0
                ? Math.round((item._count.id / totalReportsByStatus) * 100)
                : 0,
          }),
        ),

        totalResidents: unitResidentStats.totalResidents,
        totalUnits: unitResidentStats.totalUnits,
        unitsByStatus: unitResidentStats.unitsByStatus.map(
          (item: StatusStatistic) => ({
            status: item.status,
            count: item._count.id,
            percentage:
              totalUnitsByStatus > 0
                ? Math.round((item._count.id / totalUnitsByStatus) * 100)
                : 0,
          }),
        ),

        occupancyRate:
          unitResidentStats.totalUnits > 0
            ? Math.round(
                (unitResidentStats.totalResidents /
                  unitResidentStats.totalUnits) *
                  100,
              )
            : 0,
        averageComplaintsPerUnit:
          unitResidentStats.totalUnits > 0
            ? (totalComplaints / unitResidentStats.totalUnits).toFixed(1)
            : '0',
      };

      const htmlTemplate =
        template || (await this.loadTemplate('operational-report'));
      const compiledTemplate = Handlebars.compile(htmlTemplate);
      const html = compiledTemplate(reportData);

      return await this.generatePdfFromHtml(html);
    } catch (error) {
      this.logger.error('Failed to export operational report:', error);
      throw new Error(
        `Failed to export operational report: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async exportPaymentsReportToPdf(
    filter: PaymentsReportFilterDto,
    template?: string,
  ): Promise<Buffer> {
    try {
      // Get payment data
      const [revenueData, paymentHistory] = await Promise.all([
        this.paymentsReportService.getTotalRevenue(filter),
        this.paymentsReportService.getPaymentHistoryByMonth(filter),
      ]);

      // Process payment history dengan type safety
      const processedPaymentHistory = paymentHistory.map(
        (payment: PaymentHistoryItem) => ({
          date: new Date(payment.paymentDate).toLocaleDateString('id-ID'),
          amount: this.formatCurrency(payment.amount),
          residentName: payment.resident?.user?.fullName || 'N/A',
          billType: payment.bill?.type || 'N/A',
          unitNumber: payment.resident?.unit?.number || 'N/A',
          paymentMethod: payment.paymentMethod || 'Transfer Bank',
          status: payment.status?.toLowerCase() || 'paid',
          statusLabel: this.getStatusLabel(payment.status),
          isLatePayment: this.isLatePayment(payment),
        }),
      );

      // Group payments by month dengan perhitungan yang lebih detail
      const paymentsByMonth = this.groupPaymentsByMonth(paymentHistory);

      // Calculate totals
      const totalAmount = revenueData.totalPaid + revenueData.totalOverdue;
      const totalTransactions = paymentHistory.length;

      // Prepare data untuk template
      const reportData: ReportData = {
        title: 'Laporan Pembayaran',
        generatedDate: new Date().toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        period: this.formatPeriod(filter.startDate, filter.endDate),

        // Revenue summary
        totalPaid: this.formatCurrency(revenueData.totalPaid),
        totalOverdue: this.formatCurrency(revenueData.totalOverdue),

        // Percentages
        paidPercentage:
          totalAmount > 0
            ? Math.round((revenueData.totalPaid / totalAmount) * 100)
            : 0,
        overduePercentage:
          totalAmount > 0
            ? Math.round((revenueData.totalOverdue / totalAmount) * 100)
            : 0,
        collectionRate:
          totalAmount > 0
            ? Math.round((revenueData.totalPaid / totalAmount) * 100)
            : 0,

        // Payment history
        paymentHistory: processedPaymentHistory,

        // Monthly summary
        monthlyPayments: paymentsByMonth,

        // Totals
        totalTransactions,
        grandTotal: this.formatCurrency(revenueData.totalPaid),
        overallAverage:
          totalTransactions > 0
            ? this.formatCurrency(revenueData.totalPaid / totalTransactions)
            : this.formatCurrency(0),
        overallCollectionRate:
          totalAmount > 0
            ? Math.round((revenueData.totalPaid / totalAmount) * 100)
            : 0,

        // Analysis data
        paymentsByBillType: this.analyzePaymentsByBillType(paymentHistory),
        paymentsByMethod: this.analyzePaymentsByMethod(paymentHistory),
      };

      // Load template
      const htmlTemplate =
        template || (await this.loadTemplate('payments-report'));
      const compiledTemplate = Handlebars.compile(htmlTemplate);
      const html = compiledTemplate(reportData);

      return await this.generatePdfFromHtml(html);
    } catch (error) {
      this.logger.error('Failed to export payment report:', error);
      throw new Error(
        `Failed to export payment report: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // Helper methods dengan type safety yang lebih baik
  private formatPeriod(startDate?: string, endDate?: string): string {
    if (!startDate && !endDate) return 'Semua periode';
    if (!startDate)
      return `Sampai ${new Date(endDate as string).toLocaleDateString('id-ID')}`;
    if (!endDate)
      return `Dari ${new Date(startDate).toLocaleDateString('id-ID')}`;
    return `${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}`;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  private groupPaymentsByMonth(payments: PaymentHistoryItem[]): Array<{
    month: string;
    total: string;
    count: number;
    average: string;
    collectionRate: number;
  }> {
    const grouped = payments.reduce(
      (
        acc: Record<string, { month: string; total: number; count: number }>,
        payment,
      ) => {
        const month = new Date(payment.paymentDate).toLocaleDateString(
          'id-ID',
          {
            year: 'numeric',
            month: 'long',
          },
        );

        if (!acc[month]) {
          acc[month] = { month, total: 0, count: 0 };
        }

        acc[month].total += payment.amount;
        acc[month].count++;

        return acc;
      },
      {},
    );

    return Object.values(grouped).map((item) => ({
      month: item.month,
      total: this.formatCurrency(item.total),
      count: item.count,
      average: this.formatCurrency(
        item.count > 0 ? item.total / item.count : 0,
      ),
      collectionRate: Math.round(Math.random() * 20 + 80), // Placeholder - ganti dengan logika sebenarnya
    }));
  }

  private getStatusLabel(status?: string): string {
    const statusLabels: Record<string, string> = {
      PAID: 'Lunas',
      PENDING: 'Tertunda',
      OVERDUE: 'Terlambat',
      CANCELLED: 'Dibatalkan',
    };
    return statusLabels[status?.toUpperCase() || 'PAID'] || 'Lunas';
  }

  private isLatePayment(payment: PaymentHistoryItem): boolean {
    const paymentDate = new Date(payment.paymentDate);
    const dueDate = new Date(payment.bill?.dueDate || payment.paymentDate);
    return paymentDate > dueDate;
  }

  private analyzePaymentsByBillType(payments: PaymentHistoryItem[]): Array<{
    billType: string;
    count: number;
    total: string;
    percentage: number;
  }> {
    const analysis = payments.reduce(
      (acc: Record<string, { count: number; total: number }>, payment) => {
        const billType = payment.bill?.type || 'Lainnya';
        if (!acc[billType]) {
          acc[billType] = { count: 0, total: 0 };
        }
        acc[billType].count++;
        acc[billType].total += payment.amount;
        return acc;
      },
      {},
    );

    const totalAmount = Object.values(analysis).reduce(
      (sum, item) => sum + item.total,
      0,
    );

    return Object.entries(analysis).map(([billType, data]) => ({
      billType,
      count: data.count,
      total: this.formatCurrency(data.total),
      percentage:
        totalAmount > 0 ? Math.round((data.total / totalAmount) * 100) : 0,
    }));
  }

  private analyzePaymentsByMethod(payments: PaymentHistoryItem[]): Array<{
    method: string;
    count: number;
    total: string;
    percentage: number;
  }> {
    const analysis = payments.reduce(
      (acc: Record<string, { count: number; total: number }>, payment) => {
        const method = payment.paymentMethod || 'Transfer Bank';
        if (!acc[method]) {
          acc[method] = { count: 0, total: 0 };
        }
        acc[method].count++;
        acc[method].total += payment.amount;
        return acc;
      },
      {},
    );

    const totalAmount = Object.values(analysis).reduce(
      (sum, item) => sum + item.total,
      0,
    );

    return Object.entries(analysis).map(([method, data]) => ({
      method,
      count: data.count,
      total: this.formatCurrency(data.total),
      percentage:
        totalAmount > 0 ? Math.round((data.total / totalAmount) * 100) : 0,
    }));
  }
}
