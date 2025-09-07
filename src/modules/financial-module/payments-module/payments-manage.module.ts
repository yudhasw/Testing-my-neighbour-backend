import { Module } from '@nestjs/common';
import { PaymentsManageService } from '../payments-module/payments-manage.service';
import { PaymentsManageController } from './payments-manage.controller';
import { BillingManageModule } from '../billing-module/billing-manage.module';
import { ResidentManageModule } from '../../user-manage-module/resident-module/resident-manage.module';
import { UnitManageModule } from '../../unit-manage-module/unit-manage.module';
import { DatabaseService } from 'src/common/database/database.service';
import { GeneralHelper } from 'src/common/helper/generalHelper';
import { DatabaseModule } from 'src/common/database/database.module';

@Module({
  imports: [
    DatabaseModule,
    BillingManageModule,
    ResidentManageModule,
    UnitManageModule,
  ],
  controllers: [PaymentsManageController],
  providers: [PaymentsManageService, DatabaseService, GeneralHelper],
  exports: [PaymentsManageService],
})
export class PaymentsManageModule {}
