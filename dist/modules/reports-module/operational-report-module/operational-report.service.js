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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationalReportService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../../common/database/database.service");
let OperationalReportService = class OperationalReportService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getComplaintStatistics(filter) {
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
    async getSecurityReportStatistics(filter) {
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
    buildWhereClause(filter) {
        const where = {};
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
};
exports.OperationalReportService = OperationalReportService;
exports.OperationalReportService = OperationalReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], OperationalReportService);
//# sourceMappingURL=operational-report.service.js.map