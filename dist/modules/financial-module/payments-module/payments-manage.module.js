"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsManageModule = void 0;
const common_1 = require("@nestjs/common");
const payments_manage_service_1 = require("../payments-module/payments-manage.service");
const payments_manage_controller_1 = require("./payments-manage.controller");
const billing_manage_module_1 = require("../billing-module/billing-manage.module");
const resident_manage_module_1 = require("../../user-manage-module/resident-module/resident-manage.module");
const unit_manage_module_1 = require("../../unit-manage-module/unit-manage.module");
const database_service_1 = require("../../../common/database/database.service");
const generalHelper_1 = require("../../../common/helper/generalHelper");
const database_module_1 = require("../../../common/database/database.module");
let PaymentsManageModule = class PaymentsManageModule {
};
exports.PaymentsManageModule = PaymentsManageModule;
exports.PaymentsManageModule = PaymentsManageModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_module_1.DatabaseModule,
            billing_manage_module_1.BillingManageModule,
            resident_manage_module_1.ResidentManageModule,
            unit_manage_module_1.UnitManageModule,
        ],
        controllers: [payments_manage_controller_1.PaymentsManageController],
        providers: [payments_manage_service_1.PaymentsManageService, database_service_1.DatabaseService, generalHelper_1.GeneralHelper],
        exports: [payments_manage_service_1.PaymentsManageService],
    })
], PaymentsManageModule);
//# sourceMappingURL=payments-manage.module.js.map