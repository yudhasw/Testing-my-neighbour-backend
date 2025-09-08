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
exports.FamilyApprovalManageService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../../../common/database/database.service");
const library_1 = require("../../../../common/database/generated/prisma/runtime/library");
const prisma_1 = require("../../../../common/database/generated/prisma");
let FamilyApprovalManageService = class FamilyApprovalManageService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createRequest) {
        try {
            const existingRequest = await this.prisma.familyApprovals.findFirst({
                where: {
                    familyMemberId: createRequest.familyMemberId,
                    status: prisma_1.ApprovalStatus.PENDING,
                },
            });
            if (existingRequest) {
                throw new common_1.BadRequestException('Permintaan persetujuan yang tertunda sudah ada untuk anggota keluarga ini.');
            }
            return await this.prisma.familyApprovals.create({
                data: {
                    familyMemberId: createRequest.familyMemberId,
                    headOfHouseholdId: createRequest.headOfHouseholdId,
                    status: prisma_1.ApprovalStatus.PENDING,
                    notes: createRequest.notes,
                },
            });
        }
        catch (error) {
            console.error(error.message);
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                if (error.code === 'P2003') {
                    throw new common_1.BadRequestException('ID anggota keluarga atau ID kepala rumah tangga tidak valid.');
                }
            }
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException('Terjadi kesalahan saat membuat Data permintaan persetujuan keluarga.');
        }
    }
    async findAll() {
        try {
            return await this.prisma.familyApprovals.findMany({
                include: {
                    familyMember: {
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
                    headOfHousehold: {
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
                },
                orderBy: {
                    requestedAt: 'desc',
                },
            });
        }
        catch (error) {
            console.error(error.message);
            throw new common_1.InternalServerErrorException('Terjadi kesalahan saat mengambil semua Data permintaan persetujuan keluarga.');
        }
    }
    async findOne(id) {
        try {
            return await this.prisma.familyApprovals.findUniqueOrThrow({
                where: { id: id },
                include: {
                    familyMember: true,
                    headOfHousehold: true,
                },
            });
        }
        catch (error) {
            console.error(error.message);
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Data Permintaan persetujuan keluarga dengan ID ${id} tidak ditemukan.`);
            }
            throw new common_1.InternalServerErrorException('Terjadi kesalahan saat mengambil Data permintaan persetujuan keluarga.');
        }
    }
    async update(id, updateRequest) {
        try {
            const existData = await this.prisma.familyApprovals.findUniqueOrThrow({
                where: { id: id },
            });
            if (!existData) {
                throw new common_1.NotFoundException(`Data permintaan persetujuan Keluarga dengan id: ${id} tidak ditemukan`);
            }
            return await this.prisma.familyApprovals.update({
                where: { id: id },
                data: {
                    status: updateRequest.status,
                    respondedAt: updateRequest.status !== prisma_1.ApprovalStatus.PENDING
                        ? new Date()
                        : undefined,
                    notes: updateRequest.notes,
                    updatedAt: new Date(),
                },
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Data Permintaan persetujuan keluarga dengan ID ${id} tidak ditemukan.`);
            }
            throw new common_1.InternalServerErrorException('Terjadi kesalahan saat memperbarui Data permintaan persetujuan keluarga.');
        }
    }
    async remove(id) {
        try {
            const existData = await this.prisma.familyApprovals.findUniqueOrThrow({
                where: { id: id },
            });
            if (!existData) {
                throw new common_1.NotFoundException(`Data permintaan persetujuan Keluarga dengan id: ${id} tidak ditemukan`);
            }
            return await this.prisma.familyApprovals.delete({
                where: { id: id },
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException(`Data Permintaan persetujuan keluarga dengan ID ${id} tidak ditemukan.`);
            }
            throw new common_1.InternalServerErrorException('Terjadi kesalahan saat menghapus Data permintaan persetujuan keluarga.');
        }
    }
};
exports.FamilyApprovalManageService = FamilyApprovalManageService;
exports.FamilyApprovalManageService = FamilyApprovalManageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], FamilyApprovalManageService);
//# sourceMappingURL=family-approval-manage.service.js.map