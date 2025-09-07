import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { BillingManageModule } from './billing-module/billing-manage.module';
import { PaymentsManageModule } from './payments-module/payments-manage.module';

@Module({
  imports: [DatabaseModule, BillingManageModule, PaymentsManageModule],
  exports: [BillingManageModule, PaymentsManageModule],
})
export class FinancialModule {}
