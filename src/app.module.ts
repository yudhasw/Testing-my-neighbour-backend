import { RouterModule } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BackendApiModule } from './modules/backend-api.module';
import { AuthModule } from './common/security/auth/auth.module';
import { MailerManageModule } from './common/helper/mail/mailer-manage.module';
import { DatabaseModule } from './common/database/database.module';
import { FinancialModule } from './modules/financial-module/financial.module';
import { CommunicationModule } from './modules/communication-module/communication.module';
import { ContactManageModule } from './modules/contact-module/contact-manage.module';
import { SecurityManageModule } from './modules/security-module/security-manage.module';
import { UnitManageModule } from './modules/unit-manage-module/unit-manage.module';
import { UsersManageModule } from './modules/user-manage-module/users-manage.module';
import { AnnouncementManageModule } from './modules/communication-module/announcement-module/announcement-manage.module';
import { ForumCommentManageModule } from './modules/communication-module/forum-comment-module/forum-comment-manage.module';
import { ForumPostManageModule } from './modules/communication-module/forum-post-module/forum-post-manage.module';
import { BillingManageModule } from './modules/financial-module/billing-module/billing-manage.module';
import { PaymentsManageModule } from './modules/financial-module/payments-module/payments-manage.module';
import { EmployeeManageModule } from './modules/user-manage-module/employee-module/employee-manage.module';
import { ResidentManageModule } from './modules/user-manage-module/resident-module/resident-manage.module';
import { AppUserManageModule } from './modules/user-manage-module/app-users-module/app-user-manage.module';
import { ReportsManageModule } from './modules/reports-module/reports-manage.module';
import { OperationalReportModule } from './modules/reports-module/operational-report-module/operational-report.module';
import { PaymentsReportModule } from './modules/reports-module/payments-report-module/payments-report.module';
import { RequestManageModule } from './modules/request-module/request-manage.module';
import { ComplaintManageModule } from './modules/request-module/compliant-module/complaint-manage.module';
import { UploadFilesModule } from './common/helper/uploads/uploads.module';
import { HelperModule } from './common/helper/helper.module';

@Module({
  imports: [
    UploadFilesModule,
    HelperModule,
    DatabaseModule,
    BackendApiModule,
    AuthModule,
    MailerManageModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RouterModule.register([
      {
        path: 'api',
        module: BackendApiModule,
        children: [
          {
            path: 'auth',
            module: AuthModule,
          },
          {
            path: 'users',
            module: UsersManageModule,
            children: [
              {
                path: 'app-users',
                module: AppUserManageModule,
              },
              {
                path: 'resident',
                module: ResidentManageModule,
              },
              {
                path: 'employee',
                module: EmployeeManageModule,
              },
            ],
          },
          {
            path: 'residential-units',
            module: UnitManageModule,
          },
          {
            path: 'security-reports',
            module: SecurityManageModule,
          },
          {
            path: 'financial-manage',
            module: FinancialModule,
            children: [
              {
                path: 'payments',
                module: PaymentsManageModule,
              },
              {
                path: 'billing',
                module: BillingManageModule,
              },
            ],
          },
          {
            path: 'contacts',
            module: ContactManageModule,
          },
          {
            path: 'resident-request',
            module: RequestManageModule,
            children: [
              {
                path: 'resident-compliant',
                module: ComplaintManageModule,
              },
            ],
          },
          {
            path: 'communications',
            module: CommunicationModule,
            children: [
              {
                path: 'announcements',
                module: AnnouncementManageModule,
              },
              {
                path: 'forum-post',
                module: ForumPostManageModule,
              },
              {
                path: 'forum-comment',
                module: ForumCommentManageModule,
              },
            ],
          },
          {
            path: 'reports',
            module: ReportsManageModule,
            children: [
              {
                path: 'operational-report',
                module: OperationalReportModule,
              },
              {
                path: 'payments-report',
                module: PaymentsReportModule,
              },
            ],
          },
          {
            path: 'mail',
            module: MailerManageModule,
          },
        ],
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
