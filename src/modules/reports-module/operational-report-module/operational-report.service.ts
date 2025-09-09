/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/common/database/database.service';
import { OperationalReportFilterDto } from 'src/dtos/requests/operational-report-filter';

@Injectable()
export class OperationalReportService {
  constructor(private readonly prisma: DatabaseService) {}

  async getComplaintStatistics(filter: OperationalReportFilterDto) {
    const whereClause = this.buildWhereClause(filter);

    const totalComplaints = await this.prisma.complaints.count({
      where: whereClause,
    });
    const complaintsByCategory = await this.prisma.complaints.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
      where: whereClause,
    });
    const complaintsByStatus = await this.prisma.complaints.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
      where: whereClause,
    });

    return {
      totalComplaints,
      complaintsByCategory,
      complaintsByStatus,
    };
  }

  async getSecurityReportStatistics(filter: OperationalReportFilterDto) {
    const whereClause = this.buildWhereClause(filter);

    const totalSecurityReports = await this.prisma.securityReports.count({
      where: whereClause,
    });
    const reportsByStatus = await this.prisma.securityReports.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
      where: whereClause,
    });

    return {
      totalSecurityReports,
      reportsByStatus,
    };
  }

  async getUnitAndResidentStatistics() {
    const totalResidents = await this.prisma.residents.count();
    const totalUnits = await this.prisma.units.count();
    const unitsByStatus = await this.prisma.units.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    return {
      totalResidents,
      totalUnits,
      unitsByStatus,
    };
  }

  private buildWhereClause(filter: OperationalReportFilterDto) {
    const where: any = {};
    if (filter.startDate) {
      where.createdAt = { gte: new Date(filter.startDate) };
    }
    if (filter.endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(filter.endDate) };
    }
    if (filter.unitStatus) {
      where.unit = { status: filter.unitStatus };
    }
    return where;
  }
}
