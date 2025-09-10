import { UserRole } from '../../common/database/generated/prisma';
export declare class OperationalReportFilterDto {
    readonly startDate?: string;
    readonly endDate?: string;
    readonly userRole?: UserRole;
    readonly unitStatus?: string;
}
