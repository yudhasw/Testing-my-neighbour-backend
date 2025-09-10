import { AnnouncementManageService } from './announcement-manage.service';
import { CreateAnnouncementManageDto } from '../../../dtos/requests/create/create-announcement-manage.dto';
import { UpdateAnnouncementManageDto } from '../../../dtos/requests/update/update-announcement-manage.dto';
export declare class AnnouncementManageController {
    private readonly announcementManageService;
    constructor(announcementManageService: AnnouncementManageService);
    create(createAnnouncementManageDto: CreateAnnouncementManageDto, files?: Express.Multer.File[]): Promise<{
        title: string;
        content: string;
        attachments: string[];
        publishDate: Date;
        expiryDate: Date | null;
        employeeId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        attachments: string[];
        employee: {
            user: {
                fullName: string;
                firstName: string;
                lastName: string;
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
        title: string;
        content: string;
        publishDate: Date;
        expiryDate: Date | null;
        employeeId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        attachments: string[];
        employee: {
            user: {
                fullName: string;
                firstName: string;
                lastName: string;
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
        title: string;
        content: string;
        publishDate: Date;
        expiryDate: Date | null;
        employeeId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateAnnouncementManageDto: UpdateAnnouncementManageDto, files?: Express.Multer.File[]): Promise<{
        title: string;
        content: string;
        attachments: string[];
        publishDate: Date;
        expiryDate: Date | null;
        employeeId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        title: string;
        content: string;
        attachments: string[];
        publishDate: Date;
        expiryDate: Date | null;
        employeeId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
