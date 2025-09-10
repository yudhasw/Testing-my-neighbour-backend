/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/common/database/database.service';
import { PaymentStatus } from 'src/common/database/generated/prisma';
import { PaymentsReportFilterDto } from 'src/dtos/requests/payments-report-filter-dto';

@Injectable()
export class PaymentsReportService {
  constructor(private readonly prisma: DatabaseService) {}

  async getTotalRevenue(filter: PaymentsReportFilterDto) {
    const whereClause = this.buildWhereClause(filter);

    const totalPaid = await this.prisma.payments.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        ...whereClause,
        status: PaymentStatus.PAID,
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

  async getPaymentHistoryByMonth(filter: PaymentsReportFilterDto) {
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

  private buildWhereClause(filter: PaymentsReportFilterDto) {
    const where: any = {};
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
}
