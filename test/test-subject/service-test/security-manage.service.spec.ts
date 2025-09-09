/* eslint-disable @typescript-eslint/no-explicit-any */
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SecurityManageService } from '../../../src/modules/security-module/security-manage.service';
import { DatabaseService } from '../../../src/common/database/database.service';
import { PrismaClientKnownRequestError } from '../../../src/common/database/generated/prisma/runtime/library';

describe('SecurityManageService', () => {
  let service: SecurityManageService;

  // ---- Prisma Mock ----
  const prismaMock = {
    securityReports: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as unknown as DatabaseService;

  // Helper Prisma Error P2025
  const prismaP2025 = () =>
    // @ts-ignore
    new PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: 'test',
    });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SecurityManageService(prismaMock);
  });

  // Data Dummy
  const createDto = {
    title: 'Pencurian',
    description: 'Kehilangan motor di parkiran',
    incidentDate: new Date('2025-09-01'),
    location: 'Blok A',
    status: 'OPEN',
    employeeId: 'emp-1',
  };

  const updateDto = {
    title: 'Pencurian (Revisi)',
    description: 'Motor hilang + helm',
    incidentDate: new Date('2025-09-02'),
    location: 'Blok A',
    status: 'CLOSED',
    employeeId: 'emp-2',
  };

  // =========================================================
  // create()
  // =========================================================
  describe('create()', () => {
    it('Positive Case - Berhasil membuat laporan keamanan', async () => {
      (prismaMock.securityReports.create as jest.Mock).mockResolvedValue({
        id: 's-1',
        ...createDto,
      });

      const res = await service.create(createDto as any);

      expect(prismaMock.securityReports.create).toHaveBeenCalledWith({
        data: {
          title: createDto.title,
          description: createDto.description,
          incidentDate: createDto.incidentDate,
          location: createDto.location,
          status: createDto.status,
          employee: { connect: { id: createDto.employeeId } },
        },
      });
      expect(res.id).toBe('s-1');
    });

    it('Negative Case - Error umum pada create → InternalServerErrorException', async () => {
      (prismaMock.securityReports.create as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.create(createDto as any)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // findAll()
  // =========================================================
  describe('findAll()', () => {
    it('Positive Case - Data berhasil ditemukan (include employee.user)', async () => {
      (prismaMock.securityReports.findMany as jest.Mock).mockResolvedValue([
        {
          id: 's-1',
          title: 'A',
          employee: {
            user: {
              fullName: 'Budi Santoso',
              firstName: 'Budi',
              lastName: 'Santoso',
              contactNumber: '08123',
              username: 'budi',
            },
          },
        },
      ]);

      const res = await service.findAll();

      expect(prismaMock.securityReports.findMany).toHaveBeenCalledWith({
        include: {
          employee: {
            include: {
              user: {
                select: {
                  fullName: true,
                  firstName: true,
                  lastName: true,
                  contactNumber: true,
                  username: true,
                },
              },
            },
          },
        },
        orderBy: { title: 'asc' },
      });
      expect(res).toHaveLength(1);
    });

    it('Negative Case - Error umum pada findAll → InternalServerErrorException', async () => {
      (prismaMock.securityReports.findMany as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.findAll()).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  // =========================================================
  // findOne()
  // =========================================================
  describe('findOne()', () => {
    it('Positive Case - Berhasil mendapatkan detail laporan', async () => {
      (prismaMock.securityReports.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 's-1',
        title: 'A',
        employee: {
          user: {
            fullName: 'Budi Santoso',
            firstName: 'Budi',
            lastName: 'Santoso',
            contactNumber: '08123',
            username: 'budi',
          },
        },
      });

      const res = await service.findOne('s-1');

      expect(prismaMock.securityReports.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 's-1' },
        include: {
          employee: {
            include: {
              user: {
                select: {
                  fullName: true,
                  firstName: true,
                  lastName: true,
                  contactNumber: true,
                  username: true,
                },
              },
            },
          },
        },
      });
      expect(res.id).toBe('s-1');
    });

    it('Negative Case - Error umum pada findOne → InternalServerErrorException', async () => {
      (prismaMock.securityReports.findUniqueOrThrow as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.findOne('x')).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  // =========================================================
  // update()
  // =========================================================
  describe('update()', () => {
    it('Positive Case - Berhasil update laporan', async () => {
      (prismaMock.securityReports.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 's-1',
        ...createDto,
      });
      (prismaMock.securityReports.update as jest.Mock).mockResolvedValue({
        id: 's-1',
        ...updateDto,
      });

      const res = await service.update('s-1', updateDto as any);

      expect(prismaMock.securityReports.update).toHaveBeenCalledWith({
        where: { id: 's-1' },
        data: expect.objectContaining({
          title: updateDto.title,
          description: updateDto.description,
          incidentDate: updateDto.incidentDate,
          location: updateDto.location,
          status: updateDto.status,
          employee: { connect: { id: updateDto.employeeId } },
        }),
      });
      expect(res.title).toBe(updateDto.title);
    });

    it('Negative Case - NotFoundError → NotFoundException', async () => {
      const err = new Error('not found');
      (err as any).name = 'NotFoundError';
      (prismaMock.securityReports.findUniqueOrThrow as jest.Mock).mockRejectedValue(err);

      await expect(service.update('missing', updateDto as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('Negative Case - P2025 → NotFoundException', async () => {
      (prismaMock.securityReports.findUniqueOrThrow as jest.Mock).mockRejectedValue(prismaP2025());

      await expect(service.update('missing', updateDto as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('Negative Case - Error umum saat update → InternalServerErrorException', async () => {
      (prismaMock.securityReports.findUniqueOrThrow as jest.Mock).mockResolvedValue({ id: 's-1' });
      (prismaMock.securityReports.update as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.update('s-1', updateDto as any)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // remove()
  // =========================================================
  describe('remove()', () => {
    it('Positive Case - Berhasil hapus laporan', async () => {
      (prismaMock.securityReports.delete as jest.Mock).mockResolvedValue({ id: 's-1' });

      const res = await service.remove('s-1');

      expect(prismaMock.securityReports.delete).toHaveBeenCalledWith({ where: { id: 's-1' } });
      expect(res).toEqual({ id: 's-1' });
    });

    it('Negative Case - NotFoundError → NotFoundException', async () => {
      const err = new Error('not found');
      (err as any).name = 'NotFoundError';
      (prismaMock.securityReports.delete as jest.Mock).mockRejectedValue(err);

      await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('Negative Case - P2025 → NotFoundException', async () => {
      (prismaMock.securityReports.delete as jest.Mock).mockRejectedValue(prismaP2025());

      await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('Negative Case - Error umum saat delete → InternalServerErrorException', async () => {
      (prismaMock.securityReports.delete as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.remove('s-1')).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });
});
