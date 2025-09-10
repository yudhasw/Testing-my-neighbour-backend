import { ComplaintManageService } from './complaint-manage.service';
import { CreateComplaintManageDto } from '../../../dtos/requests/create/create-complaint-manage.dto';
import { UpdateComplaintManageDto } from '../../../dtos/requests/update/update-complaint-manage.dto';
export declare class ComplaintManageController {
    private readonly complaintManageService;
    constructor(complaintManageService: ComplaintManageService);
    create(createComplaintManageDto: CreateComplaintManageDto): Promise<{
        title: string;
        employeeId: string | null;
        images: string[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        unitId: string | null;
        description: string;
        category: import("src/common/database/generated/prisma").$Enums.MaintenanceCategory;
        status: import("src/common/database/generated/prisma").$Enums.ComplaintStatus;
        submittedAt: Date;
        resolvedAt: Date | null;
        resolutionDetails: string | null;
        residentId: string;
    }>;
    findAll(): Promise<{
        title: string;
        employeeId: string | null;
        images: string[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        unitId: string | null;
        description: string;
        category: import("src/common/database/generated/prisma").$Enums.MaintenanceCategory;
        status: import("src/common/database/generated/prisma").$Enums.ComplaintStatus;
        submittedAt: Date;
        resolvedAt: Date | null;
        resolutionDetails: string | null;
        residentId: string;
    }[]>;
    findOne(id: string): Promise<{
        employee: ({
            employeeNumberId: string;
            employeePosition: import("src/common/database/generated/prisma").$Enums.EmployeeRole;
            user: {
                id: string;
                fullName: string;
                firstName: string;
                lastName: string;
                username: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            employeeNumberId: string;
            hireDate: Date;
            employeePosition: import("src/common/database/generated/prisma").$Enums.EmployeeRole;
            workingHours: number;
            salary: number;
            bonus: number | null;
        }) | null;
        resident: {
            user: {
                id: string;
                fullName: string;
                firstName: string;
                lastName: string;
                username: string;
            };
            unit: {
                status: import("src/common/database/generated/prisma").$Enums.UnitStatus;
                unitNumber: string;
                buildingName: string | null;
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
        };
    } & {
        title: string;
        employeeId: string | null;
        images: string[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        unitId: string | null;
        description: string;
        category: import("src/common/database/generated/prisma").$Enums.MaintenanceCategory;
        status: import("src/common/database/generated/prisma").$Enums.ComplaintStatus;
        submittedAt: Date;
        resolvedAt: Date | null;
        resolutionDetails: string | null;
        residentId: string;
    }>;
    update(id: string, updateComplaintManageDto: UpdateComplaintManageDto): Promise<{
        title: string;
        employeeId: string | null;
        images: string[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        unitId: string | null;
        description: string;
        category: import("src/common/database/generated/prisma").$Enums.MaintenanceCategory;
        status: import("src/common/database/generated/prisma").$Enums.ComplaintStatus;
        submittedAt: Date;
        resolvedAt: Date | null;
        resolutionDetails: string | null;
        residentId: string;
    }>;
    remove(id: string): Promise<{
        title: string;
        employeeId: string | null;
        images: string[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        unitId: string | null;
        description: string;
        category: import("src/common/database/generated/prisma").$Enums.MaintenanceCategory;
        status: import("src/common/database/generated/prisma").$Enums.ComplaintStatus;
        submittedAt: Date;
        resolvedAt: Date | null;
        resolutionDetails: string | null;
        residentId: string;
    }>;
}
