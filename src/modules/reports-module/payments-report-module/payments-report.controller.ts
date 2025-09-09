import { Controller, Get, Query } from '@nestjs/common';
import { PaymentsReportService } from './payments-report.service';
import { PaymentsReportFilterDto } from '../../../dtos/requests/payments-report-filter-dto';

@Controller()
export class PaymentsReportController {
  constructor(private readonly paymentsReportService: PaymentsReportService) {}
  @Get('revenue')
  getTotalRevenue(@Query() filter: PaymentsReportFilterDto) {
    return this.paymentsReportService.getTotalRevenue(filter);
  }

  @Get('history')
  getPaymentHistory(@Query() filter: PaymentsReportFilterDto) {
    return this.paymentsReportService.getPaymentHistoryByMonth(filter);
  }
}
