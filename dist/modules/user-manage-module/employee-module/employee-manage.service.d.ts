import { CreateEmployeeManageDto } from '../../../dtos/requests/create/create-employee-manage.dto';
import { UpdateEmployeeManageDto } from '../../../dtos/requests/update/update-employee-manage.dto';
import { DatabaseService } from '../../../common/database/database.service';
import { GeneralHelper } from '../../../common/helper/generalHelper';
export declare class EmployeeManageService {
    private readonly prisma;
    private readonly helper;
    constructor(prisma: DatabaseService, helper: GeneralHelper);
    create(createRequest: CreateEmployeeManageDto): Promise<{
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
            Complaints: number;
            Payments: number;
            Bills: number;
            Announcements: number;
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
        Complaints: {
            status: import("src/common/database/generated/prisma").$Enums.ComplaintStatus;
            title: string;
            description: string;
            submittedAt: Date;
            resolvedAt: Date | null;
            resolutionDetails: string | null;
        }[];
        _count: {
            Complaints: number;
            Payments: number;
            Bills: number;
            Announcements: number;
            SecurityReports: number;
        };
        Announcements: {
            title: string;
            content: string;
            attachments: string[];
            publishDate: Date;
            expiryDate: Date | null;
        }[];
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
    update(id: string, updateRequest: UpdateEmployeeManageDto): Promise<{
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
