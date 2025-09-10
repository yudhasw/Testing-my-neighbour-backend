import { AuthService } from './auth.service';
import { RegistRequest } from '../../../dtos/requests/regist-request';
import { SignInRequest } from '../../../dtos/requests/sign-in-request';
import { Request as expressRequest } from 'express';
import { DatabaseService } from 'src/common/database/database.service';
export declare class AuthController {
    private readonly authService;
    private readonly prisma;
    constructor(authService: AuthService, prisma: DatabaseService);
    registration(registrationDto: RegistRequest, files?: Express.Multer.File[]): Promise<{
        message: string;
        userId: string;
        residentId: string;
        requiresApproval: boolean;
        verificationCode: string;
    }>;
    signIn(signInDto: SignInRequest): Promise<{
        accessToken: string;
        refreshToken: string;
        message: string;
        user: {
            id: string;
            username: string;
            email: string;
            fullName: string;
            resident: ({
                unit: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: import("src/common/database/generated/prisma").$Enums.UnitStatus;
                    unitNumber: string;
                    buildingName: string | null;
                    unitOwnership: string[];
                    floorNumber: number | null;
                    numberOfRooms: number | null;
                    priceSale: number;
                    squareFootage: number | null;
                    location: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                emergencyContactName: string | null;
                emergencyContactNumber: string | null;
                movedInDate: Date;
                movedOutDate: Date | null;
                familyCode: string | null;
                residentStatus: import("src/common/database/generated/prisma").$Enums.ResidentStatus | null;
                unitId: string | null;
                kprPaymentAmount: number | null;
                kprDueDate: Date | null;
                isKprPaid: boolean | null;
                registrationStatus: import("src/common/database/generated/prisma").$Enums.RegistrationStatus;
                registrationMethod: import("src/common/database/generated/prisma").$Enums.RegistrationMethod;
                approvedBy: string | null;
                approvalDate: Date | null;
                rejectionReason: string | null;
                pendingApproval: boolean;
                approvedByHeadOfHousehold: string | null;
            }) | null;
        };
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    refreshToken(req: expressRequest & {
        user: any;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getProfile(req: expressRequest & {
        user: any;
    }): Promise<{
        message: string;
        userId: ({
            Resident: ({
                unit: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: import("src/common/database/generated/prisma").$Enums.UnitStatus;
                    unitNumber: string;
                    buildingName: string | null;
                    unitOwnership: string[];
                    floorNumber: number | null;
                    numberOfRooms: number | null;
                    priceSale: number;
                    squareFootage: number | null;
                    location: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                emergencyContactName: string | null;
                emergencyContactNumber: string | null;
                movedInDate: Date;
                movedOutDate: Date | null;
                familyCode: string | null;
                residentStatus: import("src/common/database/generated/prisma").$Enums.ResidentStatus | null;
                unitId: string | null;
                kprPaymentAmount: number | null;
                kprDueDate: Date | null;
                isKprPaid: boolean | null;
                registrationStatus: import("src/common/database/generated/prisma").$Enums.RegistrationStatus;
                registrationMethod: import("src/common/database/generated/prisma").$Enums.RegistrationMethod;
                approvedBy: string | null;
                approvalDate: Date | null;
                rejectionReason: string | null;
                pendingApproval: boolean;
                approvedByHeadOfHousehold: string | null;
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            fullName: string;
            firstName: string;
            lastName: string;
            username: string;
            dateOfBirth: Date | null;
            contactNumber: string | null;
            primaryEmail: string;
            secondaryEmail: string | null;
            password: string;
            sessionToken: string | null;
            emailVerificationToken: string | null;
            passwordResetToken: string | null;
            role: import("src/common/database/generated/prisma").$Enums.UserRole;
            gender: import("src/common/database/generated/prisma").$Enums.Gender | null;
        }) | null;
    }>;
    getFamilyApprovals(req: expressRequest & {
        user: any;
    }): Promise<{
        message: string;
        approvals: ({
            familyMember: {
                user: {
                    id: string;
                    fullName: string;
                    contactNumber: string | null;
                    primaryEmail: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                emergencyContactName: string | null;
                emergencyContactNumber: string | null;
                movedInDate: Date;
                movedOutDate: Date | null;
                familyCode: string | null;
                residentStatus: import("src/common/database/generated/prisma").$Enums.ResidentStatus | null;
                unitId: string | null;
                kprPaymentAmount: number | null;
                kprDueDate: Date | null;
                isKprPaid: boolean | null;
                registrationStatus: import("src/common/database/generated/prisma").$Enums.RegistrationStatus;
                registrationMethod: import("src/common/database/generated/prisma").$Enums.RegistrationMethod;
                approvedBy: string | null;
                approvalDate: Date | null;
                rejectionReason: string | null;
                pendingApproval: boolean;
                approvedByHeadOfHousehold: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("src/common/database/generated/prisma").$Enums.ApprovalStatus;
            familyMemberId: string;
            headOfHouseholdId: string;
            requestedAt: Date;
            respondedAt: Date | null;
            notes: string | null;
        })[];
    }>;
    approveFamily(approvalId: string, req: expressRequest & {
        user: any;
    }, approvalData: {
        action: 'APPROVE' | 'REJECT';
        notes?: string;
    }): Promise<{
        message: string;
        approval: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("src/common/database/generated/prisma").$Enums.ApprovalStatus;
            familyMemberId: string;
            headOfHouseholdId: string;
            requestedAt: Date;
            respondedAt: Date | null;
            notes: string | null;
        };
    }>;
    logout(req: expressRequest & {
        user: any;
    }): Promise<{
        message: string;
    }>;
}
