import { CreateAppUserManageDto } from '../../../dtos/requests/create/create-app-user-manage.dto';
import { UpdateAppUserManageDto } from '../../../dtos/requests/update/update-app-user-manage.dto';
import { DatabaseService } from '../../../common/database/database.service';
export declare class AppUserManageService {
    private readonly prisma;
    constructor(prisma: DatabaseService);
    create(createRequest: CreateAppUserManageDto): Promise<{
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
        sessionToken: string | null;
        emailVerificationToken: string | null;
        passwordResetToken: string | null;
        role: import("src/common/database/generated/prisma").$Enums.UserRole;
        gender: import("src/common/database/generated/prisma").$Enums.Gender | null;
    }>;
    findAll(): Promise<({
        Resident: {
            emergencyContactName: string | null;
            emergencyContactNumber: string | null;
            movedInDate: Date;
            movedOutDate: Date | null;
        } | null;
        Employee: {
            employeeNumberId: string;
            hireDate: Date;
            employeePosition: import("src/common/database/generated/prisma").$Enums.EmployeeRole;
            workingHours: number;
            salary: number;
            bonus: number | null;
        } | null;
        _count: {
            ForumPosts: number;
            ForumComments: number;
        };
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
    })[]>;
    findOne(id: string): Promise<{
        Resident: {
            emergencyContactName: string | null;
            emergencyContactNumber: string | null;
            movedInDate: Date;
            movedOutDate: Date | null;
            unit: {
                unitNumber: string;
                buildingName: string | null;
                floorNumber: number | null;
                location: string;
            } | null;
        } | null;
        Employee: {
            Complaints: {
                status: import("src/common/database/generated/prisma").$Enums.ComplaintStatus;
                title: string;
                description: string;
                submittedAt: Date;
            }[];
            employeeNumberId: string;
            hireDate: Date;
            employeePosition: import("src/common/database/generated/prisma").$Enums.EmployeeRole;
            workingHours: number;
            salary: number;
            bonus: number | null;
            Announcements: {
                title: string;
                content: string;
                publishDate: Date;
                expiryDate: Date | null;
            }[];
        } | null;
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
    }>;
    update(id: string, updateRequest: UpdateAppUserManageDto): Promise<{
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
        sessionToken: string | null;
        emailVerificationToken: string | null;
        passwordResetToken: string | null;
        role: import("src/common/database/generated/prisma").$Enums.UserRole;
        gender: import("src/common/database/generated/prisma").$Enums.Gender | null;
    }>;
    remove(id: string): Promise<{
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
    }>;
    passwordHashing(password: string): Promise<string>;
    compare(password: string, hashedPassword: string): Promise<boolean>;
}
