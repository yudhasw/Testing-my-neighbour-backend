import { ForumCommentManageService } from './forum-comment-manage.service';
import { CreateForumCommentManageDto } from '../../../dtos/requests/create/create-forum-comment-manage.dto';
import { UpdateForumCommentManageDto } from '../../../dtos/requests/update/update-forum-comment-manage.dto';
export declare class ForumCommentManageController {
    private readonly forumCommentManageService;
    constructor(forumCommentManageService: ForumCommentManageService);
    create(createForumCommentManageDto: CreateForumCommentManageDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        content: string;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        content: string;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        content: string;
        postId: string;
    }>;
    update(id: string, updateForumCommentManageDto: UpdateForumCommentManageDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        content: string;
        postId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        content: string;
        postId: string;
    }>;
}
