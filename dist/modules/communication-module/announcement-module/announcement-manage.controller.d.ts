import { AnnouncementManageService } from './announcement-manage.service';
import { CreateAnnouncementManageDto } from '../../../dtos/requests/create/create-announcement-manage.dto';
import { UpdateAnnouncementManageDto } from '../../../dtos/requests/update/update-announcement-manage.dto';
export declare class AnnouncementManageController {
    private readonly announcementManageService;
    constructor(announcementManageService: AnnouncementManageService);
    create(createAnnouncementManageDto: CreateAnnouncementManageDto, files?: Express.Multer.File[]): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        employeeId: string;
        content: string;
        attachments: string[];
        publishDate: Date;
        expiryDate: Date | null;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        employeeId: string;
        content: string;
        publishDate: Date;
        expiryDate: Date | null;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        employeeId: string;
        content: string;
        publishDate: Date;
        expiryDate: Date | null;
    }>;
    update(id: string, updateAnnouncementManageDto: UpdateAnnouncementManageDto, files?: Express.Multer.File[]): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        employeeId: string;
        content: string;
        attachments: string[];
        publishDate: Date;
        expiryDate: Date | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        employeeId: string;
        content: string;
        attachments: string[];
        publishDate: Date;
        expiryDate: Date | null;
    }>;
}
