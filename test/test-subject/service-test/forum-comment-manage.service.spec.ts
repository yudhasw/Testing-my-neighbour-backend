/* eslint-disable @typescript-eslint/no-explicit-any */
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ForumCommentManageService } from '../../../src/modules/communication-module/forum-comment-module/forum-comment-manage.service';
import { DatabaseService } from '../../../src/common/database/database.service';
import { PrismaClientKnownRequestError } from '../../../src/common/database/generated/prisma/runtime/library';

describe('ForumCommentManageService', () => {
  let service: ForumCommentManageService;

  const prismaMock = {
    forumComments: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as unknown as DatabaseService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ForumCommentManageService(prismaMock);
  });

  // Helper: error Prisma P2025
  const prismaP2025 = () =>
    new PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: 'test',
    });

  const createDto = {
    content: 'Komentar pertama',
    postId: 'post-1',
    userId: 'user-1',
  };

  const updateDto = {
    content: 'Komentar diubah',
    postId: 'post-2',
    userId: 'user-2',
  };

  describe('create()', () => {
    it('Positive Case - Data berhasil dibuat', async () => {
      (prismaMock.forumComments.create as jest.Mock).mockResolvedValue({
        id: 'c-1',
        ...createDto,
      });

      const res = await service.create(createDto as any);
      expect(prismaMock.forumComments.create).toHaveBeenCalledWith({
        data: {
          content: createDto.content,
          postId: createDto.postId,
          userId: createDto.userId,
        },
      });
      expect(res.id).toBe('c-1');
    });

    it('Negative Case - InternalServerErrorException', async () => {
      (prismaMock.forumComments.create as jest.Mock).mockRejectedValue(new Error('db err'));
      await expect(service.create(createDto as any)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  })

  describe('findAll()', () => {
    it('findAll() - Positive Case - Data berhasil ditemukan (include user, orderBy createdAt asc)', async () => {
      (prismaMock.forumComments.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'c-1',
          content: 'A',
          user: {
            fullName: 'Andrea Hirata',
            firstName: 'Andrea',
            lastName: 'Hirata',
            role: 'USER',
            username: 'andreaH',
          },
        },
        {
          id: 'c-2',
          content: 'A',
          user: {
            fullName: 'Pramoedya Ananta',
            firstName: 'Pramoedya',
            lastName: 'Ananta',
            role: 'USER',
            username: 'pramoedyaA',
          },
        }
      ]);

      const res = await service.findAll();
      expect(prismaMock.forumComments.findMany).toHaveBeenCalledWith({
        include: {
          user: {
            select: {
              fullName: true,
              firstName: true,
              lastName: true,
              role: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
      expect(res).toHaveLength(2);
    });

    it('findAll() - Negative Case - InternalServerErrorException', async () => {
      (prismaMock.forumComments.findMany as jest.Mock).mockRejectedValue(new Error('db err'));
      await expect(service.findAll()).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  })

  describe('findOne(id: string)', () => {
    it('findOne() - Positive Case - Data sesuai id berhasil ditemukan (include user & post)', async () => {
      (prismaMock.forumComments.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'c-1',
        content: 'A',
        user: { fullName: 'X', firstName: 'Y', lastName: 'Z', role: 'USER', username: 'u' },
        post: { title: 'T', content: 'C', attachments: [], tags: ['tag'] },
      });

      const res = await service.findOne('c-1');
      expect(prismaMock.forumComments.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'c-1' },
        include: {
          user: {
            select: {
              fullName: true,
              firstName: true,
              lastName: true,
              role: true,
              username: true,
            },
          },
          post: {
            select: {
              title: true,
              content: true,
              attachments: true,
              tags: true,
            },
          },
        },
      });
      expect(res.id).toBe('c-1');
    });

    it('findOne() - Negative Case - InternalServerErrorException', async () => {
      (prismaMock.forumComments.findUniqueOrThrow as jest.Mock).mockRejectedValue(
        new Error('db err'),
      );
      await expect(service.findOne('x')).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  })

  describe('update()', () => {
    it('update() - Positive Case - Data sesuai id berhasil ditemukan', async () => {
      (prismaMock.forumComments.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'c-1',
        content: 'old',
      });

      (prismaMock.forumComments.update as jest.Mock).mockResolvedValue({
        id: 'c-1',
        ...updateDto,
      });

      const res = await service.update('c-1', updateDto as any);
      expect(prismaMock.forumComments.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'c-1' },
      });
      expect(prismaMock.forumComments.update).toHaveBeenCalledWith({
        where: { id: 'c-1' },
        data: expect.objectContaining({
          content: updateDto.content,
          postId: updateDto.postId,
          userId: updateDto.userId,
          updatedAt: expect.any(Date),
        }),
      });
      expect(res.id).toBe('c-1');
    });

    it('update() - Negative Case - NotFoundException saat pre-check', async () => {
      const err = new Error('not found');
      (err as any).name = 'NotFoundError';
      (prismaMock.forumComments.findUniqueOrThrow as jest.Mock).mockRejectedValue(err);

      await expect(service.update('missing', updateDto as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('update() - Negative Case - P2025 saat pre-check', async () => {
      (prismaMock.forumComments.findUniqueOrThrow as jest.Mock).mockRejectedValue(prismaP2025());
      await expect(service.update('missing', updateDto as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('update() - Negative Case - error saat update/InternalServerErrorException', async () => {
      (prismaMock.forumComments.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'c-1',
      });
      (prismaMock.forumComments.update as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.update('c-1', updateDto as any)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  })

  describe('remove()', () => {
    it('remove() - Positive Case - Data berhasil dihapus', async () => {
      (prismaMock.forumComments.findUnique as jest.Mock).mockResolvedValue({ id: 'c-1' });
      (prismaMock.forumComments.delete as jest.Mock).mockResolvedValue({ id: 'c-1' });

      const res = await service.remove('c-1');
      expect(prismaMock.forumComments.findUnique).toHaveBeenCalledWith({ where: { id: 'c-1' } });
      expect(prismaMock.forumComments.delete).toHaveBeenCalledWith({ where: { id: 'c-1' } });
      expect(res).toEqual({ id: 'c-1' });
    });

    it('remove() - Negative Case - findUnique berisi null', async () => {
      (prismaMock.forumComments.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('remove() - Negative Case - NotFoundException', async () => {
      const err = new Error('not found');
      (err as any).name = 'NotFoundError';
      (prismaMock.forumComments.findUnique as jest.Mock).mockRejectedValue(err);

      await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('remove() - Negative Case - P2025/NotFoundException', async () => {
      (prismaMock.forumComments.findUnique as jest.Mock).mockResolvedValue({ id: 'c-1' });
      (prismaMock.forumComments.delete as jest.Mock).mockRejectedValue(prismaP2025());

      await expect(service.remove('c-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('remove() - Negative Case - InternalServerErrorException', async () => {
      (prismaMock.forumComments.findUnique as jest.Mock).mockResolvedValue({ id: 'c-1' });
      (prismaMock.forumComments.delete as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.remove('c-1')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });
})








