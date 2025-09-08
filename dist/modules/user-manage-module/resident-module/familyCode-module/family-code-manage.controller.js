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
exports.FamilyCodeManageController = void 0;
const common_1 = require("@nestjs/common");
const family_code_manage_service_1 = require("./family-code-manage.service");
const create_family_code_manage_dto_1 = require("../../../../dtos/requests/create/create-family-code-manage.dto");
const update_family_code_manage_dto_1 = require("../../../../dtos/requests/update/update-family-code-manage.dto");
let FamilyCodeManageController = class FamilyCodeManageController {
    familyCodeManageService;
    constructor(familyCodeManageService) {
        this.familyCodeManageService = familyCodeManageService;
    }
    create(createFamilyCodeManageDto) {
        return this.familyCodeManageService.create(createFamilyCodeManageDto);
    }
    findAll() {
        return this.familyCodeManageService.findAll();
    }
    findOne(id) {
        return this.familyCodeManageService.findOne(id);
    }
    update(id, updateFamilyCodeManageDto) {
        return this.familyCodeManageService.update(id, updateFamilyCodeManageDto);
    }
    remove(id) {
        return this.familyCodeManageService.remove(id);
    }
};
exports.FamilyCodeManageController = FamilyCodeManageController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_family_code_manage_dto_1.CreateFamilyCodeManageDto]),
    __metadata("design:returntype", void 0)
], FamilyCodeManageController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FamilyCodeManageController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FamilyCodeManageController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_family_code_manage_dto_1.UpdateFamilyCodeManageDto]),
    __metadata("design:returntype", void 0)
], FamilyCodeManageController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FamilyCodeManageController.prototype, "remove", null);
exports.FamilyCodeManageController = FamilyCodeManageController = __decorate([
    (0, common_1.Controller)('family-code-manage'),
    __metadata("design:paramtypes", [family_code_manage_service_1.FamilyCodeManageService])
], FamilyCodeManageController);
//# sourceMappingURL=family-code-manage.controller.js.map