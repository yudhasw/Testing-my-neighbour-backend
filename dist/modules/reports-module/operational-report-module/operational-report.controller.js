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
exports.OperationalReportController = void 0;
const common_1 = require("@nestjs/common");
const operational_report_service_1 = require("./operational-report.service");
const operational_report_filter_1 = require("../../../dtos/requests/operational-report-filter");
let OperationalReportController = class OperationalReportController {
    operationalReportService;
    constructor(operationalReportService) {
        this.operationalReportService = operationalReportService;
    }
    getComplaintStats(filter) {
        return this.operationalReportService.getComplaintStatistics(filter);
    }
    getSecurityReportStats(filter) {
        return this.operationalReportService.getSecurityReportStatistics(filter);
    }
    getUnitResidentStats() {
        return this.operationalReportService.getUnitAndResidentStatistics();
    }
};
exports.OperationalReportController = OperationalReportController;
__decorate([
    (0, common_1.Get)('complaints/stats'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [operational_report_filter_1.OperationalReportFilterDto]),
    __metadata("design:returntype", void 0)
], OperationalReportController.prototype, "getComplaintStats", null);
__decorate([
    (0, common_1.Get)('security-reports/stats'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [operational_report_filter_1.OperationalReportFilterDto]),
    __metadata("design:returntype", void 0)
], OperationalReportController.prototype, "getSecurityReportStats", null);
__decorate([
    (0, common_1.Get)('units-residents/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OperationalReportController.prototype, "getUnitResidentStats", null);
exports.OperationalReportController = OperationalReportController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [operational_report_service_1.OperationalReportService])
], OperationalReportController);
//# sourceMappingURL=operational-report.controller.js.map