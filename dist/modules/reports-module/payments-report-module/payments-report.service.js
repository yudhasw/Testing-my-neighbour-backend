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
exports.PaymentsReportService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../../common/database/database.service");
const prisma_1 = require("../../../common/database/generated/prisma/index.js");
let PaymentsReportService = class PaymentsReportService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTotalRevenue(filter) {
        const whereClause = this.buildWhereClause(filter);
        const totalPaid = await this.prisma.payments.aggregate({
            _sum: {
                amount: true,
            },
            where: {
                ...whereClause,
                status: prisma_1.PaymentStatus.PAID,
            },
        });
        const totalOverdue = await this.prisma.bills.aggregate({
            _sum: {
                amount: true,
            },
            where: {
                ...whereClause,
                isPaid: false,
                dueDate: {
                    lt: new Date(),
                },
            },
        });
        return {
            totalPaid: totalPaid._sum.amount || 0,
            totalOverdue: totalOverdue._sum.amount || 0,
        };
    }
    async getPaymentHistoryByMonth(filter) {
        const payments = await this.prisma.payments.findMany({
            where: this.buildWhereClause(filter),
            select: {
                paymentDate: true,
                amount: true,
                resident: {
                    select: { user: { select: { fullName: true } } },
                },
                bill: {
                    select: { type: true },
                },
            },
            orderBy: {
                paymentDate: 'asc',
            },
        });
        return payments;
    }
    buildWhereClause(filter) {
        const where = {};
        if (filter.startDate) {
            where.paymentDate = { gte: new Date(filter.startDate) };
        }
        if (filter.endDate) {
            where.paymentDate = {
                ...where.paymentDate,
                lte: new Date(filter.endDate),
            };
        }
        if (filter.status) {
            where.status = filter.status;
        }
        if (filter.paymentType) {
            where.bill = { type: filter.paymentType };
        }
        return where;
    }
};
exports.PaymentsReportService = PaymentsReportService;
exports.PaymentsReportService = PaymentsReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], PaymentsReportService);
//# sourceMappingURL=payments-report.service.js.map