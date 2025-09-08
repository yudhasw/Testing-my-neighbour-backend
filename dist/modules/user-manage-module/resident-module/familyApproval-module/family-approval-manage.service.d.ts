import { CreateFamilyApprovalManageDto } from '../../../../dtos/requests/create/create-family-approval-manage.dto';
import { UpdateFamilyApprovalManageDto } from '../../../../dtos/requests/update/update-family-approval-manage.dto';
import { DatabaseService } from '../../../../common/database/database.service';
export declare class FamilyApprovalManageService {
    private readonly prisma;
    constructor(prisma: DatabaseService);
    create(createRequest: CreateFamilyApprovalManageDto): Promise<{
        id: string;
        status: import("../../../../common/database/generated/prisma").$Enums.ApprovalStatus;
        requestedAt: Date;
        respondedAt: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyMemberId: string;
        headOfHouseholdId: string;
    }>;
    findAll(): Promise<({
        familyMember: {
            user: {
                fullName: string;
                firstName: string;
                lastName: string;
                username: string;
                dateOfBirth: Date | null;
                contactNumber: string | null;
                primaryEmail: string;
                gender: import("../../../../common/database/generated/prisma").$Enums.Gender | null;
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
            residentStatus: import("../../../../common/database/generated/prisma").$Enums.ResidentStatus | null;
            unitId: string | null;
            kprPaymentAmount: number | null;
            kprDueDate: Date | null;
            isKprPaid: boolean | null;
            registrationStatus: import("../../../../common/database/generated/prisma").$Enums.RegistrationStatus;
            registrationMethod: import("../../../../common/database/generated/prisma").$Enums.RegistrationMethod;
            approvedBy: string | null;
            approvalDate: Date | null;
            rejectionReason: string | null;
            pendingApproval: boolean;
            approvedByHeadOfHousehold: string | null;
        };
        headOfHousehold: {
            user: {
                fullName: string;
                firstName: string;
                lastName: string;
                username: string;
                dateOfBirth: Date | null;
                contactNumber: string | null;
                primaryEmail: string;
                gender: import("../../../../common/database/generated/prisma").$Enums.Gender | null;
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
            residentStatus: import("../../../../common/database/generated/prisma").$Enums.ResidentStatus | null;
            unitId: string | null;
            kprPaymentAmount: number | null;
            kprDueDate: Date | null;
            isKprPaid: boolean | null;
            registrationStatus: import("../../../../common/database/generated/prisma").$Enums.RegistrationStatus;
            registrationMethod: import("../../../../common/database/generated/prisma").$Enums.RegistrationMethod;
            approvedBy: string | null;
            approvalDate: Date | null;
            rejectionReason: string | null;
            pendingApproval: boolean;
            approvedByHeadOfHousehold: string | null;
        };
    } & {
        id: string;
        status: import("../../../../common/database/generated/prisma").$Enums.ApprovalStatus;
        requestedAt: Date;
        respondedAt: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyMemberId: string;
        headOfHouseholdId: string;
    })[]>;
    findOne(id: string): Promise<{
        familyMember: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            emergencyContactName: string | null;
            emergencyContactNumber: string | null;
            movedInDate: Date;
            movedOutDate: Date | null;
            familyCode: string | null;
            residentStatus: import("../../../../common/database/generated/prisma").$Enums.ResidentStatus | null;
            unitId: string | null;
            kprPaymentAmount: number | null;
            kprDueDate: Date | null;
            isKprPaid: boolean | null;
            registrationStatus: import("../../../../common/database/generated/prisma").$Enums.RegistrationStatus;
            registrationMethod: import("../../../../common/database/generated/prisma").$Enums.RegistrationMethod;
            approvedBy: string | null;
            approvalDate: Date | null;
            rejectionReason: string | null;
            pendingApproval: boolean;
            approvedByHeadOfHousehold: string | null;
        };
        headOfHousehold: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            emergencyContactName: string | null;
            emergencyContactNumber: string | null;
            movedInDate: Date;
            movedOutDate: Date | null;
            familyCode: string | null;
            residentStatus: import("../../../../common/database/generated/prisma").$Enums.ResidentStatus | null;
            unitId: string | null;
            kprPaymentAmount: number | null;
            kprDueDate: Date | null;
            isKprPaid: boolean | null;
            registrationStatus: import("../../../../common/database/generated/prisma").$Enums.RegistrationStatus;
            registrationMethod: import("../../../../common/database/generated/prisma").$Enums.RegistrationMethod;
            approvedBy: string | null;
            approvalDate: Date | null;
            rejectionReason: string | null;
            pendingApproval: boolean;
            approvedByHeadOfHousehold: string | null;
        };
    } & {
        id: string;
        status: import("../../../../common/database/generated/prisma").$Enums.ApprovalStatus;
        requestedAt: Date;
        respondedAt: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyMemberId: string;
        headOfHouseholdId: string;
    }>;
    update(id: string, updateRequest: UpdateFamilyApprovalManageDto): Promise<{
        id: string;
        status: import("../../../../common/database/generated/prisma").$Enums.ApprovalStatus;
        requestedAt: Date;
        respondedAt: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyMemberId: string;
        headOfHouseholdId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        status: import("../../../../common/database/generated/prisma").$Enums.ApprovalStatus;
        requestedAt: Date;
        respondedAt: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyMemberId: string;
        headOfHouseholdId: string;
    }>;
}
