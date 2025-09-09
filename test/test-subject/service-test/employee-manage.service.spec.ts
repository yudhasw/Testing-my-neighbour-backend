/* eslint-disable @typescript-eslint/no-explicit-any */
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { EmployeeManageService } from '../../../src/modules/user-manage-module/employee-module/employee-manage.service';
import { DatabaseService } from '../../../src/common/database/database.service';
import { GeneralHelper } from '../../../src/common/helper/generalHelper';
import { PrismaClientKnownRequestError } from '../../../src/common/database/generated/prisma/runtime/library';

describe('EmployeeManageService', () => {
  let service: EmployeeManageService;

  // ---- Prisma Mock ----
  const prismaMock = {
    users: {
      findUnique: jest.fn(),
    },
    employees: {
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

  // ---- Helper Prisma Error P2025 ----
  const prismaP2025 = () =>
    // @ts-ignore construct manually for tests
    new PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: 'test',
    });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EmployeeManageService(prismaMock, helperMock);
  });

  // ===== Dummy DTO =====
  const createDto = {
    userId: 'u-1',
    employeeNumberId: 'E-001',
    hireDate: new Date('2025-09-01'),
    salary: 5000000.123,
    workingHours: '09:00-17:00',
    employeePosition: 'Teknisi',
    bonus: 750000.456,
  };

  const updateDto = {
    employeeNumberId: 'E-002',
    hireDate: new Date('2025-09-02'),
    salary: 6000000.999,
    workingHours: '08:00-16:00',
    employeePosition: 'Supervisor',
    bonus: 1000000.001,
  };

  // =========================================================
  // create()
  // =========================================================
  describe('create()', () => {
    it('Positive Case - Berhasil create pegawai & memanggil twoDecimal untuk salary/bonus', async () => {
      (prismaMock.users.findUnique as jest.Mock).mockResolvedValue({ id: 'u-1' });
      (prismaMock.employees.create as jest.Mock).mockResolvedValue({
        id: 'emp-1',
        ...createDto,
        salary: 5000000.12,
        bonus: 750000.46,
      });

      const res = await service.create(createDto as any);

      expect(prismaMock.users.findUnique).toHaveBeenCalledWith({ where: { id: 'u-1' } });
      expect(helperMock.twoDecimal).toHaveBeenCalledWith(createDto.salary);
      expect(helperMock.twoDecimal).toHaveBeenCalledWith(createDto.bonus);
      expect(prismaMock.employees.create).toHaveBeenCalledWith({
        data: {
          user: { connect: { id: 'u-1' } },
          employeeNumberId: 'E-001',
          hireDate: createDto.hireDate,
          salary: expect.any(Number),
          workingHours: '09:00-17:00',
          employeePosition: 'Teknisi',
          bonus: expect.any(Number),
        },
      });
      expect(res.id).toBe('emp-1');
    });

    it('Negative Case - userId tidak ditemukan di users → (ter-catch) InternalServerErrorException', async () => {
      // Catatan: service melempar NotFoundException di dalam try, tetapi tertangkap catch dan diubah ke ISEE
      (prismaMock.users.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.create(createDto as any)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });

    it('Negative Case - Error umum saat create → InternalServerErrorException', async () => {
      (prismaMock.users.findUnique as jest.Mock).mockResolvedValue({ id: 'u-1' });
      (prismaMock.employees.create as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.create(createDto as any)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // findAll()
  // =========================================================
  describe('findAll()', () => {
    it('Positive Case - include _count & user; orderBy employeeNumberId asc', async () => {
      (prismaMock.employees.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'emp-1',
          employeeNumberId: 'E-001',
          _count: {
            Announcements: 1,
            Bills: 2,
            Payments: 3,
            Complaints: 4,
            SecurityReports: 5,
          },
          user: { fullName: 'Budi' },
        },
      ]);

      const res = await service.findAll();

      expect(prismaMock.employees.findMany).toHaveBeenCalledWith({
        include: {
          _count: {
            select: {
              Announcements: true,
              Bills: true,
              Payments: true,
              Complaints: true,
              SecurityReports: true,
            },
          },
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
        orderBy: { employeeNumberId: 'asc' },
      });
      expect(res).toHaveLength(1);
      expect(res[0]._count.Payments).toBe(3);
    });

    it('Negative Case - Error umum → InternalServerErrorException', async () => {
      (prismaMock.employees.findMany as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.findAll()).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  // =========================================================
  // findOne()
  // =========================================================
  describe('findOne()', () => {
    it('Positive Case - Dapatkan detail pegawai beserta relasi', async () => {
      (prismaMock.employees.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'emp-1',
        employeeNumberId: 'E-001',
        _count: { Announcements: 1 },
        user: { fullName: 'Budi' },
        Complaints: [{ title: 'Air Bocor', status: 'OPEN' }],
        Announcements: [{ title: 'Info', content: '...', attachments: [], publishDate: new Date(), expiryDate: new Date() }],
      });

      const res = await service.findOne('emp-1');

      expect(prismaMock.employees.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'emp-1' },
        include: {
          _count: {
            select: {
              Announcements: true,
              Bills: true,
              Payments: true,
              Complaints: true,
              SecurityReports: true,
            },
          },
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
          Complaints: {
            select: {
              title: true,
              description: true,
              status: true,
              submittedAt: true,
              resolvedAt: true,
              resolutionDetails: true,
            },
          },
          Announcements: {
            select: {
              title: true,
              content: true,
              attachments: true,
              publishDate: true,
              expiryDate: true,
            },
          },
        },
      });
      expect(res.id).toBe('emp-1');
      expect(res.Complaints[0].title).toBe('Air Bocor');
    });

    it('Negative Case - Error umum → InternalServerErrorException', async () => {
      (prismaMock.employees.findUniqueOrThrow as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // update()
  // =========================================================
  describe('update()', () => {
    it('Positive Case - Berhasil update & twoDecimal dipanggil untuk salary/bonus', async () => {
      (prismaMock.employees.findUnique as jest.Mock).mockResolvedValue({
        id: 'emp-1',
        employeeNumberId: 'E-001',
        hireDate: createDto.hireDate,
        salary: 5000000.12,
        workingHours: '09:00-17:00',
        employeePosition: 'Teknisi',
        bonus: 750000.46,
      });
      (prismaMock.employees.update as jest.Mock).mockResolvedValue({
        id: 'emp-1',
        ...updateDto,
        salary: 6000001.0,
        bonus: 1000000.0,
        updatedAt: new Date(),
      });

      const res = await service.update('emp-1', updateDto as any);

      expect(helperMock.twoDecimal).toHaveBeenCalledWith(updateDto.salary);
      expect(helperMock.twoDecimal).toHaveBeenCalledWith(updateDto.bonus);
      expect(prismaMock.employees.update).toHaveBeenCalledWith({
        where: { id: 'emp-1' },
        data: expect.objectContaining({
          employeeNumberId: 'E-002',
          hireDate: updateDto.hireDate,
          salary: expect.any(Number),
          workingHours: '08:00-16:00',
          employeePosition: 'Supervisor',
          bonus: expect.any(Number),
          updatedAt: expect.any(Date),
        }),
      });
      expect(res.id).toBe('emp-1');
    });

    it('Negative Case - Pre-check findUnique null → NotFoundException', async () => {
      (prismaMock.employees.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update('missing', updateDto as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('Negative Case - P2025 ter-handle di catch → NotFoundException', async () => {
      (prismaMock.employees.findUnique as jest.Mock).mockResolvedValue({ id: 'emp-1' });
      (prismaMock.employees.update as jest.Mock).mockRejectedValue(prismaP2025());

      await expect(service.update('emp-1', updateDto as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('Negative Case - Error umum saat update → InternalServerErrorException', async () => {
      (prismaMock.employees.findUnique as jest.Mock).mockResolvedValue({ id: 'emp-1' });
      (prismaMock.employees.update as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.update('emp-1', updateDto as any)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // remove()
  // =========================================================
  describe('remove()', () => {
    it('Positive Case - Berhasil menghapus pegawai', async () => {
      (prismaMock.employees.findUnique as jest.Mock).mockResolvedValue({ id: 'emp-1' });
      (prismaMock.employees.delete as jest.Mock).mockResolvedValue({ id: 'emp-1' });

      const res = await service.remove('emp-1');

      expect(prismaMock.employees.findUnique).toHaveBeenCalledWith({ where: { id: 'emp-1' } });
      expect(prismaMock.employees.delete).toHaveBeenCalledWith({ where: { id: 'emp-1' } });
      expect(res).toEqual({ id: 'emp-1' });
    });

    it('Negative Case - Pre-check findUnique null → NotFoundException', async () => {
      (prismaMock.employees.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('Negative Case - P2025 saat delete → NotFoundException', async () => {
      (prismaMock.employees.findUnique as jest.Mock).mockResolvedValue({ id: 'emp-1' });
      (prismaMock.employees.delete as jest.Mock).mockRejectedValue(prismaP2025());

      await expect(service.remove('emp-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('Negative Case - Error umum saat delete → InternalServerErrorException', async () => {
      (prismaMock.employees.findUnique as jest.Mock).mockResolvedValue({ id: 'emp-1' });
      (prismaMock.employees.delete as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.remove('emp-1')).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });
});
