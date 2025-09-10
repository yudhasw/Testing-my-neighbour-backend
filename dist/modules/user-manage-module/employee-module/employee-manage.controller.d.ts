import { EmployeeManageService } from './employee-manage.service';
import { CreateEmployeeManageDto } from '../../../dtos/requests/create/create-employee-manage.dto';
import { UpdateEmployeeManageDto } from '../../../dtos/requests/update/update-employee-manage.dto';
export declare class EmployeeManageController {
    private readonly employeeManageService;
    constructor(employeeManageService: EmployeeManageService);
    create(createEmployeeManageDto: CreateEmployeeManageDto): Promise<{
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
    }>;
    findAll(): Promise<({
        user: {
            fullName: string;
            firstName: string;
            lastName: string;
            dateOfBirth: Date | null;
            contactNumber: string | null;
            primaryEmail: string;
            gender: import("src/common/database/generated/prisma").$Enums.Gender | null;
        };
        _count: {
            Announcements: number;
            Complaints: number;
            Bills: number;
            Payments: number;
            SecurityReports: number;
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
    })[]>;
    findOne(id: string): Promise<{
        user: {
            fullName: string;
            firstName: string;
            lastName: string;
            dateOfBirth: Date | null;
            contactNumber: string | null;
            primaryEmail: string;
            gender: import("src/common/database/generated/prisma").$Enums.Gender | null;
        };
        Announcements: {
            title: string;
            content: string;
            attachments: string[];
            publishDate: Date;
            expiryDate: Date | null;
        }[];
        Complaints: {
            title: string;
            description: string;
            status: import("src/common/database/generated/prisma").$Enums.ComplaintStatus;
            submittedAt: Date;
            resolvedAt: Date | null;
            resolutionDetails: string | null;
        }[];
        _count: {
            Announcements: number;
            Complaints: number;
            Bills: number;
            Payments: number;
            SecurityReports: number;
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
    }>;
    update(id: string, updateEmployeeManageDto: UpdateEmployeeManageDto): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
