/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ResidentManageService } from '../../../src/modules/user-manage-module/resident-module/resident-manage.service';
import { DatabaseService } from '../../../src/common/database/database.service';
import { PrismaClientKnownRequestError } from '../../../src/common/database/generated/prisma/runtime/library';

describe('ResidentManageService', () => {
  let service: ResidentManageService;

  // ---- Prisma Mock ----
  const prismaMock = {
    users: {
      findUnique: jest.fn(),
    },
    residents: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as unknown as DatabaseService;

  // ---- Helper Prisma errors ----
  const prismaP2025 = () =>
    // @ts-ignore manual construct for tests
    new PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: 'test',
    });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ResidentManageService(prismaMock);
  });

  // ===== Dummy DTOs =====
  const createDto = {
    userId: 'u-1',
    emergencyContactName: 'Ibu Ani',
    emergencyContactNumber: '0812xxxx',
    movedInDate: new Date('2025-01-02'),
    movedOutDate: null,
    residentStatus: 'ACTIVE',
    unitId: 'unit-1',
  };

  const updateDto = {
    emergencyContactName: 'Ibu Beni',
    emergencyContactNumber: '0813yyyy',
    movedInDate: new Date('2025-02-01'),
    movedOutDate: null,
    residentStatus: 'INACTIVE',
    unitId: 'unit-2',
  };

  // =========================================================
  // create()
  // =========================================================
  describe('create()', () => {
    it('Positive Case - Berhasil create (user exist, unitId di-connect)', async () => {
      (prismaMock.users.findUnique as jest.Mock).mockResolvedValue({ id: 'u-1' });
      (prismaMock.residents.create as jest.Mock).mockResolvedValue({
        id: 'r-1',
        ...createDto,
      });

      const res = await service.create(createDto as any);

      expect(prismaMock.users.findUnique).toHaveBeenCalledWith({ where: { id: 'u-1' } });
      expect(prismaMock.residents.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user: { connect: { id: 'u-1' } },
          emergencyContactName: 'Ibu Ani',
          emergencyContactNumber: '0812xxxx',
          movedInDate: createDto.movedInDate,
          movedOutDate: createDto.movedOutDate,
          residentStatus: 'ACTIVE',
          unit: { connect: { id: 'unit-1' } },
        }),
      });
      expect(res.id).toBe('r-1');
    });

    it('Negative Case - userId tidak ditemukan (NotFoundException di try) tetapi di-catch → InternalServerErrorException', async () => {
      (prismaMock.users.findUnique as jest.Mock).mockResolvedValue(null); // trigger NotFoundException di try

      await expect(service.create(createDto as any)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });

    it('Negative Case - Error umum saat residents.create → InternalServerErrorException', async () => {
      (prismaMock.users.findUnique as jest.Mock).mockResolvedValue({ id: 'u-1' });
      (prismaMock.residents.create as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.create(createDto as any)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // findAll()
  // =========================================================
  describe('findAll()', () => {
    it('Positive Case - Data berhasil ditemukan (include _count & user; orderBy user.fullName asc)', async () => {
      (prismaMock.residents.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'r-1',
          user: { fullName: 'Andi' },
          _count: { Complaints: 1, Payments: 2 },
        },
      ]);

      const res = await service.findAll();

      expect(prismaMock.residents.findMany).toHaveBeenCalledWith({
        include: {
          _count: { select: { Complaints: true, Payments: true } },
          user: {
            select: {
              fullName: true,
              firstName: true,
              lastName: true,
              contactNumber: true,
              dateOfBirth: true,
              gender: true,
              primaryEmail: true,
            },
          },
        },
        orderBy: { user: { fullName: 'asc' } },
      });
      expect(res).toHaveLength(1);
    });

    it('Negative Case - Error umum → InternalServerErrorException', async () => {
      (prismaMock.residents.findMany as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.findAll()).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  // =========================================================
  // findOne()
  // =========================================================
  describe('findOne()', () => {
    it('Positive Case - Berhasil mendapatkan detail resident (include user, _count, Payments orderBy asc)', async () => {
      (prismaMock.residents.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'r-1',
        user: { fullName: 'Budi' },
        _count: { Complaints: 0, Payments: 2 },
        Payments: [
          { amount: 1000, paymentMethod: 'CASH', paymentDate: new Date('2025-01-03'), status: 'PAID' },
        ],
      });

      const res = await service.findOne('r-1');

      expect(prismaMock.residents.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'r-1' },
        include: {
          _count: { select: { Complaints: true, Payments: true } },
          user: {
            select: {
              fullName: true,
              firstName: true,
              lastName: true,
              contactNumber: true,
              dateOfBirth: true,
              gender: true,
              primaryEmail: true,
            },
          },
          Payments: {
            select: {
              amount: true,
              paymentMethod: true,
              paymentDate: true,
              status: true,
            },
            orderBy: { paymentDate: 'asc' },
          },
        },
      });
      expect(res.id).toBe('r-1');
    });

    it('Negative Case - Error umum → InternalServerErrorException', async () => {
      (prismaMock.residents.findUniqueOrThrow as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // update()
  // =========================================================
  describe('update()', () => {
    it('Positive Case - Berhasil update semua field', async () => {
      const exist = {
        id: 'r-1',
        emergencyContactName: 'Ibu Ani',
        emergencyContactNumber: '0812xxxx',
        movedInDate: new Date('2025-01-02'),
        movedOutDate: null,
        residentStatus: 'ACTIVE',
        unitId: 'unit-1',
      };
      (prismaMock.residents.findUnique as jest.Mock).mockResolvedValue(exist);
      (prismaMock.residents.update as jest.Mock).mockResolvedValue({
        id: 'r-1',
        ...updateDto,
        updatedAt: new Date(),
      });

      const res = await service.update('r-1', updateDto as any);

      expect(prismaMock.residents.update).toHaveBeenCalledWith({
        where: { id: 'r-1' },
        data: expect.objectContaining({
          emergencyContactName: updateDto.emergencyContactName,
          emergencyContactNumber: updateDto.emergencyContactNumber,
          movedInDate: updateDto.movedInDate,
          movedOutDate: updateDto.movedOutDate,
          residentStatus: updateDto.residentStatus,
          unitId: updateDto.unitId,
          updatedAt: expect.any(Date),
        }),
      });
      expect(res.id).toBe('r-1');
    });

    it('Negative Case - Pre-check findUnique null → NotFoundException', async () => {
      (prismaMock.residents.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update('missing', updateDto as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('Negative Case - P2025 saat update → NotFoundException', async () => {
      (prismaMock.residents.findUnique as jest.Mock).mockResolvedValue({ id: 'r-1' });
      (prismaMock.residents.update as jest.Mock).mockRejectedValue(prismaP2025());

      await expect(service.update('r-1', updateDto as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('Negative Case - Error umum saat update → InternalServerErrorException', async () => {
      (prismaMock.residents.findUnique as jest.Mock).mockResolvedValue({ id: 'r-1' });
      (prismaMock.residents.update as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.update('r-1', updateDto as any)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // remove()
  // =========================================================
  describe('remove()', () => {
    it('Positive Case - Berhasil hapus resident', async () => {
      (prismaMock.residents.findUnique as jest.Mock).mockResolvedValue({ id: 'r-1' });
      (prismaMock.residents.delete as jest.Mock).mockResolvedValue({ id: 'r-1' });

      const res = await service.remove('r-1');

      expect(prismaMock.residents.findUnique).toHaveBeenCalledWith({ where: { id: 'r-1' } });
      expect(prismaMock.residents.delete).toHaveBeenCalledWith({ where: { id: 'r-1' } });
      expect(res).toEqual({ id: 'r-1' });
    });

    it('Negative Case - findUnique reject dengan NotFoundError (nama error) → NotFoundException', async () => {
      const err = new Error('not found');
      (err as any).name = 'NotFoundError';
      (prismaMock.residents.findUnique as jest.Mock).mockRejectedValue(err);

      await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('Negative Case - Error umum saat delete → InternalServerErrorException', async () => {
      (prismaMock.residents.findUnique as jest.Mock).mockResolvedValue({ id: 'r-1' });
      (prismaMock.residents.delete as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.remove('r-1')).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });
});
