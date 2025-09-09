/* eslint-disable @typescript-eslint/no-explicit-any */
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ForumPostManageService } from '../../../src/modules/communication-module/forum-post-module/forum-post-manage.service';
import { DatabaseService } from '../../../src/common/database/database.service';
import { PrismaClientKnownRequestError } from '../../../src/common/database/generated/prisma/runtime/library';
import { GeneralHelper } from '../../../src/common/helper/generalHelper';

describe('ForumPostManageService', () => {
  let service: ForumPostManageService;

  const prismaMock = {
    users: {
      findUnique: jest.fn(),
    },
    forumPosts: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as unknown as DatabaseService;

  // Mocks untuk helper & UploadsServie
  const deleteFileSpy = jest.spyOn(GeneralHelper, 'deleteFile').mockImplementation(jest.fn());

  const processFilesMock = jest.fn();
  const safeParseAttachmentsMock = jest.fn();

  // Helper error Prisma P2025
  const prismaP2025 = () =>
    new PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: 'test',
    });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ForumPostManageService(prismaMock);

    // Override method turunan UploadsService pada instance service
    // @ts-expect-error: override untuk keperluan test
    service.processFiles = processFilesMock;
    // @ts-expect-error: override untuk keperluan test
    service.safeParseAttachments = safeParseAttachmentsMock;
  });

  const createDto = {
    title: 'Pengumuman Air',
    content: 'Pemadaman sementara',
    userId: 'user-1',
    authorRole: 'USER',
    tagId: 'tag-1',
    tagName: 'info',
  };

  const updateDto = {
    title: 'Pengumuman Air (Revisi)',
    content: 'Pemadaman bergeser',
    authorRole: 'ADMIN',
    userId: 'user-2',
    tagId: 'tag-2',
  };

  const filesMock = [
    { path: 'uploads/a.pdf', originalname: 'a.pdf' } as any,
    { path: 'uploads/b.jpg', originalname: 'b.jpg' } as any,
  ];

  
  describe('create()', () => {
    it('Positive Case - Berhasil membuat post dengan files & include tags', async () => {
      processFilesMock.mockReturnValue(['uploads/a.pdf', 'uploads/b.jpg']);
      (prismaMock.users.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1', role: 'ADMIN' });
      (prismaMock.forumPosts.create as jest.Mock).mockResolvedValue({
        id: 'fp-1',
        ...createDto,
        authorRole: 'ADMIN',
        attachments: ['uploads/a.pdf', 'uploads/b.jpg'],
        tags: [{ id: 'tag-1', tagName: 'info' }],
      });

      const res = await service.create(createDto as any, filesMock);

      expect(processFilesMock).toHaveBeenCalledWith(filesMock);
      expect(prismaMock.users.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.userId },
      });
      expect(prismaMock.forumPosts.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: createDto.title,
          content: createDto.content,
          authorRole: 'ADMIN',
          attachments: ['uploads/a.pdf', 'uploads/b.jpg'],
          user: { connect: { id: createDto.userId } },
          tags: {
            connectOrCreate: {
              create: { tagName: createDto.tagName },
              where: { id: createDto.tagId, tagName: createDto.tagName },
            },
          },
        }),
        include: { tags: true },
      });
      expect(res.id).toBe('fp-1');
    });

    it('Positive Case - user.role undefined → pakai authorRole dari DTO', async () => {
      processFilesMock.mockReturnValue([]);
      (prismaMock.users.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaMock.forumPosts.create as jest.Mock).mockResolvedValue({
        id: 'fp-2',
        ...createDto,
        authorRole: createDto.authorRole,
        attachments: [],
        tags: [{ id: 'tag-1', tagName: 'info' }],
      });

      const res = await service.create(createDto as any, undefined);

      expect(res.authorRole).toBe(createDto.authorRole);
    });

    it('Negative Case - NotFoundError pada proses create → NotFoundException', async () => {
      const err = new Error('not found');
      (err as any).name = 'NotFoundError';
      (prismaMock.forumPosts.create as jest.Mock).mockRejectedValue(err);

      await expect(service.create(createDto as any, undefined)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('Negative Case - P2025 pada proses create → NotFoundException', async () => {
      (prismaMock.forumPosts.create as jest.Mock).mockRejectedValue(prismaP2025());

      await expect(service.create(createDto as any, undefined)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('Negative Case - Error umum pada proses create → InternalServerErrorException', async () => {
      (prismaMock.forumPosts.create as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.create(createDto as any, undefined)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });


  describe('findAll()', () => {
    it('Positive Case - Data berhasil ditemukan & attachments diparse', async () => {
      (prismaMock.forumPosts.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'fp-1',
          title: 'A',
          content: 'X',
          attachments: '["p1","p2"]',
          user: { fullName: 'U', firstName: 'F', lastName: 'L', role: 'USER', username: 'u' },
          _count: { comments: 1, tags: 1 },
        },
        {
          id: 'fp-2',
          title: 'B',
          content: 'Y',
          attachments: null,
          user: { fullName: 'U2', firstName: 'F2', lastName: 'L2', role: 'ADMIN', username: 'u2' },
          _count: { comments: 0, tags: 0 },
        },
      ]);

      safeParseAttachmentsMock
        .mockReturnValueOnce(['p1', 'p2'])
        .mockReturnValueOnce([]); 

      const res = await service.findAll();

      expect(prismaMock.forumPosts.findMany).toHaveBeenCalledWith({
        include: {
          _count: { select: { comments: true, tags: true } },
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
        orderBy: { title: 'asc' },
      });
      expect(res[0].attachments).toEqual(['p1', 'p2']);
      expect(res[1].attachments).toEqual([]);
    });

    it('Negative Case - Error umum pada findAll → InternalServerErrorException', async () => {
      (prismaMock.forumPosts.findMany as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.findAll()).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });


  describe('findOne()', () => {
    it('Positive Case - Data berhasil ditemukan (include comments, tags, user) & attachments diparse', async () => {
      (prismaMock.forumPosts.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'fp-1',
        title: 'A',
        content: 'X',
        attachments: '["p1"]',
        comments: [{ id: 'c-1' }],
        tags: [{ id: 't-1', tagName: 'info' }],
        user: { username: 'u' },
      });
      safeParseAttachmentsMock.mockReturnValue(['p1']);

      const res = await service.findOne('fp-1');

      expect(prismaMock.forumPosts.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'fp-1' },
        include: {
          comments: true,
          tags: true,
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
      });
      expect(res.attachments).toEqual(['p1']);
    });

    it('Negative Case - Error umum pada findOne → InternalServerErrorException', async () => {
      (prismaMock.forumPosts.findUniqueOrThrow as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });


  describe('update()', () => {
    it('Positive Case - Berhasil update dengan files baru (hapus attachments lama)', async () => {
      (prismaMock.forumPosts.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'fp-1',
        title: 'Old',
        content: 'OldC',
        authorRole: 'USER',
        userId: 'user-1',
        attachments: '["old1","old2"]',
      });

      processFilesMock.mockReturnValue(['new1', 'new2']);
      safeParseAttachmentsMock.mockReturnValue(['old1', 'old2']);
      (prismaMock.forumPosts.update as jest.Mock).mockResolvedValue({
        id: 'fp-1',
        ...updateDto,
        attachments: ['new1', 'new2'],
      });

      const res = await service.update('fp-1', updateDto as any, filesMock);

      expect(deleteFileSpy).toHaveBeenCalledTimes(2);
      expect(prismaMock.forumPosts.update).toHaveBeenCalledWith({
        where: { id: 'fp-1' },
        data: expect.objectContaining({
          title: updateDto.title,
          content: updateDto.content,
          authorRole: updateDto.authorRole,
          attachments: ['new1', 'new2'],
          user: { connect: { id: updateDto.userId } },
          tags: { connect: { id: updateDto.tagId } },
          updatedAt: expect.any(Date),
        }),
      });
      expect(res.id).toBe('fp-1');
    });

    it('Positive Case - Tanpa files baru → pertahankan attachments lama', async () => {
      (prismaMock.forumPosts.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'fp-1',
        title: 'Old',
        content: 'OldC',
        authorRole: 'USER',
        userId: 'user-1',
        attachments: '["old1","old2"]',
      });

      safeParseAttachmentsMock.mockReturnValue(['old1', 'old2']);
      (prismaMock.forumPosts.update as jest.Mock).mockResolvedValue({
        id: 'fp-1',
        title: 'Old',
        content: 'OldC',
        attachments: ['old1', 'old2'],
      });

      const res = await service.update('fp-1', {} as any, undefined);

      expect(deleteFileSpy).not.toHaveBeenCalled();
      expect(res.attachments).toEqual(['old1', 'old2']);
    });

    it('Negative Case - NotFoundError saat pre-check → NotFoundException', async () => {
      const err = new Error('not found');
      (err as any).name = 'NotFoundError';
      (prismaMock.forumPosts.findUniqueOrThrow as jest.Mock).mockRejectedValue(err);

      await expect(service.update('missing', updateDto as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('Negative Case - P2025 saat pre-check → NotFoundException', async () => {
      (prismaMock.forumPosts.findUniqueOrThrow as jest.Mock).mockRejectedValue(prismaP2025());

      await expect(service.update('missing', updateDto as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('Negative Case - Error umum saat update → InternalServerErrorException', async () => {
      (prismaMock.forumPosts.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'fp-1',
        attachments: '[]',
      });
      safeParseAttachmentsMock.mockReturnValue([]);
      (prismaMock.forumPosts.update as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.update('fp-1', updateDto as any)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });


  describe('remove()', () => {
    it('Positive Case - Berhasil menghapus & hapus file attachments lama', async () => {
      (prismaMock.forumPosts.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'fp-1',
        attachments: '["p1","p2"]',
      });
      safeParseAttachmentsMock.mockReturnValue(['p1', 'p2']);
      (prismaMock.forumPosts.delete as jest.Mock).mockResolvedValue({ id: 'fp-1' });

      const res = await service.remove('fp-1');

      expect(deleteFileSpy).toHaveBeenCalledTimes(2);
      expect(prismaMock.forumPosts.delete).toHaveBeenCalledWith({ where: { id: 'fp-1' } });
      expect(res).toEqual({ id: 'fp-1' });
    });

    it('Negative Case - NotFoundError saat pre-check → NotFoundException', async () => {
      const err = new Error('not found');
      (err as any).name = 'NotFoundError';
      (prismaMock.forumPosts.findUniqueOrThrow as jest.Mock).mockRejectedValue(err);

      await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('Negative Case - P2025 saat pre-check → NotFoundException', async () => {
      (prismaMock.forumPosts.findUniqueOrThrow as jest.Mock).mockRejectedValue(prismaP2025());

      await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('Negative Case - Error umum saat delete → InternalServerErrorException', async () => {
      (prismaMock.forumPosts.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'fp-1',
        attachments: '[]',
      });
      safeParseAttachmentsMock.mockReturnValue([]);
      (prismaMock.forumPosts.delete as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.remove('fp-1')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });
});

