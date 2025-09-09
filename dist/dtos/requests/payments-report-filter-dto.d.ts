import { PaymentStatus, PaymentType } from '../../common/database/generated/prisma';
export declare class PaymentsReportFilterDto {
    readonly startDate?: string;
    readonly endDate?: string;
    readonly status?: PaymentStatus;
    readonly paymentType?: PaymentType;
}
