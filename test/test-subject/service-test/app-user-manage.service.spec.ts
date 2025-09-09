/* eslint-disable @typescript-eslint/no-explicit-any */
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AppUserManageService } from '../../../src/modules/user-manage-module/app-users-module/app-user-manage.service';
import { DatabaseService } from '../../../src/common/database/database.service';
import { PrismaClientKnownRequestError } from '../../../src/common/database/generated/prisma/runtime/library';
import * as bcrypt from 'bcrypt';

// ---- Mock bcrypt ----
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AppUserManageService', () => {
  let service: AppUserManageService;

  // ---- Prisma Mock ----
  const prismaMock = {
    users: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as unknown as DatabaseService;

  // Helper P2025
  const prismaP2025 = () =>
    // @ts-ignore construct manually for tests
    new PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: 'test',
    });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AppUserManageService(prismaMock);
  });

  // ===== Dummy =====
  const createDto = {
    fullName: 'Budi Santoso',
    firstName: 'Budi',
    lastName: 'Santoso',
    username: 'budi',
    primaryEmail: 'budi@example.com',
    password: 'Secret#123',
    role: 'USER',
    gender: 'M',
  };

  const updateDto = {
    fullName: 'Budi S.',
    firstName: 'Budi',
    lastName: 'S',
    username: 'budi',
    primaryEmail: 'budi@example.com',
    role: 'ADMIN',
    gender: 'M',
    secondaryEmail: 'budi2@example.com',
    contactNumber: '0812345',
    dateOfBirth: new Date('1990-01-01'),
  };

  // =========================================================
  // create()
  // =========================================================
  describe('create()', () => {
    it('Positive Case - Hash password & create user (omit password di response)', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed!');
      (prismaMock.users.create as jest.Mock).mockResolvedValue({
        id: 'u-1',
        // service memanggil prisma dengan omit password, jadi response tidak punya password
        ...createDto,
        password: undefined,
      });

      const res = await service.create(createDto as any);

      expect(bcrypt.hash).toHaveBeenCalledWith(createDto.password, 15);
      expect(prismaMock.users.create).toHaveBeenCalledWith({
        data: {
          fullName: createDto.fullName,
          firstName: createDto.firstName,
          lastName: createDto.lastName,
          username: createDto.username,
          primaryEmail: createDto.primaryEmail,
          password: 'hashed!',
          role: createDto.role,
          gender: createDto.gender,
        },
        omit: { password: true },
      });
      expect(res.id).toBe('u-1');
      // sebaiknya password tidak ikut di response
      // @ts-expect-error password must be omitted
      expect(res.password).toBeUndefined();
    });

    it('Negative Case - Error umum → InternalServerErrorException', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed!');
      (prismaMock.users.create as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.create(createDto as any)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // findAll()
  // =========================================================
  describe('findAll()', () => {
    it('Positive Case - include Employee/Resident/_count; orderBy fullName asc', async () => {
      (prismaMock.users.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'u-1',
          fullName: 'Budi',
          Employee: { employeeNumberId: 'E1' },
          Resident: { emergencyContactName: 'Siti' },
          _count: { ForumPosts: 1, ForumComments: 2 },
        },
      ]);

      const res = await service.findAll();

      expect(prismaMock.users.findMany).toHaveBeenCalledWith({
        include: {
          Employee: {
            select: {
              employeeNumberId: true,
              employeePosition: true,
              hireDate: true,
              workingHours: true,
              salary: true,
              bonus: true,
            },
          },
          Resident: {
            select: {
              emergencyContactName: true,
              emergencyContactNumber: true,
              movedInDate: true,
              movedOutDate: true,
            },
          },
          _count: { select: { ForumPosts: true, ForumComments: true } },
        },
        orderBy: { fullName: 'asc' },
      });
      expect(res).toHaveLength(1);
    });

    it('Negative Case - Error umum → InternalServerErrorException', async () => {
      (prismaMock.users.findMany as jest.Mock).mockRejectedValue(new Error('db err'));
      await expect(service.findAll()).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  // =========================================================
  // findOne()
  // =========================================================
  describe('findOne()', () => {
    it('Positive Case - Dapatkan detail user + relasi Employee/Resident', async () => {
      (prismaMock.users.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'u-1',
        fullName: 'Budi',
        Employee: {
          employeeNumberId: 'E1',
          Announcements: [{ title: 'T', content: 'C', publishDate: new Date(), expiryDate: new Date() }],
          Complaints: [{ title: 'Keluhan', description: '...', submittedAt: new Date(), status: 'OPEN' }],
        },
        Resident: {
          emergencyContactName: 'Siti',
          unit: { unitNumber: 'A-101', buildingName: 'A', location: 'L1', floorNumber: 1 },
        },
      });

      const res = await service.findOne('u-1');

      expect(prismaMock.users.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'u-1' },
        include: {
          Employee: {
            select: {
              employeeNumberId: true,
              employeePosition: true,
              hireDate: true,
              workingHours: true,
              salary: true,
              bonus: true,
              Complaints: {
                select: { title: true, description: true, submittedAt: true, status: true },
              },
              Announcements: {
                select: { title: true, content: true, publishDate: true, expiryDate: true },
                orderBy: { publishDate: 'asc' },
              },
            },
          },
          Resident: {
            select: {
              emergencyContactName: true,
              emergencyContactNumber: true,
              movedInDate: true,
              movedOutDate: true,
              unit: {
                select: {
                  unitNumber: true,
                  buildingName: true,
                  location: true,
                  floorNumber: true,
                },
              },
            },
          },
        },
      });
      expect(res.id).toBe('u-1');
      expect(res.Employee?.employeeNumberId).toBe('E1');
      expect(res.Resident?.unit?.unitNumber).toBe('A-101');
    });

    it('Negative Case - NotFoundError → NotFoundException', async () => {
      const err = new Error('not found');
      (err as any).name = 'NotFoundError';
      (prismaMock.users.findUniqueOrThrow as jest.Mock).mockRejectedValue(err);

      await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('Negative Case - Error umum → InternalServerErrorException', async () => {
      (prismaMock.users.findUniqueOrThrow as jest.Mock).mockRejectedValue(new Error('db err'));
      await expect(service.findOne('missing')).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  // =========================================================
  // update()
  // =========================================================
  describe('update()', () => {
    it('Positive Case - Update field non-password & omit password di response', async () => {
      (prismaMock.users.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'u-1',
        fullName: 'Old',
        firstName: 'Old',
        lastName: 'Old',
        username: 'budi',
        primaryEmail: 'budi@example.com',
        role: 'USER',
        gender: 'M',
      });

      (prismaMock.users.update as jest.Mock).mockResolvedValue({
        id: 'u-1',
        ...updateDto,
        password: undefined,
      });

      const res = await service.update('u-1', updateDto as any);

      expect(prismaMock.users.update).toHaveBeenCalledWith({
        where: { id: 'u-1' },
        data: expect.objectContaining({
          fullName: updateDto.fullName,
          firstName: updateDto.firstName,
          lastName: updateDto.lastName,
          username: updateDto.username,
          primaryEmail: updateDto.primaryEmail,
          role: updateDto.role,
          gender: updateDto.gender,
          secondaryEmail: updateDto.secondaryEmail,
          contactNumber: updateDto.contactNumber,
          dateOfBirth: updateDto.dateOfBirth,
          updatedAt: expect.any(Date),
        }),
        omit: { password: true },
      });
      // @ts-expect-error password must not be in response
      expect(res.password).toBeUndefined();
      expect(res.role).toBe('ADMIN');
    });

    it('Negative Case - NotFoundError → NotFoundException', async () => {
      const err = new Error('not found');
      (err as any).name = 'NotFoundError';
      (prismaMock.users.findUniqueOrThrow as jest.Mock).mockRejectedValue(err);

      await expect(service.update('missing', updateDto as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('Negative Case - P2025 → NotFoundException', async () => {
      (prismaMock.users.findUniqueOrThrow as jest.Mock).mockRejectedValue(prismaP2025());

      await expect(service.update('missing', updateDto as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('Negative Case - Error umum saat update → InternalServerErrorException', async () => {
      (prismaMock.users.findUniqueOrThrow as jest.Mock).mockResolvedValue({ id: 'u-1' });
      (prismaMock.users.update as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.update('u-1', updateDto as any)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // remove()
  // =========================================================
  describe('remove()', () => {
    it('Positive Case - Hapus user', async () => {
      (prismaMock.users.findUniqueOrThrow as jest.Mock).mockResolvedValue({ id: 'u-1' });
      (prismaMock.users.delete as jest.Mock).mockResolvedValue({ id: 'u-1' });

      const res = await service.remove('u-1');

      expect(prismaMock.users.delete).toHaveBeenCalledWith({ where: { id: 'u-1' } });
      expect(res).toEqual({ id: 'u-1' });
    });

    it('Negative Case - NotFoundError → NotFoundException', async () => {
      const err = new Error('not found');
      (err as any).name = 'NotFoundError';
      (prismaMock.users.findUniqueOrThrow as jest.Mock).mockRejectedValue(err);

      await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('Negative Case - P2025 → NotFoundException', async () => {
      (prismaMock.users.findUniqueOrThrow as jest.Mock).mockResolvedValue({ id: 'u-1' });
      (prismaMock.users.delete as jest.Mock).mockRejectedValue(prismaP2025());

      await expect(service.remove('u-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('Negative Case - Error umum saat delete → InternalServerErrorException', async () => {
      (prismaMock.users.findUniqueOrThrow as jest.Mock).mockResolvedValue({ id: 'u-1' });
      (prismaMock.users.delete as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.remove('u-1')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // passwordHashing() & compare()
  // =========================================================
  describe('passwordHashing() & compare()', () => {
    it('Positive Case - passwordHashing memanggil bcrypt.hash(salt=15)', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed!');
      const hashed = await service.passwordHashing('abc');
      expect(bcrypt.hash).toHaveBeenCalledWith('abc', 15);
      expect(hashed).toBe('hashed!');
    });

    it('Positive Case - compare memanggil bcrypt.compare', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await service.compare('abc', 'hashed!');
      expect(bcrypt.compare).toHaveBeenCalledWith('abc', 'hashed!');
      expect(result).toBe(true);
    });
  });
});
