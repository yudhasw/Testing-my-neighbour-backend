"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const backend_api_module_1 = require("./modules/backend-api.module");
const auth_module_1 = require("./common/security/auth/auth.module");
const mailer_manage_module_1 = require("./common/helper/mail/mailer-manage.module");
const database_module_1 = require("./common/database/database.module");
const financial_module_1 = require("./modules/financial-module/financial.module");
const communication_module_1 = require("./modules/communication-module/communication.module");
const contact_manage_module_1 = require("./modules/contact-module/contact-manage.module");
const security_manage_module_1 = require("./modules/security-module/security-manage.module");
const unit_manage_module_1 = require("./modules/unit-manage-module/unit-manage.module");
const users_manage_module_1 = require("./modules/user-manage-module/users-manage.module");
const announcement_manage_module_1 = require("./modules/communication-module/announcement-module/announcement-manage.module");
const forum_comment_manage_module_1 = require("./modules/communication-module/forum-comment-module/forum-comment-manage.module");
const forum_post_manage_module_1 = require("./modules/communication-module/forum-post-module/forum-post-manage.module");
const billing_manage_module_1 = require("./modules/financial-module/billing-module/billing-manage.module");
const payments_manage_module_1 = require("./modules/financial-module/payments-module/payments-manage.module");
const employee_manage_module_1 = require("./modules/user-manage-module/employee-module/employee-manage.module");
const resident_manage_module_1 = require("./modules/user-manage-module/resident-module/resident-manage.module");
const app_user_manage_module_1 = require("./modules/user-manage-module/app-users-module/app-user-manage.module");
const reports_manage_module_1 = require("./modules/reports-module/reports-manage.module");
const operational_report_module_1 = require("./modules/reports-module/operational-report-module/operational-report.module");
const payments_report_module_1 = require("./modules/reports-module/payments-report-module/payments-report.module");
const request_manage_module_1 = require("./modules/request-module/request-manage.module");
const complaint_manage_module_1 = require("./modules/request-module/compliant-module/complaint-manage.module");
const uploads_module_1 = require("./common/helper/uploads/uploads.module");
const helper_module_1 = require("./common/helper/helper.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            uploads_module_1.UploadFilesModule,
            helper_module_1.HelperModule,
            database_module_1.DatabaseModule,
            backend_api_module_1.BackendApiModule,
            auth_module_1.AuthModule,
            mailer_manage_module_1.MailerManageModule,
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            core_1.RouterModule.register([
                {
                    path: 'api',
                    module: backend_api_module_1.BackendApiModule,
                    children: [
                        {
                            path: 'auth',
                            module: auth_module_1.AuthModule,
                        },
                        {
                            path: 'users',
                            module: users_manage_module_1.UsersManageModule,
                            children: [
                                {
                                    path: 'app-users',
                                    module: app_user_manage_module_1.AppUserManageModule,
                                },
                                {
                                    path: 'resident',
                                    module: resident_manage_module_1.ResidentManageModule,
                                },
                                {
                                    path: 'employee',
                                    module: employee_manage_module_1.EmployeeManageModule,
                                },
                            ],
                        },
                        {
                            path: 'residential-units',
                            module: unit_manage_module_1.UnitManageModule,
                        },
                        {
                            path: 'security-reports',
                            module: security_manage_module_1.SecurityManageModule,
                        },
                        {
                            path: 'financial-manage',
                            module: financial_module_1.FinancialModule,
                            children: [
                                {
                                    path: 'payments',
                                    module: payments_manage_module_1.PaymentsManageModule,
                                },
                                {
                                    path: 'billing',
                                    module: billing_manage_module_1.BillingManageModule,
                                },
                            ],
                        },
                        {
                            path: 'contacts',
                            module: contact_manage_module_1.ContactManageModule,
                        },
                        {
                            path: 'resident-request',
                            module: request_manage_module_1.RequestManageModule,
                            children: [
                                {
                                    path: 'resident-compliant',
                                    module: complaint_manage_module_1.ComplaintManageModule,
                                },
                            ],
                        },
                        {
                            path: 'communications',
                            module: communication_module_1.CommunicationModule,
                            children: [
                                {
                                    path: 'announcements',
                                    module: announcement_manage_module_1.AnnouncementManageModule,
                                },
                                {
                                    path: 'forum-post',
                                    module: forum_post_manage_module_1.ForumPostManageModule,
                                },
                                {
                                    path: 'forum-comment',
                                    module: forum_comment_manage_module_1.ForumCommentManageModule,
                                },
                            ],
                        },
                        {
                            path: 'reports',
                            module: reports_manage_module_1.ReportsManageModule,
                            children: [
                                {
                                    path: 'operational-report',
                                    module: operational_report_module_1.OperationalReportModule,
                                },
                                {
                                    path: 'payments-report',
                                    module: payments_report_module_1.PaymentsReportModule,
                                },
                            ],
                        },
                        {
                            path: 'mail',
                            module: mailer_manage_module_1.MailerManageModule,
                        },
                    ],
                },
            ]),
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map