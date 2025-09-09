import { ForumCommentManageService } from './forum-comment-manage.service';
import { CreateForumCommentManageDto } from '../../../dtos/requests/create/create-forum-comment-manage.dto';
import { UpdateForumCommentManageDto } from '../../../dtos/requests/update/update-forum-comment-manage.dto';
export declare class ForumCommentManageController {
    private readonly forumCommentManageService;
    constructor(forumCommentManageService: ForumCommentManageService);
    create(createForumCommentManageDto: CreateForumCommentManageDto): Promise<{
        content: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        postId: string;
    }>;
    findAll(): Promise<({
        user: {
            fullName: string;
            firstName: string;
            lastName: string;
            username: string;
            role: import("src/common/database/generated/prisma").$Enums.UserRole;
        };
    } & {
        content: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        postId: string;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            fullName: string;
            firstName: string;
            lastName: string;
            username: string;
            role: import("src/common/database/generated/prisma").$Enums.UserRole;
        };
        post: {
            title: string;
            content: string;
            attachments: string[];
            tags: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tagName: string;
            }[];
        };
    } & {
        content: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        postId: string;
    }>;
    update(id: string, updateForumCommentManageDto: UpdateForumCommentManageDto): Promise<{
        content: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        postId: string;
    }>;
    remove(id: string): Promise<{
        content: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        postId: string;
    }>;
}
