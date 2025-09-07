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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../../common/database/database.service");
const config_1 = require("@nestjs/config");
const prisma_1 = require("../../../common/database/generated/prisma");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const mailer_manage_service_1 = require("../../../common/helper/mail/mailer-manage.service");
const uploads_service_1 = require("../../helper/uploads/uploads.service");
let AuthService = class AuthService extends uploads_service_1.UploadsService {
    prisma;
    jwt;
    mailerService;
    config;
    constructor(prisma, jwt, mailerService, config) {
        super();
        this.prisma = prisma;
        this.jwt = jwt;
        this.mailerService = mailerService;
        this.config = config;
    }
    async registration(registRequest, files) {
        const existingUser = await this.prisma.users.findFirst({
            where: {
                OR: [
                    { username: registRequest.username },
                    { primaryEmail: registRequest.primaryEmail },
                ],
            },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Username or email sudah tersedia');
        }
        if (registRequest.residentType === prisma_1.ResidentStatus.FAMILY_MEMBERS) {
            await this.validateFamilyCode(registRequest.familyCode);
        }
        if (registRequest.residentType === prisma_1.ResidentStatus.HEAD_HOUSE_HOLD) {
            await this.validateUnitOwnership(registRequest.unitId);
        }
        const hashedPassword = await bcrypt.hash(registRequest.password, 12);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationCode = this.mailerService.generateVerificationCode();
        const result = await this.prisma.$transaction(async (prisma) => {
            const user = await prisma.users.create({
                data: {
                    fullName: registRequest.fullName,
                    firstName: registRequest.firstName,
                    lastName: registRequest.lastName,
                    username: registRequest.username,
                    primaryEmail: registRequest.primaryEmail,
                    contactNumber: registRequest.contactNumber,
                    dateOfBirth: registRequest.dateOfBirth,
                    password: hashedPassword,
                    role: registRequest.role,
                    gender: registRequest.gender,
                },
            });
            const residentData = {
                userId: user.id,
                emergencyContactName: registRequest.emergencyContactName,
                emergencyContactNumber: registRequest.emergencyContactNumber,
                movedInDate: registRequest.movedInDate ?? new Date(),
                residentStatus: registRequest.residentType,
                registrationStatus: 'PENDING',
                registrationMethod: 'USER_DRIVEN',
                pendingApproval: registRequest.residentType === prisma_1.ResidentStatus.FAMILY_MEMBERS,
            };
            if (registRequest.residentType === prisma_1.ResidentStatus.HEAD_HOUSE_HOLD) {
                residentData.unitId = registRequest.unitId;
            }
            else if (registRequest.residentType === prisma_1.ResidentStatus.FAMILY_MEMBERS) {
                residentData.familyCode = registRequest.familyCode;
            }
            const resident = await prisma.residents.create({
                data: residentData,
                include: {
                    unit: true,
                    user: true,
                },
            });
            if (files && files.length > 0) {
                await this.handleDocumentUploads(resident.id, files, registRequest.documentTypes);
            }
            if (registRequest.residentType === prisma_1.ResidentStatus.FAMILY_MEMBERS) {
                await this.createFamilyApprovalRequest(resident.id, registRequest.familyCode);
                const familyCodeRecord = await prisma.familyCodes.findUnique({
                    where: { code: registRequest.familyCode },
                    include: {
                        headResident: {
                            include: { user: true },
                        },
                    },
                });
                if (familyCodeRecord) {
                    await this.mailerService.sendFamilyMemberApprovalNotification({
                        headOfHouseholdName: familyCodeRecord.headResident.user.fullName,
                        headOfHouseholdEmail: familyCodeRecord.headResident.user.primaryEmail,
                        familyMemberName: resident.user.fullName,
                        familyMemberEmail: user.primaryEmail,
                        uniqueCode: familyCodeRecord.code,
                        actionUrl: `${this.config.get('APP_URL')}/auth/family-approval`,
                    });
                }
            }
            if (registRequest.residentType === prisma_1.ResidentStatus.HEAD_HOUSE_HOLD) {
                await this.mailerService.sendHeadOfHouseholdVerificationEmail({
                    fullName: resident.user.fullName,
                    email: user.primaryEmail,
                    verificationCode,
                    registrationType: registRequest.registrationMethod,
                    isAdminDriven: false,
                    unitNumber: resident.unit?.unitNumber,
                    propertyName: this.config.get('PROPERTY_NAME', 'Property Management'),
                });
            }
            else {
                await this.mailerService.sendFamilyMemberVerificationEmail({
                    fullName: resident.user.fullName,
                    registrationType: registRequest.registrationMethod,
                    isAdminDriven: false,
                    email: user.primaryEmail,
                    verificationCode,
                    propertyName: this.config.get('PROPERTY_NAME', 'Property Management'),
                });
            }
            return {
                message: 'Registration successful. Please check your email for verification.',
                userId: user.id,
                residentId: resident.id,
                requiresApproval: registRequest.residentType === prisma_1.ResidentStatus.FAMILY_MEMBERS,
                verificationCode,
            };
        });
        return result;
    }
    async verifyEmail(token) {
        const user = await this.prisma.users.findFirst({
            where: { emailVerificationToken: token },
            include: {
                Resident: {
                    include: { unit: true },
                },
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('Invalid verification token');
        }
        await this.prisma.$transaction(async (prisma) => {
            await prisma.users.update({
                where: { id: user.id },
                data: {
                    emailVerificationToken: null,
                },
            });
            if (user.Resident) {
                const newStatus = user.Resident.residentStatus === prisma_1.ResidentStatus.HEAD_HOUSE_HOLD
                    ? 'APPROVED'
                    : 'PENDING';
                await prisma.residents.update({
                    where: { id: user.Resident.id },
                    data: {
                        registrationStatus: newStatus,
                    },
                });
                if (user.Resident.residentStatus === prisma_1.ResidentStatus.HEAD_HOUSE_HOLD) {
                    await this.ensureFamilyCode(user.Resident.id, user.Resident.unitId);
                }
            }
        });
        if (user.Resident) {
            const uniqueCode = this.mailerService.generateUniqueCode();
            if (user.Resident.residentStatus === prisma_1.ResidentStatus.HEAD_HOUSE_HOLD) {
                await this.mailerService.sendHeadOfHouseholdWelcomeEmail({
                    fullName: user.fullName,
                    email: user.primaryEmail,
                    uniqueCode,
                    loginUrl: `${this.config.get('APP_URL')}/auth/sign-in`,
                    propertyName: this.config.get('PROPERTY_NAME', 'Property Management'),
                    unitNumber: user.Resident?.unit?.unitNumber ?? 'Unit tidak ditemukan',
                });
            }
        }
        return {
            message: 'Email verified successfully. You can now sign in.',
        };
    }
    async approvalSystem(approvalRequest) {
        const approval = await this.prisma.familyApprovals.findUnique({
            where: { id: approvalRequest.familyApprovalId },
            include: {
                familyMember: {
                    include: { user: true },
                },
                headOfHousehold: {
                    include: { user: true },
                },
            },
        });
        if (!approval) {
            throw new common_1.BadRequestException('Approval request not found');
        }
        if (approval.headOfHouseholdId !== approvalRequest.headOfHouseholdId) {
            throw new common_1.UnauthorizedException('Not authorized to approve this request');
        }
        const result = await this.prisma.$transaction(async (prisma) => {
            const updatedApproval = await prisma.familyApprovals.update({
                where: { id: approvalRequest.familyApprovalId },
                data: {
                    status: approvalRequest.action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
                    respondedAt: new Date(),
                    notes: approvalRequest.notes,
                },
            });
            if (approvalRequest.action === 'APPROVE') {
                await prisma.residents.update({
                    where: { id: approval.familyMemberId },
                    data: {
                        registrationStatus: 'APPROVED',
                        pendingApproval: false,
                        approvedByHeadOfHousehold: approvalRequest.headOfHouseholdId,
                        approvalDate: new Date(),
                    },
                });
                const familyCode = await this.ensureFamilyCode(approval.headOfHouseholdId);
                await prisma.residents.update({
                    where: { id: approval.familyMemberId },
                    data: { familyCode },
                });
                const uniqueCode = this.mailerService.generateUniqueCode();
                await this.mailerService.sendFamilyMemberWelcomeEmail({
                    fullName: approval.familyMember.user.fullName,
                    email: approval.familyMember.user.primaryEmail,
                    uniqueCode,
                    loginUrl: `${this.config.get('APP_URL')}/auth/sign-in`,
                    propertyName: this.config.get('PROPERTY_NAME', 'Property Management'),
                    unitNumber: '',
                });
            }
            else {
                await prisma.residents.update({
                    where: { id: approval.familyMemberId },
                    data: {
                        registrationStatus: 'REJECTED',
                        pendingApproval: false,
                        rejectionReason: approvalRequest.notes,
                    },
                });
                await this.mailerService.sendFamilyMemberRejectionNotification(approval.familyMember.user.primaryEmail, approval.familyMember.user.fullName, approval.headOfHousehold.user.fullName, approvalRequest.notes);
            }
            return updatedApproval;
        });
        return {
            message: `Family member ${approvalRequest.action === 'APPROVE' ? 'approved' : 'rejected'} successfully`,
            approval: result,
        };
    }
    async ensureFamilyCode(headOfHouseholdId, unitId) {
        const existing = await this.prisma.familyCodes.findFirst({
            where: { headOfHousehold: headOfHouseholdId },
        });
        if (existing) {
            return existing.code;
        }
        const code = this.generateUniqueFamilyCode();
        const familyCode = await this.prisma.familyCodes.create({
            data: {
                code,
                headOfHousehold: headOfHouseholdId,
                unitId: unitId || null,
                isActive: true,
                maxMembers: 10,
            },
        });
        return familyCode.code;
    }
    async createFamilyApprovalRequest(residentId, familyCode) {
        const familyCodeRecord = await this.prisma.familyCodes.findUnique({
            where: { code: familyCode },
        });
        if (!familyCodeRecord) {
            throw new common_1.BadRequestException('Invalid family code');
        }
        return this.prisma.familyApprovals.create({
            data: {
                familyMemberId: residentId,
                headOfHouseholdId: familyCodeRecord.headOfHousehold,
                status: 'PENDING',
                notes: 'Pending approval from head of household',
            },
        });
    }
    async signIn(signInRequest) {
        const user = await this.prisma.users.findFirst({
            where: {
                OR: [
                    { username: signInRequest.identifier },
                    { primaryEmail: signInRequest.identifier },
                ],
            },
            include: {
                Resident: {
                    include: {
                        unit: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(signInRequest.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.emailVerificationToken != null) {
            throw new common_1.UnauthorizedException('Please verify your email before signing in');
        }
        if (user.Resident && user.Resident.registrationStatus !== 'APPROVED') {
            throw new common_1.UnauthorizedException('Your registration is still pending approval');
        }
        const tokens = await this.generateTokens(user.id);
        return {
            message: 'Sign in successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.primaryEmail,
                fullName: user.fullName,
                resident: user.Resident,
            },
            ...tokens,
        };
    }
    async generateTokens(userId) {
        const payload = { sub: userId };
        const accessToken = await this.jwt.signAsync(payload, {
            expiresIn: '1h',
        });
        const refreshToken = await this.jwt.signAsync(payload, {
            expiresIn: '7d',
        });
        await this.prisma.users.update({
            where: { id: userId },
            data: { sessionToken: refreshToken },
        });
        return { accessToken, refreshToken };
    }
    async jwtCompare(token, userId) {
        try {
            const decoded = await this.jwt.verifyAsync(token);
            return decoded.sub === userId;
        }
        catch {
            return false;
        }
    }
    async validateFamilyCode(familyCode) {
        const family = await this.prisma.familyCodes.findUnique({
            where: { code: familyCode, isActive: true },
        });
        if (!family) {
            throw new common_1.BadRequestException('Invalid family code');
        }
        const memberCount = await this.prisma.residents.count({
            where: { familyCode },
        });
        if (memberCount >= family.maxMembers) {
            throw new common_1.BadRequestException('Family has reached maximum number of members');
        }
    }
    async validateUnitOwnership(unitId) {
        const unit = await this.prisma.units.findUnique({
            where: { id: unitId },
        });
        if (!unit) {
            throw new common_1.BadRequestException('Unit not found');
        }
        if (unit.status !== 'OCCUPIED') {
            throw new common_1.BadRequestException('Unit is not available');
        }
    }
    async handleDocumentUploads(residentId, files, documentTypes) {
        const uploadPromises = files.map(async (file, index) => {
            const documentType = documentTypes?.[index] || 'ID_CARD';
            const fileUrl = this.saveFileToStorage(file);
            return this.prisma.residentDocuments.create({
                data: {
                    residentId,
                    documentType: documentType,
                    fileName: file.originalname,
                    fileUrl,
                    fileSize: file.size,
                    isVerified: false,
                },
            });
        });
        return Promise.all(uploadPromises);
    }
    generateUniqueFamilyCode() {
        return 'FAM-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    }
    saveFileToStorage(files) {
        return this.processSingleFiles(files);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        jwt_1.JwtService,
        mailer_manage_service_1.MailerManageService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map