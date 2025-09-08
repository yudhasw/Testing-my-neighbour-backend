import { Module } from '@nestjs/common';
import { FamilyApprovalManageService } from './family-approval-manage.service';
import { FamilyApprovalManageController } from './family-approval-manage.controller';
import { DatabaseModule } from 'src/common/database/database.module';
import { UsersManageModule } from '../../users-manage.module';
import { DatabaseService } from 'src/common/database/database.service';

@Module({
  imports: [DatabaseModule, UsersManageModule],
  controllers: [FamilyApprovalManageController],
  providers: [FamilyApprovalManageService, DatabaseService],
  exports: [FamilyApprovalManageService],
})
export class FamilyApprovalManageModule {}
