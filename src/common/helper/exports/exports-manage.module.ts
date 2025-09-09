import { Module } from '@nestjs/common';
import { ExportsManageService } from './exports-manage.service';
import { ReportsManageModule } from '../../../modules/reports-module/reports-manage.module';

@Module({
  imports: [ReportsManageModule],
  providers: [ExportsManageService],
  exports: [ExportsManageService],
})
export class ExportsManageModule {}
