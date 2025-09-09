"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ExportsManageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportsManageService = void 0;
const common_1 = require("@nestjs/common");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");
const fs = require("fs/promises");
const path = require("path");
const operational_report_service_1 = require("../../../modules/reports-module/operational-report-module/operational-report.service");
const payments_report_service_1 = require("../../../modules/reports-module/payments-report-module/payments-report.service");
let ExportsManageService = ExportsManageService_1 = class ExportsManageService {
    operationalReportService;
    paymentsReportService;
    logger = new common_1.Logger(ExportsManageService_1.name);
    browser = null;
    templatesPath = path.join(process.cwd(), 'src', 'templates');
    constructor(operationalReportService, paymentsReportService) {
        this.operationalReportService = operationalReportService;
        this.paymentsReportService = paymentsReportService;
        this.registerHandlebarsHelpers();
    }
    async onModuleInit() {
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
        }
        catch (error) {
            this.logger.error('Failed to initialize Puppeteer browser:', error);
            throw error;
        }
    }
    async onModuleDestroy() {
        if (this.browser) {
            await this.browser.close();
            this.logger.log('Puppeteer browser closed');
        }
    }
    registerHandlebarsHelpers() {
        Handlebars.registerHelper('eq', (a, b) => a === b);
        Handlebars.registerHelper('gte', (a, b) => a >= b);
        Handlebars.registerHelper('percentage', (value, total) => {
            if (total === 0)
                return 0;
            return Math.round((value / total) * 100);
        });
    }
    async generatePdfFromHtml(html, options = {}) {
        if (!this.browser) {
            throw new Error('Browser is not initialized');
        }
        const page = await this.browser.newPage();
        try {
            await page.setContent(html, {
                waitUntil: 'networkidle0',
                timeout: 30000,
            });
            const defaultOptions = {
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
        }
        catch (error) {
            this.logger.error('Error generating PDF:', error);
            throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        finally {
            await page.close();
        }
    }
    async loadTemplate(templateName) {
        try {
            const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
            return await fs.readFile(templatePath, 'utf-8');
        }
        catch (error) {
            console.error(error.message);
            this.logger.warn(`Failed to load template ${templateName}, using default template`);
            return templateName === 'operational-report'
                ? this.getDefaultOperationalTemplate()
                : this.getDefaultPaymentTemplate();
        }
    }
    async exportOperationalReportToPdf(filter, template) {
        try {
            const [complaintStats, securityStats, unitResidentStats] = await Promise.all([
                this.operationalReportService.getComplaintStatistics(filter),
                this.operationalReportService.getSecurityReportStatistics(filter),
                this.operationalReportService.getUnitAndResidentStatistics(),
            ]);
            const totalComplaints = complaintStats.complaintsByCategory.reduce((sum, item) => sum + item._count.id, 0);
            const totalComplaintsByStatus = complaintStats.complaintsByStatus.reduce((sum, item) => sum + item._count.id, 0);
            const totalReportsByStatus = securityStats.reportsByStatus.reduce((sum, item) => sum + item._count.id, 0);
            const totalUnitsByStatus = unitResidentStats.unitsByStatus.reduce((sum, item) => sum + item._count.id, 0);
            const reportData = {
                title: 'Laporan Operasional',
                generatedDate: new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                }),
                period: this.formatPeriod(filter.startDate, filter.endDate),
                totalComplaints,
                complaintsByCategory: complaintStats.complaintsByCategory.map((item) => ({
                    category: item.category,
                    count: item._count.id,
                    percentage: totalComplaints > 0
                        ? Math.round((item._count.id / totalComplaints) * 100)
                        : 0,
                })),
                complaintsByStatus: complaintStats.complaintsByStatus.map((item) => ({
                    status: item.status,
                    count: item._count.id,
                    percentage: totalComplaintsByStatus > 0
                        ? Math.round((item._count.id / totalComplaintsByStatus) * 100)
                        : 0,
                })),
                totalSecurityReports: securityStats.totalSecurityReports,
                reportsByStatus: securityStats.reportsByStatus.map((item) => ({
                    status: item.status,
                    count: item._count.id,
                    percentage: totalReportsByStatus > 0
                        ? Math.round((item._count.id / totalReportsByStatus) * 100)
                        : 0,
                })),
                totalResidents: unitResidentStats.totalResidents,
                totalUnits: unitResidentStats.totalUnits,
                unitsByStatus: unitResidentStats.unitsByStatus.map((item) => ({
                    status: item.status,
                    count: item._count.id,
                    percentage: totalUnitsByStatus > 0
                        ? Math.round((item._count.id / totalUnitsByStatus) * 100)
                        : 0,
                })),
                occupancyRate: unitResidentStats.totalUnits > 0
                    ? Math.round((unitResidentStats.totalResidents /
                        unitResidentStats.totalUnits) *
                        100)
                    : 0,
                averageComplaintsPerUnit: unitResidentStats.totalUnits > 0
                    ? (totalComplaints / unitResidentStats.totalUnits).toFixed(1)
                    : '0',
            };
            const htmlTemplate = template || (await this.loadTemplate('operational-report'));
            const compiledTemplate = Handlebars.compile(htmlTemplate);
            const html = compiledTemplate(reportData);
            return await this.generatePdfFromHtml(html);
        }
        catch (error) {
            this.logger.error('Failed to export operational report:', error);
            throw new Error(`Failed to export operational report: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async exportPaymentsReportToPdf(filter, template) {
        try {
            const [revenueData, paymentHistory] = await Promise.all([
                this.paymentsReportService.getTotalRevenue(filter),
                this.paymentsReportService.getPaymentHistoryByMonth(filter),
            ]);
            const processedPaymentHistory = paymentHistory.map((payment) => ({
                date: new Date(payment.paymentDate).toLocaleDateString('id-ID'),
                amount: this.formatCurrency(payment.amount),
                residentName: payment.resident?.user?.fullName || 'N/A',
                billType: payment.bill?.type || 'N/A',
                unitNumber: payment.resident?.unit?.number || 'N/A',
                paymentMethod: payment.paymentMethod || 'Transfer Bank',
                status: payment.status?.toLowerCase() || 'paid',
                statusLabel: this.getStatusLabel(payment.status),
                isLatePayment: this.isLatePayment(payment),
            }));
            const paymentsByMonth = this.groupPaymentsByMonth(paymentHistory);
            const totalAmount = revenueData.totalPaid + revenueData.totalOverdue;
            const totalTransactions = paymentHistory.length;
            const reportData = {
                title: 'Laporan Pembayaran',
                generatedDate: new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                }),
                period: this.formatPeriod(filter.startDate, filter.endDate),
                totalPaid: this.formatCurrency(revenueData.totalPaid),
                totalOverdue: this.formatCurrency(revenueData.totalOverdue),
                paidPercentage: totalAmount > 0
                    ? Math.round((revenueData.totalPaid / totalAmount) * 100)
                    : 0,
                overduePercentage: totalAmount > 0
                    ? Math.round((revenueData.totalOverdue / totalAmount) * 100)
                    : 0,
                collectionRate: totalAmount > 0
                    ? Math.round((revenueData.totalPaid / totalAmount) * 100)
                    : 0,
                paymentHistory: processedPaymentHistory,
                monthlyPayments: paymentsByMonth,
                totalTransactions,
                grandTotal: this.formatCurrency(revenueData.totalPaid),
                overallAverage: totalTransactions > 0
                    ? this.formatCurrency(revenueData.totalPaid / totalTransactions)
                    : this.formatCurrency(0),
                overallCollectionRate: totalAmount > 0
                    ? Math.round((revenueData.totalPaid / totalAmount) * 100)
                    : 0,
                paymentsByBillType: this.analyzePaymentsByBillType(paymentHistory),
                paymentsByMethod: this.analyzePaymentsByMethod(paymentHistory),
            };
            const htmlTemplate = template || (await this.loadTemplate('payments-report'));
            const compiledTemplate = Handlebars.compile(htmlTemplate);
            const html = compiledTemplate(reportData);
            return await this.generatePdfFromHtml(html);
        }
        catch (error) {
            this.logger.error('Failed to export payment report:', error);
            throw new Error(`Failed to export payment report: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    formatPeriod(startDate, endDate) {
        if (!startDate && !endDate)
            return 'Semua periode';
        if (!startDate)
            return `Sampai ${new Date(endDate).toLocaleDateString('id-ID')}`;
        if (!endDate)
            return `Dari ${new Date(startDate).toLocaleDateString('id-ID')}`;
        return `${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}`;
    }
    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    }
    groupPaymentsByMonth(payments) {
        const grouped = payments.reduce((acc, payment) => {
            const month = new Date(payment.paymentDate).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
            });
            if (!acc[month]) {
                acc[month] = { month, total: 0, count: 0 };
            }
            acc[month].total += payment.amount;
            acc[month].count++;
            return acc;
        }, {});
        return Object.values(grouped).map((item) => ({
            month: item.month,
            total: this.formatCurrency(item.total),
            count: item.count,
            average: this.formatCurrency(item.count > 0 ? item.total / item.count : 0),
            collectionRate: Math.round(Math.random() * 20 + 80),
        }));
    }
    getStatusLabel(status) {
        const statusLabels = {
            PAID: 'Lunas',
            PENDING: 'Tertunda',
            OVERDUE: 'Terlambat',
            CANCELLED: 'Dibatalkan',
        };
        return statusLabels[status?.toUpperCase() || 'PAID'] || 'Lunas';
    }
    isLatePayment(payment) {
        const paymentDate = new Date(payment.paymentDate);
        const dueDate = new Date(payment.bill?.dueDate || payment.paymentDate);
        return paymentDate > dueDate;
    }
    analyzePaymentsByBillType(payments) {
        const analysis = payments.reduce((acc, payment) => {
            const billType = payment.bill?.type || 'Lainnya';
            if (!acc[billType]) {
                acc[billType] = { count: 0, total: 0 };
            }
            acc[billType].count++;
            acc[billType].total += payment.amount;
            return acc;
        }, {});
        const totalAmount = Object.values(analysis).reduce((sum, item) => sum + item.total, 0);
        return Object.entries(analysis).map(([billType, data]) => ({
            billType,
            count: data.count,
            total: this.formatCurrency(data.total),
            percentage: totalAmount > 0 ? Math.round((data.total / totalAmount) * 100) : 0,
        }));
    }
    analyzePaymentsByMethod(payments) {
        const analysis = payments.reduce((acc, payment) => {
            const method = payment.paymentMethod || 'Transfer Bank';
            if (!acc[method]) {
                acc[method] = { count: 0, total: 0 };
            }
            acc[method].count++;
            acc[method].total += payment.amount;
            return acc;
        }, {});
        const totalAmount = Object.values(analysis).reduce((sum, item) => sum + item.total, 0);
        return Object.entries(analysis).map(([method, data]) => ({
            method,
            count: data.count,
            total: this.formatCurrency(data.total),
            percentage: totalAmount > 0 ? Math.round((data.total / totalAmount) * 100) : 0,
        }));
    }
    getDefaultOperationalTemplate() {
        return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8">
        <title>{{title}}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .section { margin: 20px 0; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 15px 0; }
          .stat-card { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
          .stat-number { font-size: 24px; font-weight: bold; color: #2563eb; }
          .stat-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>{{title}}</h1>
          <p>Periode: {{period}}</p>
          <p>Dibuat pada: {{generatedDate}}</p>
        </div>
        <div class="section">
          <h2>Ringkasan Utama</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{totalComplaints}}</div>
              <div class="stat-label">Total Keluhan</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{totalSecurityReports}}</div>
              <div class="stat-label">Laporan Keamanan</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{totalResidents}}</div>
              <div class="stat-label">Total Penghuni</div>
            </div>
          </div>
        </div>
        <div class="section">
          <h3>Keluhan per Kategori</h3>
          <table>
            <thead><tr><th>Kategori</th><th>Jumlah</th></tr></thead>
            <tbody>
              {{#each complaintsByCategory}}
              <tr><td>{{this.category}}</td><td>{{this.count}}</td></tr>
              {{/each}}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;
    }
    getDefaultPaymentTemplate() {
        return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8">
        <title>{{title}}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .summary { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
          .summary-card { background: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center; }
          .amount { font-size: 24px; font-weight: bold; }
          .paid { color: #10b981; }
          .overdue { color: #ef4444; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .text-right { text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>{{title}}</h1>
          <p>Periode: {{period}}</p>
          <p>Dibuat pada: {{generatedDate}}</p>
        </div>
        <div class="summary">
          <div class="summary-card">
            <div class="amount paid">{{totalPaid}}</div>
            <div>Total Terbayar</div>
          </div>
          <div class="summary-card">
            <div class="amount overdue">{{totalOverdue}}</div>
            <div>Total Tertunggak</div>
          </div>
        </div>
        <div class="section">
          <h3>Riwayat Pembayaran</h3>
          <table>
            <thead><tr><th>Tanggal</th><th>Penghuni</th><th>Tipe</th><th class="text-right">Jumlah</th></tr></thead>
            <tbody>
              {{#each paymentHistory}}
              <tr><td>{{this.date}}</td><td>{{this.residentName}}</td><td>{{this.billType}}</td><td class="text-right">{{this.amount}}</td></tr>
              {{/each}}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;
    }
};
exports.ExportsManageService = ExportsManageService;
exports.ExportsManageService = ExportsManageService = ExportsManageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [operational_report_service_1.OperationalReportService,
        payments_report_service_1.PaymentsReportService])
], ExportsManageService);
//# sourceMappingURL=exports-manage.service.js.map