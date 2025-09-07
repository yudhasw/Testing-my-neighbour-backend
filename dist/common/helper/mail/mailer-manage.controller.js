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
exports.MailerManageController = exports.SendDocumentReviewDto = exports.SendApprovalNotificationDto = exports.SendVerificationEmailDto = void 0;
const common_1 = require("@nestjs/common");
const mailer_manage_service_1 = require("./mailer-manage.service");
const prisma_1 = require("../../../common/database/generated/prisma");
class SendVerificationEmailDto {
    fullName;
    email;
    verificationCode;
    registrationType;
    unitNumber;
    propertyName;
    isAdminDriven;
}
exports.SendVerificationEmailDto = SendVerificationEmailDto;
class SendApprovalNotificationDto {
    headOfHouseholdName;
    headOfHouseholdEmail;
    familyMemberName;
    familyMemberEmail;
    uniqueCode;
    actionUrl;
}
exports.SendApprovalNotificationDto = SendApprovalNotificationDto;
class SendDocumentReviewDto {
    applicantName;
    applicantEmail;
    adminName;
    adminEmail;
    documentType;
    submissionDate;
    reviewUrl;
}
exports.SendDocumentReviewDto = SendDocumentReviewDto;
let MailerManageController = class MailerManageController {
    mailerManageService;
    constructor(mailerManageService) {
        this.mailerManageService = mailerManageService;
    }
    async sendVerificationEmail(dto) {
        try {
            const verificationCode = this.mailerManageService.generateVerificationCode();
            const emailData = {
                ...dto,
                verificationCode,
            };
            let result;
            if (dto.registrationType === prisma_1.RegistrationMethod.ADMIN_DRIVEN) {
                if (dto.isAdminDriven == true) {
                    result =
                        await this.mailerManageService.sendAdminDrivenHeadOfHouseholdEmail(emailData);
                }
                else {
                    result =
                        await this.mailerManageService.sendHeadOfHouseholdVerificationEmail(emailData);
                }
            }
            else {
                if (dto.isAdminDriven == false) {
                    result =
                        await this.mailerManageService.sendAdminDrivenFamilyMemberEmail(emailData);
                }
                else {
                    result =
                        await this.mailerManageService.sendFamilyMemberVerificationEmail(emailData);
                }
            }
            if (!result) {
                throw new common_1.HttpException('Gagal untuk mengirim email verifikasi', common_1.HttpStatus.BAD_REQUEST);
            }
            return {
                message: 'Email verifikasi berhasil dikirim',
                verificationCode,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async sendApprovalNotification(dto) {
        try {
            const result = await this.mailerManageService.sendFamilyMemberApprovalNotification(dto);
            if (!result) {
                throw new common_1.HttpException('Gagal mengirim pemberitahuan persetujuan', common_1.HttpStatus.BAD_REQUEST);
            }
            return {
                message: 'Pemberitahuan persetujuan berhasil dikirim',
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async sendDocumentReview(dto) {
        try {
            const reviewData = {
                ...dto,
                submissionDate: new Date().toLocaleDateString('id-ID'),
            };
            const result = await this.mailerManageService.sendDocumentVerificationRequestToAdmin(reviewData);
            if (!result) {
                throw new common_1.HttpException('Failed to send document review request', common_1.HttpStatus.BAD_REQUEST);
            }
            return {
                message: 'Document review request sent successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async sendWelcomeEmail(body) {
        try {
            const uniqueCode = this.mailerManageService.generateUniqueCode();
            const welcomeData = {
                ...body,
                uniqueCode,
            };
            let result;
            if (body.registrationType === 'head-of-household') {
                result =
                    await this.mailerManageService.sendHeadOfHouseholdWelcomeEmail(welcomeData);
            }
            else {
                result =
                    await this.mailerManageService.sendFamilyMemberWelcomeEmail(welcomeData);
            }
            if (!result) {
                throw new common_1.HttpException('Failed to send welcome email', common_1.HttpStatus.BAD_REQUEST);
            }
            return {
                message: 'Welcome email sent successfully',
                uniqueCode,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.MailerManageController = MailerManageController;
__decorate([
    (0, common_1.Post)('send-verification'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SendVerificationEmailDto]),
    __metadata("design:returntype", Promise)
], MailerManageController.prototype, "sendVerificationEmail", null);
__decorate([
    (0, common_1.Post)('send-document-review'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SendApprovalNotificationDto]),
    __metadata("design:returntype", Promise)
], MailerManageController.prototype, "sendApprovalNotification", null);
__decorate([
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SendDocumentReviewDto]),
    __metadata("design:returntype", Promise)
], MailerManageController.prototype, "sendDocumentReview", null);
__decorate([
    (0, common_1.Post)('send-welcome'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MailerManageController.prototype, "sendWelcomeEmail", null);
exports.MailerManageController = MailerManageController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [mailer_manage_service_1.MailerManageService])
], MailerManageController);
//# sourceMappingURL=mailer-manage.controller.js.map