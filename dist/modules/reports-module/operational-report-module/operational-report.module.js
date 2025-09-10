"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationalReportModule = void 0;
const common_1 = require("@nestjs/common");
const operational_report_service_1 = require("./operational-report.service");
const operational_report_controller_1 = require("./operational-report.controller");
const users_manage_module_1 = require("../../user-manage-module/users-manage.module");
const communication_module_1 = require("../../communication-module/communication.module");
const security_manage_module_1 = require("../../security-module/security-manage.module");
const request_manage_module_1 = require("../../request-module/request-manage.module");
const unit_manage_module_1 = require("../../unit-manage-module/unit-manage.module");
const database_module_1 = require("../../../common/database/database.module");
const database_service_1 = require("../../../common/database/database.service");
let OperationalReportModule = class OperationalReportModule {
};
exports.OperationalReportModule = OperationalReportModule;
exports.OperationalReportModule = OperationalReportModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_module_1.DatabaseModule,
            users_manage_module_1.UsersManageModule,
            communication_module_1.CommunicationModule,
            unit_manage_module_1.UnitManageModule,
            request_manage_module_1.RequestManageModule,
            security_manage_module_1.SecurityManageModule,
            security_manage_module_1.SecurityManageModule,
        ],
        controllers: [operational_report_controller_1.OperationalReportController],
        providers: [operational_report_service_1.OperationalReportService, database_service_1.DatabaseService],
        exports: [operational_report_service_1.OperationalReportService],
    })
], OperationalReportModule);
//# sourceMappingURL=operational-report.module.js.map