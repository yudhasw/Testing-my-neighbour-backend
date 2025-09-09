/* eslint-disable @typescript-eslint/no-explicit-any */
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ComplaintManageService } from '../../../src/modules/request-module/compliant-module/complaint-manage.service';
import { DatabaseService } from '../../../src/common/database/database.service';
import { PrismaClientKnownRequestError } from '../../../src/common/database/generated/prisma/runtime/library';

describe('ComplaintManageService', () => {
  let service: ComplaintManageService;

  // ---- Prisma Mock ----
  const prismaMock = {
    complaints: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as unknown as DatabaseService;

  // Helper bikin error P2025
  const prismaP2025 = () =>
    // @ts-ignore: konstruksi manual utk test
    new PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: 'test',
    });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ComplaintManageService(prismaMock);
  });

  // ===== Dummy data =====
  const createDto = {
    title: 'Lampu padam',
    description: 'Mati listrik area blok A',
    category: 'UTILITIES',
    employeeId: 'emp-1',
    residentId: 'res-1',
    images: ['img1.jpg', 'img2.jpg'],
    resolutionDetails: null,
    resolvedAt: null,
    unitId: 'unit-1',
  };

  const updateDto = {
    title: 'Lampu padam (revisi)',
    description: 'Mati listrik area blok A & B',
    category: 'UTILITIES',
    employeeId: 'emp-2',
    residentId: 'res-1',
    images: ['img3.jpg'],
    resolutionDetails: 'Sedang ditangani',
    resolvedAt: new Date('2025-09-08T10:00:00Z'),
    unitId: 'unit-2',
  };

  // =========================================================
  // create()
  // =========================================================
  describe('create()', () => {
    it('Positive Case - Berhasil membuat keluhan', async () => {
      (prismaMock.complaints.create as jest.Mock).mockResolvedValue({
        id: 'c-1',
        ...createDto,
      });

      const res = await service.create(createDto as any);

      expect(prismaMock.complaints.create).toHaveBeenCalledWith({
        data: {
          title: createDto.title,
          description: createDto.description,
          category: createDto.category,
          employeeId: createDto.employeeId,
          residentId: createDto.residentId,
          images: createDto.images,
          resolutionDetails: createDto.resolutionDetails,
          resolvedAt: createDto.resolvedAt,
          unitId: createDto.unitId,
        },
      });
      expect(res.id).toBe('c-1');
    });

    it('Negative Case - Error umum pada create → InternalServerErrorException', async () => {
      (prismaMock.complaints.create as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.create(createDto as any)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // findAll()
  // =========================================================
  describe('findAll()', () => {
    it('Positive Case - Data berhasil ditemukan (orderBy submittedAt asc)', async () => {
      (prismaMock.complaints.findMany as jest.Mock).mockResolvedValue([
        { id: 'c-1', title: 'A', submittedAt: new Date('2025-01-01') },
        { id: 'c-2', title: 'B', submittedAt: new Date('2025-01-02') },
      ]);

      const res = await service.findAll();

      expect(prismaMock.complaints.findMany).toHaveBeenCalledWith({
        orderBy: { submittedAt: 'asc' },
      });
      expect(res).toHaveLength(2);
      expect(res[0].id).toBe('c-1');
    });

    it('Negative Case - Error umum pada findAll → InternalServerErrorException', async () => {
      (prismaMock.complaints.findMany as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.findAll()).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  // =========================================================
  // findOne()
  // =========================================================
  describe('findOne()', () => {
    it('Positive Case - Berhasil mendapatkan detail keluhan beserta relasi', async () => {
      (prismaMock.complaints.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'c-1',
        title: 'A',
        employee: {
          employeeNumberId: 'E001',
          employeePosition: 'Teknisi',
          user: { id: 'u-1', fullName: 'Budi', firstName: 'Budi', lastName: 'Santoso', username: 'budi' },
        },
        resident: {
          user: { id: 'u-2', fullName: 'Siti', firstName: 'Siti', lastName: 'Aminah', username: 'siti' },
          unit: { buildingName: 'A', location: 'L1', unitNumber: '101', status: 'OCCUPIED' },
        },
      });

      const res = await service.findOne('c-1');

      expect(prismaMock.complaints.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'c-1' },
        include: {
          employee: {
            select: { employeeNumberId: true, employeePosition: true },
            include: {
              user: {
                select: { id: true, fullName: true, firstName: true, lastName: true, username: true },
              },
            },
          },
          resident: {
            include: {
              user: {
                select: { id: true, fullName: true, firstName: true, lastName: true, username: true },
              },
              unit: {
                select: { buildingName: true, location: true, unitNumber: true, status: true },
              },
            },
          },
        },
      });
      expect(res.id).toBe('c-1');
      expect(res.employee?.user?.username).toBe('budi');
      expect(res.resident?.unit?.unitNumber).toBe('101');
    });

    it('Negative Case - Error umum pada findOne → InternalServerErrorException', async () => {
      (prismaMock.complaints.findUniqueOrThrow as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // update()
  // =========================================================
  describe('update()', () => {
    it('Positive Case - Berhasil update data keluhan', async () => {
      (prismaMock.complaints.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'c-1',
        title: 'Old',
        description: 'Old',
        category: 'UTILITIES',
        employeeId: 'emp-1',
        residentId: 'res-1',
        images: [],
        resolutionDetails: null,
        resolvedAt: null,
        unitId: 'unit-1',
      });

      const updated = {
        id: 'c-1',
        ...updateDto,
        updatedAt: new Date(),
      };
      (prismaMock.complaints.update as jest.Mock).mockResolvedValue(updated);

      const res = await service.update('c-1', updateDto as any);

      expect(prismaMock.complaints.update).toHaveBeenCalledWith({
        where: { id: 'c-1' },
        data: expect.objectContaining({
          title: updateDto.title,
          description: updateDto.description,
          category: updateDto.category,
          employeeId: updateDto.employeeId,
          residentId: updateDto.residentId,
          images: updateDto.images ?? [],
          resolutionDetails: updateDto.resolutionDetails,
          resolvedAt: updateDto.resolvedAt,
          unitId: updateDto.unitId,
          updatedAt: expect.any(Date),
        }),
      });
      expect(res.id).toBe('c-1');
      expect(res.title).toBe(updateDto.title);
    });

    it('Negative Case - NotFoundError pada pre-check → NotFoundException', async () => {
      const err = new Error('not found');
      (err as any).name = 'NotFoundError';
      (prismaMock.complaints.findUniqueOrThrow as jest.Mock).mockRejectedValue(err);

      await expect(service.update('missing', updateDto as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('Negative Case - P2025 pada pre-check → NotFoundException', async () => {
      (prismaMock.complaints.findUniqueOrThrow as jest.Mock).mockRejectedValue(prismaP2025());

      await expect(service.update('missing', updateDto as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('Negative Case - Error umum saat update → InternalServerErrorException', async () => {
      (prismaMock.complaints.findUniqueOrThrow as jest.Mock).mockResolvedValue({ id: 'c-1' });
      (prismaMock.complaints.update as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.update('c-1', updateDto as any)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // remove()
  // =========================================================
  describe('remove()', () => {
    it('Positive Case - Berhasil menghapus data keluhan', async () => {
      (prismaMock.complaints.findUniqueOrThrow as jest.Mock).mockResolvedValue({ id: 'c-1' });
      (prismaMock.complaints.delete as jest.Mock).mockResolvedValue({ id: 'c-1' });

      const res = await service.remove('c-1');

      expect(prismaMock.complaints.delete).toHaveBeenCalledWith({ where: { id: 'c-1' } });
      expect(res).toEqual({ id: 'c-1' });
    });

    it('Negative Case - NotFoundError pada pre-check → NotFoundException', async () => {
      const err = new Error('not found');
      (err as any).name = 'NotFoundError';
      (prismaMock.complaints.findUniqueOrThrow as jest.Mock).mockRejectedValue(err);

      await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('Negative Case - P2025 pada pre-check → NotFoundException', async () => {
      (prismaMock.complaints.findUniqueOrThrow as jest.Mock).mockRejectedValue(prismaP2025());

      await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('Negative Case - Error umum saat delete → InternalServerErrorException', async () => {
      (prismaMock.complaints.findUniqueOrThrow as jest.Mock).mockResolvedValue({ id: 'c-1' });
      (prismaMock.complaints.delete as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.remove('c-1')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });
});
