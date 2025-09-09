"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsManageModule = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../common/database/database.module");
const unit_manage_module_1 = require("../unit-manage-module/unit-manage.module");
const users_manage_module_1 = require("../user-manage-module/users-manage.module");
const security_manage_module_1 = require("../security-module/security-manage.module");
const operational_report_module_1 = require("./operational-report-module/operational-report.module");
const payments_report_module_1 = require("./payments-report-module/payments-report.module");
const request_manage_module_1 = require("../request-module/request-manage.module");
const communication_module_1 = require("../communication-module/communication.module");
const contact_manage_module_1 = require("../contact-module/contact-manage.module");
const financial_module_1 = require("../financial-module/financial.module");
let ReportsManageModule = class ReportsManageModule {
};
exports.ReportsManageModule = ReportsManageModule;
exports.ReportsManageModule = ReportsManageModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_module_1.DatabaseModule,
            unit_manage_module_1.UnitManageModule,
            request_manage_module_1.RequestManageModule,
            users_manage_module_1.UsersManageModule,
            security_manage_module_1.SecurityManageModule,
            operational_report_module_1.OperationalReportModule,
            contact_manage_module_1.ContactManageModule,
            communication_module_1.CommunicationModule,
            financial_module_1.FinancialModule,
        ],
        exports: [operational_report_module_1.OperationalReportModule, payments_report_module_1.PaymentsReportModule],
    })
], ReportsManageModule);
//# sourceMappingURL=reports-manage.module.js.map