/* eslint-disable @typescript-eslint/no-explicit-any */
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { FamilyCodeManageService } from '../../../src/modules/user-manage-module/resident-module/familyCode-module/family-code-manage.service';
import { DatabaseService } from '../../../src/common/database/database.service';
import { PrismaClientKnownRequestError } from '../../../src/common/database/generated/prisma/runtime/library';

describe('FamilyCodeManageService', () => {
  let service: FamilyCodeManageService;

  // ---- Prisma Mock ----
  const prismaMock = {
    familyCodes: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as unknown as DatabaseService;

  // ---- Helper prisma error: P2025 ----
  const prismaP2025 = () =>
    // @ts-ignore construct for tests
    new PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: 'test',
    });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FamilyCodeManageService(prismaMock);
  });

  // ===== Dummy data =====
  const createDto = {
    code: 'FC-ABC123',
    headOfHousehold: 'res-1',
    unitId: 'unit-1',
    isActive: true,
    maxMembers: 5,
  };

  const updateDto = {
    code: 'FC-XYZ999',
    headOfHousehold: 'res-2',
    unitId: 'unit-2',
    isActive: false,
    maxMembers: 8,
  };

  // =========================================================
  // create()
  // =========================================================
  describe('create()', () => {
    it('Positive Case - Berhasil membuat kode keluarga', async () => {
      (prismaMock.familyCodes.create as jest.Mock).mockResolvedValue({
        id: 'fc-1',
        ...createDto,
      });

      const res = await service.create(createDto as any);

      expect(prismaMock.familyCodes.create).toHaveBeenCalledWith({
        data: {
          code: createDto.code,
          headResident: { connect: { id: createDto.headOfHousehold ?? undefined } },
          unit: { connect: { id: createDto.unitId ?? undefined } },
          isActive: createDto.isActive ?? true,
          maxMembers: createDto.maxMembers ?? 10,
        },
      });
      expect(res.id).toBe('fc-1');
    });

    it('Negative Case - Error umum → InternalServerErrorException', async () => {
      (prismaMock.familyCodes.create as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.create(createDto as any)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // findAll()
  // =========================================================
  describe('findAll()', () => {
    it('Positive Case - Data berhasil ditemukan (orderBy createdAt asc, code asc)', async () => {
      (prismaMock.familyCodes.findMany as jest.Mock).mockResolvedValue([
        { id: 'fc-1', code: 'A' },
      ]);

      const res = await service.findAll();

      expect(prismaMock.familyCodes.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'asc',
          code: 'asc',
        },
      });
      expect(res).toHaveLength(1);
    });

    it('Negative Case - Error umum → InternalServerErrorException', async () => {
      (prismaMock.familyCodes.findMany as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.findAll()).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  // =========================================================
  // findOne()
  // =========================================================
  describe('findOne()', () => {
    it('Positive Case - Berhasil mendapatkan detail kode keluarga beserta relasi', async () => {
      (prismaMock.familyCodes.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'fc-1',
        code: 'FC-ABC123',
        headResident: { user: { fullName: 'Budi' } },
        unit: { id: 'unit-1' },
      });

      const res = await service.findOne('fc-1');

      expect(prismaMock.familyCodes.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'fc-1' },
        include: {
          headResident: {
            include: {
              user: {
                select: {
                  fullName: true,
                  firstName: true,
                  lastName: true,
                  contactNumber: true,
                  dateOfBirth: true,
                  gender: true,
                  username: true,
                  primaryEmail: true,
                },
              },
            },
          },
          unit: true,
        },
      });
      expect(res.id).toBe('fc-1');
    });

    it('Negative Case - P2025 → NotFoundException', async () => {
      (prismaMock.familyCodes.findUniqueOrThrow as jest.Mock).mockRejectedValue(prismaP2025());

      await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('Negative Case - Error umum → InternalServerErrorException', async () => {
      (prismaMock.familyCodes.findUniqueOrThrow as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // update()
  // =========================================================
  describe('update()', () => {
    it('Positive Case - Berhasil update semua field (code, headResident, unit, isActive, maxMembers)', async () => {
      (prismaMock.familyCodes.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'fc-1',
        ...createDto,
      });
      (prismaMock.familyCodes.update as jest.Mock).mockResolvedValue({
        id: 'fc-1',
        ...updateDto,
      });

      const res = await service.update('fc-1', updateDto as any);

      expect(prismaMock.familyCodes.update).toHaveBeenCalledWith({
        where: { id: 'fc-1' },
        data: {
          code: updateDto.code ?? createDto.code,
          headResident: {
            connect: updateDto.headOfHousehold ? { id: updateDto.headOfHousehold } : undefined,
          },
          unit: updateDto.unitId ? { connect: { id: updateDto.unitId } } : undefined,
          isActive: updateDto.isActive,
          maxMembers: updateDto.maxMembers,
        },
      });
      expect(res.id).toBe('fc-1');
      expect(res.code).toBe('FC-XYZ999');
    });

    it('Negative Case - P2025 → NotFoundException', async () => {
      (prismaMock.familyCodes.findUniqueOrThrow as jest.Mock).mockResolvedValue({ id: 'fc-1' });
      (prismaMock.familyCodes.update as jest.Mock).mockRejectedValue(prismaP2025());

      await expect(service.update('fc-1', updateDto as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('Negative Case - Error umum saat update → InternalServerErrorException', async () => {
      (prismaMock.familyCodes.findUniqueOrThrow as jest.Mock).mockResolvedValue({ id: 'fc-1' });
      (prismaMock.familyCodes.update as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.update('fc-1', updateDto as any)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // remove()
  // =========================================================
  describe('remove()', () => {
    it('Positive Case - Berhasil hapus kode keluarga', async () => {
      (prismaMock.familyCodes.findUniqueOrThrow as jest.Mock).mockResolvedValue({ id: 'fc-1' });
      (prismaMock.familyCodes.delete as jest.Mock).mockResolvedValue({ id: 'fc-1' });

      const res = await service.remove('fc-1');

      expect(prismaMock.familyCodes.delete).toHaveBeenCalledWith({ where: { id: 'fc-1' } });
      expect(res).toEqual({ id: 'fc-1' });
    });

    it('Negative Case - P2025 → NotFoundException', async () => {
      (prismaMock.familyCodes.findUniqueOrThrow as jest.Mock).mockRejectedValue(prismaP2025());

      await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('Negative Case - Error umum saat delete → InternalServerErrorException', async () => {
      (prismaMock.familyCodes.findUniqueOrThrow as jest.Mock).mockResolvedValue({ id: 'fc-1' });
      (prismaMock.familyCodes.delete as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.remove('fc-1')).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });
});
