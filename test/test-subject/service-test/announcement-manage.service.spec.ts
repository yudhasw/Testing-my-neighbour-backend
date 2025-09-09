/* eslint-disable @typescript-eslint/no-explicit-any */
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AnnouncementManageService } from '../../../src/modules/communication-module/announcement-module/announcement-manage.service';
import { DatabaseService } from '../../../src/common/database/database.service';
import { PrismaClientKnownRequestError } from '../../../src/common/database/generated/prisma/runtime/library';
import { GeneralHelper } from '../../../src/common/helper/generalHelper';

describe('AnnouncementManageService', () => {
  let service: AnnouncementManageService;

  // Prisma mock
  const prismaMock = {
    announcements: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as unknown as DatabaseService;

  // UploadsService overrides
  const processFilesMock = jest.fn();
  const safeParseAttachmentsMock = jest.fn();

  // GeneralHelper spies
  const deleteFileSpy = jest.spyOn(GeneralHelper, 'deleteFile').mockImplementation(jest.fn());
  const fileExistsSpy = jest.spyOn(GeneralHelper, 'fileExists').mockImplementation(() => true);
  const getFileSizeSpy = jest.spyOn(GeneralHelper, 'getFileSize').mockImplementation(() => 1234);

  // Helper Prisma P2025
  const prismaP2025 = () =>
    // @ts-ignore constructing directly for tests
    new PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: 'test',
    });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AnnouncementManageService(prismaMock);
    // @ts-expect-error override for tests
    service.processFiles = processFilesMock;
    // @ts-expect-error override for tests
    service.safeParseAttachments = safeParseAttachmentsMock;
  });

  // Data Dummy
  const createDto = {
    title: 'Info Listrik',
    content: 'Pemadaman sementara',
    employeeId: 'emp-1',
    expiryDate: new Date('2025-09-10'),
    publishDate: new Date('2025-09-05'),
  };

  const updateDto = {
    title: 'Info Listrik (Revisi)',
    content: 'Pemadaman bergeser',
    employeeId: 'emp-2',
    expiryDate: new Date('2025-09-11'),
    publishDate: new Date('2025-09-06'),
  };

  const filesMock = [
    { path: 'uploads/a.pdf', originalname: 'a.pdf' } as any,
    { path: 'uploads/b.jpg', originalname: 'b.jpg' } as any,
  ];

  // =========================================================
  // create()
  // =========================================================
  describe('create()', () => {
    it('Positive Case - Berhasil membuat pengumuman dengan lampiran', async () => {
      processFilesMock.mockReturnValue(['uploads/a.pdf', 'uploads/b.jpg']);
      (prismaMock.announcements.create as jest.Mock).mockResolvedValue({
        id: 'ann-1',
        ...createDto,
        attachments: ['uploads/a.pdf', 'uploads/b.jpg'],
      });

      const res = await service.create(createDto as any, filesMock);

      expect(processFilesMock).toHaveBeenCalledWith(filesMock);
      expect(prismaMock.announcements.create).toHaveBeenCalledWith({
        data: {
          title: createDto.title,
          content: createDto.content,
          attachments: ['uploads/a.pdf', 'uploads/b.jpg'],
          employee: { connect: { id: createDto.employeeId } },
          expiryDate: createDto.expiryDate,
          publishDate: createDto.publishDate,
        },
      });
      expect(res.id).toBe('ann-1');
    });

    it('Negative Case - Error umum pada create → InternalServerErrorException', async () => {
      processFilesMock.mockReturnValue([]);
      (prismaMock.announcements.create as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.create(createDto as any)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // findAll()
  // =========================================================
  describe('findAll()', () => {
    it('Positive Case - Data berhasil ditemukan & attachments diparse', async () => {
      (prismaMock.announcements.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'ann-1',
          title: 'A',
          content: 'X',
          attachments: '["p1","p2"]',
          employee: { user: { fullName: 'U', firstName: 'F', lastName: 'L' } },
        },
        {
          id: 'ann-2',
          title: 'B',
          content: 'Y',
          attachments: null,
          employee: { user: { fullName: 'U2', firstName: 'F2', lastName: 'L2' } },
        },
      ]);

      safeParseAttachmentsMock
        .mockReturnValueOnce(['p1', 'p2'])
        .mockReturnValueOnce([]);

      const res = await service.findAll();

      expect(prismaMock.announcements.findMany).toHaveBeenCalledWith({
        orderBy: { title: 'asc' },
        include: {
          employee: {
            include: {
              user: {
                select: { fullName: true, firstName: true, lastName: true },
              },
            },
          },
        },
      });
      expect(res[0].attachments).toEqual(['p1', 'p2']);
      expect(res[1].attachments).toEqual([]);
    });

    it('Negative Case - Error umum pada findAll → InternalServerErrorException', async () => {
      (prismaMock.announcements.findMany as jest.Mock).mockRejectedValue(new Error('db err'));
      await expect(service.findAll()).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  // =========================================================
  // findOne()
  // =========================================================
  describe('findOne()', () => {
    it('Positive Case - Data berhasil ditemukan & attachments diparse', async () => {
      (prismaMock.announcements.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'ann-1',
        title: 'A',
        content: 'X',
        attachments: '["p1"]',
        employee: { user: { fullName: 'U', firstName: 'F', lastName: 'L' } },
      });
      safeParseAttachmentsMock.mockReturnValue(['p1']);

      const res = await service.findOne('ann-1');

      expect(prismaMock.announcements.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'ann-1' },
        include: {
          employee: {
            include: {
              user: {
                select: { fullName: true, firstName: true, lastName: true },
              },
            },
          },
        },
      });
      expect(res.attachments).toEqual(['p1']);
    });

    it('Negative Case - P2025 pada findOne → NotFoundException', async () => {
      (prismaMock.announcements.findUniqueOrThrow as jest.Mock).mockRejectedValue(prismaP2025());
      await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('Negative Case - Error umum pada findOne → InternalServerErrorException', async () => {
      (prismaMock.announcements.findUniqueOrThrow as jest.Mock).mockRejectedValue(
        new Error('db err'),
      );
      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // update()
  // =========================================================
  describe('update()', () => {
    it('Positive Case - Berhasil update dengan files baru (hapus attachments lama)', async () => {
      (prismaMock.announcements.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'ann-1',
        title: 'Old',
        content: 'OldC',
        attachments: '["old1","old2"]',
        expiryDate: new Date('2025-09-01'),
        publishDate: new Date('2025-09-02'),
      });
      processFilesMock.mockReturnValue(['new1', 'new2']);
      safeParseAttachmentsMock.mockReturnValue(['old1', 'old2']);
      (prismaMock.announcements.update as jest.Mock).mockResolvedValue({
        id: 'ann-1',
        ...updateDto,
        attachments: ['new1', 'new2'],
      });

      const res = await service.update('ann-1', updateDto as any, filesMock);

      expect(deleteFileSpy).toHaveBeenCalledTimes(2);
      expect(deleteFileSpy).toHaveBeenNthCalledWith(1, 'old1');
      expect(deleteFileSpy).toHaveBeenNthCalledWith(2, 'old2');
      expect(prismaMock.announcements.update).toHaveBeenCalledWith({
        where: { id: 'ann-1' },
        data: expect.objectContaining({
          title: updateDto.title,
          content: updateDto.content,
          attachments: ['new1', 'new2'],
          employee: { connect: { id: updateDto.employeeId } },
          expiryDate: updateDto.expiryDate,
          publishDate: updateDto.publishDate,
          updatedAt: expect.any(Date),
        }),
      });
      expect(res.attachments).toEqual(['new1', 'new2']);
    });

    it('Positive Case - Tanpa files baru → pertahankan attachments lama', async () => {
      (prismaMock.announcements.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'ann-1',
        title: 'Old',
        content: 'OldC',
        attachments: '["old1","old2"]',
        expiryDate: new Date('2025-09-01'),
        publishDate: new Date('2025-09-02'),
      });
      safeParseAttachmentsMock.mockReturnValue(['old1', 'old2']);
      (prismaMock.announcements.update as jest.Mock).mockResolvedValue({
        id: 'ann-1',
        title: 'Old',
        content: 'OldC',
        attachments: ['old1', 'old2'],
      });

      const res = await service.update('ann-1', {} as any, undefined);

      expect(deleteFileSpy).not.toHaveBeenCalled();
      expect(res.attachments).toEqual(['old1', 'old2']);
    });

    it('Negative Case - P2025 pada pre-check → NotFoundException', async () => {
      (prismaMock.announcements.findUniqueOrThrow as jest.Mock).mockRejectedValue(prismaP2025());
      await expect(service.update('missing', updateDto as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('Negative Case - Error umum saat update → InternalServerErrorException', async () => {
      (prismaMock.announcements.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'ann-1',
        attachments: '[]',
        expiryDate: new Date('2025-09-01'),
        publishDate: new Date('2025-09-02'),
      });
      safeParseAttachmentsMock.mockReturnValue([]);
      (prismaMock.announcements.update as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.update('ann-1', updateDto as any)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // remove()
  // =========================================================
  describe('remove()', () => {
    it('Positive Case - Berhasil menghapus & hapus file attachments', async () => {
      (prismaMock.announcements.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'ann-1',
        attachments: '["p1","p2"]',
      });
      safeParseAttachmentsMock.mockReturnValue(['p1', 'p2']);
      (prismaMock.announcements.delete as jest.Mock).mockResolvedValue({ id: 'ann-1' });

      const res = await service.remove('ann-1');

      expect(deleteFileSpy).toHaveBeenCalledTimes(2);
      expect(prismaMock.announcements.delete).toHaveBeenCalledWith({ where: { id: 'ann-1' } });
      expect(res).toEqual({ id: 'ann-1' });
    });

    it('Negative Case - P2025 pada pre-check → NotFoundException', async () => {
      (prismaMock.announcements.findUniqueOrThrow as jest.Mock).mockRejectedValue(prismaP2025());
      await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('Negative Case - Error umum saat delete → InternalServerErrorException', async () => {
      (prismaMock.announcements.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'ann-1',
        attachments: '[]',
      });
      safeParseAttachmentsMock.mockReturnValue([]);
      (prismaMock.announcements.delete as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.remove('ann-1')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // getAnnouncementFiles()
  // =========================================================
  describe('getAnnouncementFiles()', () => {
    it('Positive Case - Berhasil mengembalikan info file (exists & size)', async () => {
      (prismaMock.announcements.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        attachments: '["f1","f2"]',
      });
      safeParseAttachmentsMock.mockReturnValue(['f1', 'f2']);

      const res = await service.getAnnouncementFiles('ann-1');

      expect(prismaMock.announcements.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'ann-1' },
        select: { attachments: true },
      });
      expect(fileExistsSpy).toHaveBeenCalledTimes(2);
      expect(getFileSizeSpy).toHaveBeenCalledTimes(2);
      expect(res).toEqual([
        { path: 'f1', exists: true, size: 1234 },
        { path: 'f2', exists: true, size: 1234 },
      ]);
    });

    it('Negative Case - Error umum pada getAnnouncementFiles → InternalServerErrorException', async () => {
      (prismaMock.announcements.findUniqueOrThrow as jest.Mock).mockRejectedValue(new Error('db'));

      await expect(service.getAnnouncementFiles('ann-1')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });
});
