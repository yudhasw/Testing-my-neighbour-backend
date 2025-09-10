import { Module } from '@nestjs/common';
import { OperationalReportService } from './operational-report.service';
import { OperationalReportController } from './operational-report.controller';
import { UsersManageModule } from 'src/modules/user-manage-module/users-manage.module';
import { CommunicationModule } from 'src/modules/communication-module/communication.module';
import { SecurityManageModule } from 'src/modules/security-module/security-manage.module';
import { RequestManageModule } from 'src/modules/request-module/request-manage.module';
import { UnitManageModule } from 'src/modules/unit-manage-module/unit-manage.module';
import { DatabaseModule } from 'src/common/database/database.module';
import { DatabaseService } from 'src/common/database/database.service';

@Module({
  imports: [
    DatabaseModule,
    UsersManageModule,
    CommunicationModule,
    UnitManageModule,
    RequestManageModule,
    SecurityManageModule,
    SecurityManageModule,
  ],
  controllers: [OperationalReportController],
  providers: [OperationalReportService, DatabaseService],
  exports: [OperationalReportService],
})
export class OperationalReportModule {}
