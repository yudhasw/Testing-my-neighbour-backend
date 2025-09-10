import { Module } from '@nestjs/common';
import { ResidentManageService } from './resident-manage.service';
import { ResidentManageController } from './resident-manage.controller';
import { DatabaseModule } from '../../../common/database/database.module';
import { DatabaseService } from '../../../common/database/database.service';
import { GeneralHelper } from '../../../common/helper/generalHelper';
import { FamilyApprovalManageModule } from './familyApproval-module/family-approval-manage.module';
import { FamilyCodeManageModule } from './familyCode-module/family-code-manage.module';

@Module({
  imports: [DatabaseModule, FamilyApprovalManageModule, FamilyCodeManageModule],
  controllers: [ResidentManageController],
  providers: [ResidentManageService, DatabaseService, GeneralHelper],
  exports: [ResidentManageService],
})
export class ResidentManageModule {}
