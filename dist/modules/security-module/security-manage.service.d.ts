import { CreateSecurityManageDto } from '../../dtos/requests/create/create-security-manage.dto';
import { UpdateSecurityManageDto } from '../../dtos/requests/update/update-security-manage.dto';
import { DatabaseService } from '../../common/database/database.service';
export declare class SecurityManageService {
    private readonly prisma;
    constructor(prisma: DatabaseService);
    create(createRequest: CreateSecurityManageDto): Promise<{
        title: string;
        employeeId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        status: import("src/common/database/generated/prisma").$Enums.MaintenanceStatus;
        location: string;
        incidentDate: Date;
        isPublished: boolean;
    }>;
    findAll(): Promise<({
        employee: {
            user: {
                fullName: string;
                firstName: string;
                lastName: string;
                username: string;
                contactNumber: string | null;
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
        };
    } & {
        title: string;
        employeeId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        status: import("src/common/database/generated/prisma").$Enums.MaintenanceStatus;
        location: string;
        incidentDate: Date;
        isPublished: boolean;
    })[]>;
    findOne(id: string): Promise<{
        employee: {
            user: {
                fullName: string;
                firstName: string;
                lastName: string;
                username: string;
                contactNumber: string | null;
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
        };
    } & {
        title: string;
        employeeId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        status: import("src/common/database/generated/prisma").$Enums.MaintenanceStatus;
        location: string;
        incidentDate: Date;
        isPublished: boolean;
    }>;
    update(id: string, updateRequest: UpdateSecurityManageDto): Promise<{
        title: string;
        employeeId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        status: import("src/common/database/generated/prisma").$Enums.MaintenanceStatus;
        location: string;
        incidentDate: Date;
        isPublished: boolean;
    }>;
    remove(id: string): Promise<{
        title: string;
        employeeId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        status: import("src/common/database/generated/prisma").$Enums.MaintenanceStatus;
        location: string;
        incidentDate: Date;
        isPublished: boolean;
    }>;
}
