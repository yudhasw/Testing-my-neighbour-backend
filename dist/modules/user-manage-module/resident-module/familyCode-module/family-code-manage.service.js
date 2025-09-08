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
exports.FamilyCodeManageService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../../../common/database/database.service");
const library_1 = require("../../../../common/database/generated/prisma/runtime/library");
let FamilyCodeManageService = class FamilyCodeManageService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createRequest) {
        try {
            return await this.prisma.familyCodes.create({
                data: {
                    code: createRequest.code,
                    headResident: {
                        connect: { id: createRequest.headOfHousehold ?? undefined },
                    },
                    unit: { connect: { id: createRequest.unitId ?? undefined } },
                    isActive: createRequest.isActive ?? true,
                    maxMembers: createRequest.maxMembers ?? 10,
                },
            });
        }
        catch (error) {
            console.error(error.message);
            throw new common_1.InternalServerErrorException('Terjadi kesalahan saat membuat kode keluarga.');
        }
    }
    async findAll() {
        try {
            return await this.prisma.familyCodes.findMany({
                orderBy: {
                    createdAt: 'asc',
                    code: 'asc',
                },
            });
        }
        catch (error) {
            console.error(error.message);
            throw new common_1.InternalServerErrorException('Terjadi kesalahan saat mendapatkan data kode keluarga.');
        }
    }
    async findOne(id) {
        try {
            return await this.prisma.familyCodes.findUniqueOrThrow({
                where: { id: id },
                include: {
                    headResident: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                    firstName: true,
                                    lastName: true,
                                    contactNumber: true,
                                    dateOfBirth: true,
                                    gender: true,
                                    username: true,
                                    primaryEmail: true,
                                },
                            },
                        },
                    },
                    unit: true,
                },
            });
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError &&
                error.code === 'P2025') {
                throw new common_1.NotFoundException(`Kode keluarga dengan id: ${id} tidak ditemukan.`);
            }
            console.error(error.message);
            throw new common_1.InternalServerErrorException('Terjadi kesalahan saat mendapatkan kode keluarga.');
        }
    }
    async update(id, updateRequest) {
        try {
            const existData = await this.prisma.familyCodes.findUniqueOrThrow({
                where: { id: id },
            });
            if (!existData) {
                throw new common_1.NotFoundException(`Code Keluarga dengan id: ${id} tidak ditemukan`);
            }
            return await this.prisma.familyCodes.update({
                where: { id: id },
                data: {
                    code: updateRequest.code ?? existData.code,
                    headResident: {
                        connect: updateRequest.headOfHousehold
                            ? { id: updateRequest.headOfHousehold }
                            : undefined,
                    },
                    unit: updateRequest.unitId
                        ? { connect: { id: updateRequest.unitId } }
                        : undefined,
                    isActive: updateRequest.isActive,
                    maxMembers: updateRequest.maxMembers,
                },
            });
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError &&
                error.code === 'P2025') {
                throw new common_1.NotFoundException(`Kode keluarga dengan id: ${id} tidak ditemukan.`);
            }
            console.error(error.message);
            throw new common_1.InternalServerErrorException('Terjadi kesalahan saat memperbarui kode keluarga.');
        }
    }
    async remove(id) {
        try {
            const existData = await this.prisma.familyCodes.findUniqueOrThrow({
                where: { id: id },
            });
            if (!existData) {
                throw new common_1.NotFoundException(`Code Keluarga dengan id: ${id} tidak ditemukan`);
            }
            return await this.prisma.familyCodes.delete({
                where: { id: id },
            });
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError &&
                error.code === 'P2025') {
                throw new common_1.NotFoundException(`Kode keluarga dengan id: ${id} tidak ditemukan.`);
            }
            console.error(error.message);
            throw new common_1.InternalServerErrorException('Terjadi kesalahan saat menghapus kode keluarga.');
        }
    }
};
exports.FamilyCodeManageService = FamilyCodeManageService;
exports.FamilyCodeManageService = FamilyCodeManageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], FamilyCodeManageService);
//# sourceMappingURL=family-code-manage.service.js.map