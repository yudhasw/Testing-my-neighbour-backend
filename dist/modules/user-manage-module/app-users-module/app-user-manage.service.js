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
exports.AppUserManageService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const database_service_1 = require("../../../common/database/database.service");
const library_1 = require("../../../common/database/generated/prisma/runtime/library");
let AppUserManageService = class AppUserManageService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createRequest) {
        try {
            const hashedPassword = await this.passwordHashing(createRequest.password);
            return await this.prisma.users.create({
                data: {
                    fullName: createRequest.fullName,
                    firstName: createRequest.firstName,
                    lastName: createRequest.lastName,
                    username: createRequest.username,
                    primaryEmail: createRequest.primaryEmail,
                    password: hashedPassword,
                    role: createRequest.role,
                    gender: createRequest.gender,
                },
                omit: {
                    password: true,
                },
            });
        }
        catch (error) {
            console.error(error.message);
            throw new common_1.InternalServerErrorException('Terjadi Kesalahan Saat Membuat Data Pengguna Aplikasi');
        }
    }
    async findAll() {
        try {
            return await this.prisma.users.findMany({
                include: {
                    Employee: {
                        select: {
                            employeeNumberId: true,
                            employeePosition: true,
                            hireDate: true,
                            workingHours: true,
                            salary: true,
                            bonus: true,
                        },
                    },
                    Resident: {
                        select: {
                            emergencyContactName: true,
                            emergencyContactNumber: true,
                            movedInDate: true,
                            movedOutDate: true,
                        },
                    },
                    _count: {
                        select: { ForumPosts: true, ForumComments: true },
                    },
                },
                orderBy: {
                    fullName: 'asc',
                },
            });
        }
        catch (error) {
            console.error(error.message);
            throw new common_1.InternalServerErrorException('Terjadi Kesalahan Saat Mendapatkan Data Pengguna Aplikasi');
        }
    }
    async findOne(id) {
        try {
            return await this.prisma.users.findUniqueOrThrow({
                where: { id: id },
                include: {
                    Employee: {
                        select: {
                            employeeNumberId: true,
                            employeePosition: true,
                            hireDate: true,
                            workingHours: true,
                            salary: true,
                            bonus: true,
                            Complaints: {
                                select: {
                                    title: true,
                                    description: true,
                                    submittedAt: true,
                                    status: true,
                                },
                            },
                            Announcements: {
                                select: {
                                    title: true,
                                    content: true,
                                    publishDate: true,
                                    expiryDate: true,
                                },
                                orderBy: { publishDate: 'asc' },
                            },
                        },
                    },
                    Resident: {
                        select: {
                            emergencyContactName: true,
                            emergencyContactNumber: true,
                            movedInDate: true,
                            movedOutDate: true,
                            unit: {
                                select: {
                                    unitNumber: true,
                                    buildingName: true,
                                    location: true,
                                    floorNumber: true,
                                },
                            },
                        },
                    },
                },
            });
        }
        catch (error) {
            if (error.name === 'NotFoundError') {
                throw new common_1.NotFoundException(`Pengguna Aplikasi dengan id: ${id} tidak ditemukan`);
            }
            console.error(error.message);
            throw new common_1.InternalServerErrorException('Terjadi Kesalahan Saat Mendapatkan Data Pengguna Aplikasi');
        }
    }
    async update(id, updateRequest) {
        try {
            const existData = await this.prisma.users.findUniqueOrThrow({
                where: { id: id },
            });
            if (!existData) {
                throw new common_1.NotFoundException(`Pengguna Aplikasi dengan id: ${id} tidak ditemukan`);
            }
            const updatedData = await this.prisma.users.update({
                where: { id: id },
                data: {
                    fullName: updateRequest.fullName ?? existData.fullName,
                    firstName: updateRequest.firstName ?? existData.firstName,
                    lastName: updateRequest.lastName ?? existData.lastName,
                    username: updateRequest.username ?? existData.username,
                    primaryEmail: updateRequest.primaryEmail ?? existData.primaryEmail,
                    role: updateRequest.role ?? existData.role,
                    gender: updateRequest.gender ?? existData.gender,
                    secondaryEmail: updateRequest.secondaryEmail ?? existData.secondaryEmail,
                    contactNumber: updateRequest.contactNumber ?? existData.contactNumber,
                    dateOfBirth: updateRequest.dateOfBirth ?? existData.dateOfBirth,
                    updatedAt: new Date(),
                },
                omit: {
                    password: true,
                },
            });
            return updatedData;
        }
        catch (error) {
            if (error.name === 'NotFoundError') {
                throw new common_1.NotFoundException(`Pengguna Aplikasi dengan id: ${id} tidak ditemukan`);
            }
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new common_1.NotFoundException(`Pengguna Aplikasi dengan id: ${id} tidak ditemukan`);
                }
            }
            console.error(error.message);
            throw new common_1.InternalServerErrorException('Terjadi Kesalahan Saat Mendapatkan Pengguna Aplikasi');
        }
    }
    async remove(id) {
        try {
            const existData = await this.prisma.users.findUniqueOrThrow({
                where: { id: id },
            });
            if (!existData) {
                throw new common_1.NotFoundException(`Pengguna Aplikasi dengan id: ${id} tidak ditemukan`);
            }
            return await this.prisma.users.delete({
                where: { id: id },
            });
        }
        catch (error) {
            if (error.name === 'NotFoundError') {
                throw new common_1.NotFoundException(`Pengguna Aplikasi dengan id: ${id} tidak ditemukan`);
            }
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new common_1.NotFoundException(`Resident dengan id: ${id} tidak ditemukan`);
                }
            }
            console.error(error.message);
            throw new common_1.InternalServerErrorException('Terjadi Kesalahan Saat Menghapus Data Pengguna Aplikasi');
        }
    }
    async passwordHashing(password) {
        return await bcrypt.hash(password, 15);
    }
    async compare(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
};
exports.AppUserManageService = AppUserManageService;
exports.AppUserManageService = AppUserManageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], AppUserManageService);
//# sourceMappingURL=app-user-manage.service.js.map