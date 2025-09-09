import { Controller, Get, Query } from '@nestjs/common';
import { OperationalReportService } from './operational-report.service';
import { OperationalReportFilterDto } from 'src/dtos/requests/operational-report-filter';

@Controller()
export class OperationalReportController {
  constructor(
    private readonly operationalReportService: OperationalReportService,
  ) {}

  @Get('complaints/stats')
  getComplaintStats(@Query() filter: OperationalReportFilterDto) {
    return this.operationalReportService.getComplaintStatistics(filter);
  }

  @Get('security-reports/stats')
  getSecurityReportStats(@Query() filter: OperationalReportFilterDto) {
    return this.operationalReportService.getSecurityReportStatistics(filter);
  }

  @Get('units-residents/stats')
  getUnitResidentStats() {
    return this.operationalReportService.getUnitAndResidentStatistics();
  }
}
