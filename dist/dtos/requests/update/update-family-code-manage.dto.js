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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFamilyCodeManageDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const is_unique_validators_1 = require("../../../common/pipes/validators/is-unique-validators");
class UpdateFamilyCodeManageDto {
    code;
    headOfHousehold;
    unitId;
    isActive;
    maxMembers;
}
exports.UpdateFamilyCodeManageDto = UpdateFamilyCodeManageDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Kode keluarga harus berupa teks.' }),
    (0, class_validator_1.IsOptional)(),
    (0, is_unique_validators_1.IsUnique)({ field: 'code', model: 'familyCodes' }, { message: 'Kode keluarga sudah terdaftar.' }),
    __metadata("design:type", String)
], UpdateFamilyCodeManageDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4', {
        message: 'ID kepala keluarga harus berupa UUID versi 4 yang valid.',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFamilyCodeManageDto.prototype, "headOfHousehold", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4', {
        message: 'ID unit hunian harus berupa UUID versi 4 yang valid.',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFamilyCodeManageDto.prototype, "unitId", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)({ message: 'Status aktif harus berupa boolean.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateFamilyCodeManageDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'Jumlah anggota maksimal harus berupa angka bulat.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1, { message: 'Jumlah anggota minimal 1 orang.' }),
    (0, class_validator_1.Max)(20, { message: 'Jumlah anggota maksimal 20 orang.' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateFamilyCodeManageDto.prototype, "maxMembers", void 0);
//# sourceMappingURL=update-family-code-manage.dto.js.map