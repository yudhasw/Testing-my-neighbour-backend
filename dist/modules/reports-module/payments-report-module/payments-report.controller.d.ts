import { PaymentsReportService } from './payments-report.service';
import { PaymentsReportFilterDto } from '../../../dtos/requests/payments-report-filter-dto';
export declare class PaymentsReportController {
    private readonly paymentsReportService;
    constructor(paymentsReportService: PaymentsReportService);
    getTotalRevenue(filter: PaymentsReportFilterDto): Promise<{
        totalPaid: number;
        totalOverdue: number;
    }>;
    getPaymentHistory(filter: PaymentsReportFilterDto): Promise<{
        amount: number;
        paymentDate: Date;
        resident: {
            user: {
                fullName: string;
            };
        };
        bill: {
            type: import("src/common/database/generated/prisma").$Enums.PaymentType;
        } | null;
    }[]>;
}
