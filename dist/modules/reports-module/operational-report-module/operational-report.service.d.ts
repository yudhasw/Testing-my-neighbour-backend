import { DatabaseService } from 'src/common/database/database.service';
import { OperationalReportFilterDto } from 'src/dtos/requests/operational-report-filter';
export declare class OperationalReportService {
    private readonly prisma;
    constructor(prisma: DatabaseService);
    getComplaintStatistics(filter: OperationalReportFilterDto): Promise<{
        totalComplaints: number;
        complaintsByCategory: (import("src/common/database/generated/prisma").Prisma.PickEnumerable<import("src/common/database/generated/prisma").Prisma.ComplaintsGroupByOutputType, "category"[]> & {
            _count: {
                id: number;
            };
        })[];
        complaintsByStatus: (import("src/common/database/generated/prisma").Prisma.PickEnumerable<import("src/common/database/generated/prisma").Prisma.ComplaintsGroupByOutputType, "status"[]> & {
            _count: {
                id: number;
            };
        })[];
    }>;
    getSecurityReportStatistics(filter: OperationalReportFilterDto): Promise<{
        totalSecurityReports: number;
        reportsByStatus: (import("src/common/database/generated/prisma").Prisma.PickEnumerable<import("src/common/database/generated/prisma").Prisma.SecurityReportsGroupByOutputType, "status"[]> & {
            _count: {
                id: number;
            };
        })[];
    }>;
    getUnitAndResidentStatistics(): Promise<{
        totalResidents: number;
        totalUnits: number;
        unitsByStatus: (import("src/common/database/generated/prisma").Prisma.PickEnumerable<import("src/common/database/generated/prisma").Prisma.UnitsGroupByOutputType, "status"[]> & {
            _count: {
                id: number;
            };
        })[];
    }>;
    private buildWhereClause;
}
