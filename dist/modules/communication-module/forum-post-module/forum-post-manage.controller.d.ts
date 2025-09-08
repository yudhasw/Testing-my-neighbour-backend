import { ForumPostManageService } from './forum-post-manage.service';
import { CreateForumPostManageDto } from '../../../dtos/requests/create/create-forum-post-manage.dto';
import { UpdateForumPostManageDto } from '../../../dtos/requests/update/update-forum-post-manage.dto';
export declare class ForumPostManageController {
    private readonly forumPostManageService;
    constructor(forumPostManageService: ForumPostManageService);
    create(createForumPostManageDto: CreateForumPostManageDto, files?: Express.Multer.File[]): Promise<{
        tags: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tagName: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        content: string;
        attachments: string[];
        authorRole: import("src/common/database/generated/prisma").$Enums.UserRole;
        publishedAt: Date;
    }>;
    findAll(): Promise<{
        attachments: string[];
        user: {
            fullName: string;
            firstName: string;
            lastName: string;
            username: string;
            role: import("src/common/database/generated/prisma").$Enums.UserRole;
        };
        _count: {
            tags: number;
            comments: number;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        content: string;
        authorRole: import("src/common/database/generated/prisma").$Enums.UserRole;
        publishedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        attachments: string[];
        user: {
            fullName: string;
            firstName: string;
            lastName: string;
            username: string;
            role: import("src/common/database/generated/prisma").$Enums.UserRole;
        };
        tags: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tagName: string;
        }[];
        comments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            content: string;
            postId: string;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        content: string;
        authorRole: import("src/common/database/generated/prisma").$Enums.UserRole;
        publishedAt: Date;
    }>;
    update(id: string, updateForumPostManageDto: UpdateForumPostManageDto, files?: Express.Multer.File[]): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        content: string;
        attachments: string[];
        authorRole: import("src/common/database/generated/prisma").$Enums.UserRole;
        publishedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        title: string;
        content: string;
        attachments: string[];
        authorRole: import("src/common/database/generated/prisma").$Enums.UserRole;
        publishedAt: Date;
    }>;
}
