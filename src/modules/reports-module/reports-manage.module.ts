import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { UnitManageModule } from '../unit-manage-module/unit-manage.module';
import { UsersManageModule } from '../user-manage-module/users-manage.module';
import { SecurityManageModule } from '../security-module/security-manage.module';
import { OperationalReportModule } from './operational-report-module/operational-report.module';
import { PaymentsReportModule } from './payments-report-module/payments-report.module';
import { RequestManageModule } from '../request-module/request-manage.module';
import { CommunicationModule } from '../communication-module/communication.module';
import { ContactManageModule } from '../contact-module/contact-manage.module';
import { FinancialModule } from '../financial-module/financial.module';

@Module({
  imports: [
    DatabaseModule,
    UnitManageModule,
    RequestManageModule,
    UsersManageModule,
    SecurityManageModule,
    OperationalReportModule,
    ContactManageModule,
    CommunicationModule,
    FinancialModule,
  ],
  exports: [OperationalReportModule, PaymentsReportModule],
})
export class ReportsManageModule {}
