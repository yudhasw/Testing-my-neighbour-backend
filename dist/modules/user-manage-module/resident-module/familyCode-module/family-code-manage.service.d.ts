import { CreateFamilyCodeManageDto } from '../../../../dtos/requests/create/create-family-code-manage.dto';
import { UpdateFamilyCodeManageDto } from '../../../../dtos/requests/update/update-family-code-manage.dto';
import { DatabaseService } from '../../../../common/database/database.service';
export declare class FamilyCodeManageService {
    private readonly prisma;
    constructor(prisma: DatabaseService);
    create(createRequest: CreateFamilyCodeManageDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        headOfHousehold: string;
        unitId: string | null;
        code: string;
        isActive: boolean;
        maxMembers: number;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        headOfHousehold: string;
        unitId: string | null;
        code: string;
        isActive: boolean;
        maxMembers: number;
    }[]>;
    findOne(id: string): Promise<{
        unit: {
            id: string;
            status: import("src/common/database/generated/prisma").$Enums.UnitStatus;
            createdAt: Date;
            updatedAt: Date;
            unitNumber: string;
            buildingName: string | null;
            unitOwnership: string[];
            floorNumber: number | null;
            numberOfRooms: number | null;
            priceSale: number;
            squareFootage: number | null;
            location: string;
        } | null;
        headResident: {
            user: {
                fullName: string;
                firstName: string;
                lastName: string;
                username: string;
                dateOfBirth: Date | null;
                contactNumber: string | null;
                primaryEmail: string;
                gender: import("src/common/database/generated/prisma").$Enums.Gender | null;
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
        headOfHousehold: string;
        unitId: string | null;
        code: string;
        isActive: boolean;
        maxMembers: number;
    }>;
    update(id: string, updateRequest: UpdateFamilyCodeManageDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        headOfHousehold: string;
        unitId: string | null;
        code: string;
        isActive: boolean;
        maxMembers: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        headOfHousehold: string;
        unitId: string | null;
        code: string;
        isActive: boolean;
        maxMembers: number;
    }>;
}
