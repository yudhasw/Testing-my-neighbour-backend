import { DatabaseService } from 'src/common/database/database.service';
import { PaymentsReportFilterDto } from 'src/dtos/requests/payments-report-filter-dto';
export declare class PaymentsReportService {
    private readonly prisma;
    constructor(prisma: DatabaseService);
    getTotalRevenue(filter: PaymentsReportFilterDto): Promise<{
        totalPaid: number;
        totalOverdue: number;
    }>;
    getPaymentHistoryByMonth(filter: PaymentsReportFilterDto): Promise<{
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
    private buildWhereClause;
}
