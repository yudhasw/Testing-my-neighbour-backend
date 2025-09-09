/* eslint-disable @typescript-eslint/no-explicit-any */
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UnitManageService } from '../../../src/modules/unit-manage-module/unit-manage.service';
import { DatabaseService } from '../../../src/common/database/database.service';
import { PrismaClientKnownRequestError } from '../../../src/common/database/generated/prisma/runtime/library';
import { GeneralHelper } from '../../../src/common/helper/generalHelper';

describe('UnitManageService', () => {
  let service: UnitManageService;

  // ---- Prisma Mock ----
  const prismaMock = {
    units: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as unknown as DatabaseService;

  // ---- Helper Mock ----
  const helperMock = {
    twoDecimal: jest.fn((n: number) => Number(Number(n).toFixed(2))),
  } as unknown as GeneralHelper;

  // ---- Helper: Prisma P2025 ----
  const prismaP2025 = () =>
    // @ts-ignore construct for test
    new PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: 'test',
    });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UnitManageService(prismaMock, helperMock);
  });

  // ===== Dummy data =====
  const createDto = {
    unitNumber: 'A-101',
    buildingName: 'Tower A',
    location: 'Lantai 1',
    priceSale: 12345.6789,
    status: 'AVAILABLE',
    floorNumber: 1,
    numberOfRooms: 2,
    squareFootage: 45.5,
  };

  const updateDto = {
    unitNumber: 'A-102',
    buildingName: 'Tower A',
    location: 'Lantai 1',
    priceSale: 99999.999,
    status: 'SOLD',
    floorNumber: 2,
    numberOfRooms: 3,
    squareFootage: 50.0,
  };

  // =========================================================
  // create()
  // =========================================================
  describe('create()', () => {
    it('Positive Case - Berhasil membuat unit & memanggil helper.twoDecimal', async () => {
      (prismaMock.units.create as jest.Mock).mockResolvedValue({
        id: 'u-1',
        ...createDto,
        priceSale: 12345.68,
      });

      const res = await service.create(createDto as any);

      expect(helperMock.twoDecimal).toHaveBeenCalledWith(createDto.priceSale);
      expect(prismaMock.units.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          unitNumber: createDto.unitNumber,
          buildingName: createDto.buildingName,
          location: createDto.location,
          priceSale: expect.any(Number),
          status: createDto.status,
          floorNumber: createDto.floorNumber,
          numberOfRooms: createDto.numberOfRooms,
          squareFootage: createDto.squareFootage,
        }),
      });
      expect(res.id).toBe('u-1');
    });

    it('Negative Case - Error umum pada create → InternalServerErrorException', async () => {
      (prismaMock.units.create as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.create(createDto as any)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // findAll()
  // =========================================================
  describe('findAll()', () => {
    it('Positive Case - Data berhasil ditemukan (include _count; orderBy unitNumber asc)', async () => {
      (prismaMock.units.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'u-1',
          unitNumber: 'A-101',
          _count: { Complaints: 1, Residents: 2, Bills: 3, Payments: 4 },
        },
      ]);

      const res = await service.findAll();

      expect(prismaMock.units.findMany).toHaveBeenCalledWith({
        include: {
          _count: { select: { Complaints: true, Residents: true, Bills: true, Payments: true } },
        },
        orderBy: { unitNumber: 'asc' },
      });
      expect(res).toHaveLength(1);
      expect(res[0]._count.Residents).toBe(2);
    });

    it('Negative Case - Error umum pada findAll → InternalServerErrorException', async () => {
      (prismaMock.units.findMany as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.findAll()).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  // =========================================================
  // findOne()
  // =========================================================
  describe('findOne()', () => {
    it('Positive Case - Berhasil mendapatkan detail unit beserta relasi', async () => {
      (prismaMock.units.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'u-1',
        unitNumber: 'A-101',
        Bills: [{ amount: 100000 }],
        Complaints: [{ title: 'Air Bocor', category: 'UTILITIES' }],
        Residents: [
          {
            isKprPaid: false,
            user: {
              fullName: 'Budi',
              firstName: 'Budi',
              lastName: 'Santoso',
              contactNumber: '0812',
              dateOfBirth: '1990-01-01',
              gender: 'M',
              username: 'budi',
              primaryEmail: 'budi@example.com',
            },
          },
        ],
      });

      const res = await service.findOne('u-1');

      expect(prismaMock.units.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'u-1' },
        include: {
          Bills: { select: { amount: true } },
          Complaints: {
            select: {
              title: true,
              category: true,
              description: true,
              resolutionDetails: true,
              submittedAt: true,
              resolvedAt: true,
              status: true,
              images: true,
            },
            orderBy: { title: 'asc' },
          },
          Residents: {
            select: {
              isKprPaid: true,
              kprDueDate: true,
              kprPaymentAmount: true,
              residentStatus: true,
              movedInDate: true,
            },
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
        },
      });
      expect(res.id).toBe('u-1');
      expect(res.Bills[0].amount).toBe(100000);
    });

    it('Negative Case - Error umum pada findOne → InternalServerErrorException', async () => {
      (prismaMock.units.findUniqueOrThrow as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // update()
  // =========================================================
  describe('update()', () => {
    it('Positive Case - Berhasil update semua field & twoDecimal dipanggil untuk priceSale', async () => {
      (prismaMock.units.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'u-1',
        ...createDto,
        priceSale: 12345.68,
      });
      (prismaMock.units.update as jest.Mock).mockResolvedValue({
        id: 'u-1',
        ...updateDto,
        priceSale: 100000.0,
      });

      const res = await service.update('u-1', updateDto as any);

      expect(helperMock.twoDecimal).toHaveBeenCalledWith(updateDto.priceSale);
      expect(prismaMock.units.update).toHaveBeenCalledWith({
        where: { id: 'u-1' },
        data: expect.objectContaining({
          unitNumber: updateDto.unitNumber,
          buildingName: updateDto.buildingName,
          location: updateDto.location,
          priceSale: expect.any(Number),
          status: updateDto.status,
          floorNumber: updateDto.floorNumber,
          numberOfRooms: updateDto.numberOfRooms,
          squareFootage: updateDto.squareFootage,
          updatedAt: expect.any(Date),
        }),
      });
      expect(res.id).toBe('u-1');
      expect(res.status).toBe('SOLD');
    });

    it('Negative Case - P2025 pada pre-check → NotFoundException', async () => {
      (prismaMock.units.findUniqueOrThrow as jest.Mock).mockRejectedValue(prismaP2025());

      await expect(service.update('missing', updateDto as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('Negative Case - Error umum saat update → InternalServerErrorException', async () => {
      (prismaMock.units.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'u-1',
        ...createDto,
      });
      (prismaMock.units.update as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.update('u-1', updateDto as any)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // remove()
  // =========================================================
  describe('remove()', () => {
    it('Positive Case - Berhasil menghapus unit', async () => {
      (prismaMock.units.findUnique as jest.Mock).mockResolvedValue({ id: 'u-1' });
      (prismaMock.units.delete as jest.Mock).mockResolvedValue({ id: 'u-1' });

      const res = await service.remove('u-1');

      expect(prismaMock.units.findUnique).toHaveBeenCalledWith({ where: { id: 'u-1' } });
      expect(prismaMock.units.delete).toHaveBeenCalledWith({ where: { id: 'u-1' } });
      expect(res).toEqual({ id: 'u-1' });
    });

    it('Negative Case - NotFoundException saat pre-check (findUnique null)', async () => {
      (prismaMock.units.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('Negative Case - P2025 saat delete → NotFoundException', async () => {
      (prismaMock.units.findUnique as jest.Mock).mockResolvedValue({ id: 'u-1' });
      (prismaMock.units.delete as jest.Mock).mockRejectedValue(prismaP2025());

      await expect(service.remove('u-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('Negative Case - Error umum saat delete → InternalServerErrorException', async () => {
      (prismaMock.units.findUnique as jest.Mock).mockResolvedValue({ id: 'u-1' });
      (prismaMock.units.delete as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.remove('u-1')).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });
});
