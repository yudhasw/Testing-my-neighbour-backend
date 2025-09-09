import { Module } from '@nestjs/common';
import { PaymentsReportService } from './payments-report.service';
import { PaymentsReportController } from './payments-report.controller';
import { PaymentsManageModule } from 'src/modules/financial-module/payments-module/payments-manage.module';
import { DatabaseModule } from 'src/common/database/database.module';
import { BillingManageModule } from 'src/modules/financial-module/billing-module/billing-manage.module';
import { DatabaseService } from 'src/common/database/database.service';

@Module({
  imports: [PaymentsManageModule, DatabaseModule, BillingManageModule],
  controllers: [PaymentsReportController],
  providers: [PaymentsReportService, DatabaseService],
  exports: [PaymentsReportService],
})
export class PaymentsReportModule {}
