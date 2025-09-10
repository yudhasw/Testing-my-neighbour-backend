import { UnitManageService } from './unit-manage.service';
import { CreateUnitManageDto } from '../../dtos/requests/create/create-unit-manage.dto';
import { UpdateUnitManageDto } from '../../dtos/requests/update/update-unit-manage.dto';
export declare class UnitManageController {
    private readonly unitManageService;
    constructor(unitManageService: UnitManageService);
    create(createUnitManageDto: CreateUnitManageDto): Promise<{
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
    }>;
    findAll(): Promise<({
        _count: {
            Complaints: number;
            Bills: number;
            Payments: number;
            Residents: number;
        };
    } & {
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
    })[]>;
    findOne(id: string): Promise<{
        Complaints: {
            title: string;
            images: string[];
            description: string;
            category: import("src/common/database/generated/prisma").$Enums.MaintenanceCategory;
            status: import("src/common/database/generated/prisma").$Enums.ComplaintStatus;
            submittedAt: Date;
            resolvedAt: Date | null;
            resolutionDetails: string | null;
        }[];
        Bills: {
            amount: number;
        }[];
        Residents: ({
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
            movedInDate: Date;
            residentStatus: import("src/common/database/generated/prisma").$Enums.ResidentStatus | null;
            kprPaymentAmount: number | null;
            kprDueDate: Date | null;
            isKprPaid: boolean | null;
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
        })[];
    } & {
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
    }>;
    update(id: string, updateUnitManageDto: UpdateUnitManageDto): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
