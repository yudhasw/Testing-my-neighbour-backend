import { OperationalReportService } from './operational-report.service';
import { OperationalReportFilterDto } from 'src/dtos/requests/operational-report-filter';
export declare class OperationalReportController {
    private readonly operationalReportService;
    constructor(operationalReportService: OperationalReportService);
    getComplaintStats(filter: OperationalReportFilterDto): Promise<{
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
    getSecurityReportStats(filter: OperationalReportFilterDto): Promise<{
        totalSecurityReports: number;
        reportsByStatus: (import("src/common/database/generated/prisma").Prisma.PickEnumerable<import("src/common/database/generated/prisma").Prisma.SecurityReportsGroupByOutputType, "status"[]> & {
            _count: {
                id: number;
            };
        })[];
    }>;
    getUnitResidentStats(): Promise<{
        totalResidents: number;
        totalUnits: number;
        unitsByStatus: (import("src/common/database/generated/prisma").Prisma.PickEnumerable<import("src/common/database/generated/prisma").Prisma.UnitsGroupByOutputType, "status"[]> & {
            _count: {
                id: number;
            };
        })[];
    }>;
}
