"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsReportController = void 0;
const common_1 = require("@nestjs/common");
const payments_report_service_1 = require("./payments-report.service");
const payments_report_filter_dto_1 = require("../../../dtos/requests/payments-report-filter-dto");
let PaymentsReportController = class PaymentsReportController {
    paymentsReportService;
    constructor(paymentsReportService) {
        this.paymentsReportService = paymentsReportService;
    }
    getTotalRevenue(filter) {
        return this.paymentsReportService.getTotalRevenue(filter);
    }
    getPaymentHistory(filter) {
        return this.paymentsReportService.getPaymentHistoryByMonth(filter);
    }
};
exports.PaymentsReportController = PaymentsReportController;
__decorate([
    (0, common_1.Get)('revenue'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payments_report_filter_dto_1.PaymentsReportFilterDto]),
    __metadata("design:returntype", void 0)
], PaymentsReportController.prototype, "getTotalRevenue", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payments_report_filter_dto_1.PaymentsReportFilterDto]),
    __metadata("design:returntype", void 0)
], PaymentsReportController.prototype, "getPaymentHistory", null);
exports.PaymentsReportController = PaymentsReportController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [payments_report_service_1.PaymentsReportService])
], PaymentsReportController);
//# sourceMappingURL=payments-report.controller.js.map