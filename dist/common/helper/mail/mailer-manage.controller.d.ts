import { MailerManageService } from './mailer-manage.service';
import { RegistrationMethod } from '../../../common/database/generated/prisma';
export declare class SendVerificationEmailDto {
    fullName: string;
    email: string;
    verificationCode: string;
    registrationType?: RegistrationMethod;
    unitNumber?: string;
    propertyName?: string;
    isAdminDriven?: boolean;
}
export declare class SendApprovalNotificationDto {
    headOfHouseholdName: string;
    headOfHouseholdEmail: string;
    familyMemberName: string;
    familyMemberEmail: string;
    uniqueCode: string;
    actionUrl: string;
}
export declare class SendDocumentReviewDto {
    applicantName: string;
    applicantEmail: string;
    adminName: string;
    adminEmail: string;
    documentType: 'AJB' | 'SHM' | 'KPR' | 'ID_CARD' | 'FAMILY_CARD';
    submissionDate: string;
    reviewUrl: string;
}
export declare class MailerManageController {
    private readonly mailerManageService;
    constructor(mailerManageService: MailerManageService);
    sendVerificationEmail(dto: SendVerificationEmailDto): Promise<{
        message: string;
        verificationCode: string;
    }>;
    sendApprovalNotification(dto: SendApprovalNotificationDto): Promise<{
        message: string;
    }>;
    sendDocumentReview(dto: SendDocumentReviewDto): Promise<{
        message: string;
    }>;
    sendWelcomeEmail(body: {
        fullName: string;
        email: string;
        registrationType: 'head-of-household' | 'family-member';
        propertyName: string;
        unitNumber: string;
        loginUrl: string;
    }): Promise<{
        message: string;
        uniqueCode: string;
    }>;
}
