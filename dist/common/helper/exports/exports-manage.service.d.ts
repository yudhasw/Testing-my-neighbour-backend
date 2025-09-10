import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { OperationalReportFilterDto } from '../../../dtos/requests/operational-report-filter';
import { PaymentsReportFilterDto } from '../../../dtos/requests/payments-report-filter-dto';
import { OperationalReportService } from '../../../modules/reports-module/operational-report-module/operational-report.service';
import { PaymentsReportService } from '../../../modules/reports-module/payments-report-module/payments-report.service';
export declare class ExportsManageService implements OnModuleInit, OnModuleDestroy {
    private readonly operationalReportService;
    private readonly paymentsReportService;
    private readonly logger;
    private browser;
    private readonly templatesPath;
    constructor(operationalReportService: OperationalReportService, paymentsReportService: PaymentsReportService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private registerHandlebarsHelpers;
    private generatePdfFromHtml;
    private loadTemplate;
    exportOperationalReportToPdf(filter: OperationalReportFilterDto, template?: string): Promise<Buffer>;
    exportPaymentsReportToPdf(filter: PaymentsReportFilterDto, template?: string): Promise<Buffer>;
    private formatPeriod;
    private formatCurrency;
    private groupPaymentsByMonth;
    private getStatusLabel;
    private isLatePayment;
    private analyzePaymentsByBillType;
    private analyzePaymentsByMethod;
    private getDefaultOperationalTemplate;
    private getDefaultPaymentTemplate;
}
