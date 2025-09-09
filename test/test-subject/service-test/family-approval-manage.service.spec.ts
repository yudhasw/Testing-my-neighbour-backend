/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FamilyApprovalManageService } from '../../../src/modules/user-manage-module/resident-module/familyApproval-module/family-approval-manage.service';
import { DatabaseService } from '../../../src/common/database/database.service';
import { PrismaClientKnownRequestError } from '../../../src/common/database/generated/prisma/runtime/library';
import { ApprovalStatus } from '../../../src/common/database/generated/prisma';

describe('FamilyApprovalManageService', () => {
  let service: FamilyApprovalManageService;

  // ---- Prisma Mock ----
  const prismaMock = {
    familyApprovals: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as unknown as DatabaseService;

  // ---- Helper builders for Prisma errors ----
  const prismaP2003 = () =>
    // @ts-ignore construct manually for tests
    new PrismaClientKnownRequestError('FK violation', {
      code: 'P2003',
      clientVersion: 'test',
    });

  const prismaP2025 = () =>
    // @ts-ignore construct manually for tests
    new PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: 'test',
    });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FamilyApprovalManageService(prismaMock);
  });

  // ===== Dummy DTOs =====
  const createDto = {
    familyMemberId: 'fm-1',
    headOfHouseholdId: 'hoh-1',
    notes: 'Mohon disetujui',
  };

  const updateDtoApprove = {
    status: ApprovalStatus.APPROVED,
    notes: 'OK',
  };

  const updateDtoPending = {
    status: ApprovalStatus.PENDING,
    notes: 'Masih dicek',
  };

  // =========================================================
  // create()
  // =========================================================
  describe('create()', () => {
    it('Positive Case - Berhasil create ketika tidak ada request PENDING', async () => {
      (prismaMock.familyApprovals.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaMock.familyApprovals.create as jest.Mock).mockResolvedValue({
        id: 'fa-1',
        familyMemberId: createDto.familyMemberId,
        headOfHouseholdId: createDto.headOfHouseholdId,
        status: ApprovalStatus.PENDING,
        notes: createDto.notes,
      });

      const res = await service.create(createDto as any);

      expect(prismaMock.familyApprovals.findFirst).toHaveBeenCalledWith({
        where: { familyMemberId: 'fm-1', status: ApprovalStatus.PENDING },
      });
      expect(prismaMock.familyApprovals.create).toHaveBeenCalledWith({
        data: {
          familyMemberId: 'fm-1',
          headOfHouseholdId: 'hoh-1',
          status: ApprovalStatus.PENDING,
          notes: 'Mohon disetujui',
        },
      });
      expect(res.id).toBe('fa-1');
    });

    it('Negative Case - Sudah ada request PENDING → BadRequestException', async () => {
      (prismaMock.familyApprovals.findFirst as jest.Mock).mockResolvedValue({ id: 'fa-old' });

      await expect(service.create(createDto as any)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('Negative Case - P2003 (FK invalid) → BadRequestException', async () => {
      (prismaMock.familyApprovals.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaMock.familyApprovals.create as jest.Mock).mockRejectedValue(prismaP2003());

      await expect(service.create(createDto as any)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('Negative Case - Error umum → InternalServerErrorException', async () => {
      (prismaMock.familyApprovals.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaMock.familyApprovals.create as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.create(createDto as any)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // findAll()
  // =========================================================
  describe('findAll()', () => {
    it('Positive Case - Data berhasil ditemukan (include relasi, orderBy requestedAt desc)', async () => {
      (prismaMock.familyApprovals.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'fa-1',
          requestedAt: new Date(),
          familyMember: { user: { fullName: 'Budi' } },
          headOfHousehold: { user: { fullName: 'Siti' } },
        },
      ]);

      const res = await service.findAll();

      expect(prismaMock.familyApprovals.findMany).toHaveBeenCalledWith({
        include: {
          familyMember: {
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
          headOfHousehold: {
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
        orderBy: { requestedAt: 'desc' },
      });
      expect(res).toHaveLength(1);
    });

    it('Negative Case - Error umum → InternalServerErrorException', async () => {
      (prismaMock.familyApprovals.findMany as jest.Mock).mockRejectedValue(new Error('db err'));
      await expect(service.findAll()).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  // =========================================================
  // findOne()
  // =========================================================
  describe('findOne()', () => {
    it('Positive Case - Berhasil mendapatkan detail approval dengan relasi', async () => {
      (prismaMock.familyApprovals.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'fa-1',
        familyMember: { id: 'fm-1' },
        headOfHousehold: { id: 'hoh-1' },
      });

      const res = await service.findOne('fa-1');

      expect(prismaMock.familyApprovals.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'fa-1' },
        include: { familyMember: true, headOfHousehold: true },
      });
      expect(res.id).toBe('fa-1');
    });

    it('Negative Case - P2025 → NotFoundException', async () => {
      (prismaMock.familyApprovals.findUniqueOrThrow as jest.Mock).mockRejectedValue(prismaP2025());

      await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('Negative Case - Error umum → InternalServerErrorException', async () => {
      (prismaMock.familyApprovals.findUniqueOrThrow as jest.Mock).mockRejectedValue(
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
    it('Positive Case - Update status APPROVED → respondedAt terisi; notes & updatedAt terisi', async () => {
      (prismaMock.familyApprovals.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'fa-1',
        status: ApprovalStatus.PENDING,
      });

      const updated = {
        id: 'fa-1',
        status: ApprovalStatus.APPROVED,
        respondedAt: new Date(),
        notes: 'OK',
        updatedAt: new Date(),
      };
      (prismaMock.familyApprovals.update as jest.Mock).mockResolvedValue(updated);

      const res = await service.update('fa-1', updateDtoApprove as any);

      expect(prismaMock.familyApprovals.update).toHaveBeenCalledWith({
        where: { id: 'fa-1' },
        data: expect.objectContaining({
          status: ApprovalStatus.APPROVED,
          respondedAt: expect.any(Date),
          notes: 'OK',
          updatedAt: expect.any(Date),
        }),
      });
      expect(res.status).toBe(ApprovalStatus.APPROVED);
      expect(res.respondedAt).toBeInstanceOf(Date);
    });

    it('Positive Case - Update status PENDING → respondedAt tidak diubah (undefined)', async () => {
      (prismaMock.familyApprovals.findUniqueOrThrow as jest.Mock).mockResolvedValue({
        id: 'fa-1',
        status: ApprovalStatus.PENDING,
      });

      (prismaMock.familyApprovals.update as jest.Mock).mockImplementation(({ data }: any) => {
        // Simulasikan bahwa respondedAt undefined tidak ikut diupdate
        return Promise.resolve({
          id: 'fa-1',
          status: data.status,
          respondedAt: undefined,
          notes: data.notes,
          updatedAt: data.updatedAt,
        });
      });

      const res = await service.update('fa-1', updateDtoPending as any);

      expect(prismaMock.familyApprovals.update).toHaveBeenCalledWith({
        where: { id: 'fa-1' },
        data: expect.objectContaining({
          status: ApprovalStatus.PENDING,
          respondedAt: undefined,
          notes: 'Masih dicek',
          updatedAt: expect.any(Date),
        }),
      });
      expect(res.respondedAt).toBeUndefined();
    });

    it('Negative Case - P2025 → NotFoundException', async () => {
      (prismaMock.familyApprovals.findUniqueOrThrow as jest.Mock).mockResolvedValue({ id: 'fa-1' });
      (prismaMock.familyApprovals.update as jest.Mock).mockRejectedValue(prismaP2025());

      await expect(service.update('fa-1', updateDtoApprove as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('Negative Case - Error umum → InternalServerErrorException', async () => {
      (prismaMock.familyApprovals.findUniqueOrThrow as jest.Mock).mockResolvedValue({ id: 'fa-1' });
      (prismaMock.familyApprovals.update as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.update('fa-1', updateDtoApprove as any)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  // =========================================================
  // remove()
  // =========================================================
  describe('remove()', () => {
    it('Positive Case - Berhasil hapus approval', async () => {
      (prismaMock.familyApprovals.findUniqueOrThrow as jest.Mock).mockResolvedValue({ id: 'fa-1' });
      (prismaMock.familyApprovals.delete as jest.Mock).mockResolvedValue({ id: 'fa-1' });

      const res = await service.remove('fa-1');

      expect(prismaMock.familyApprovals.delete).toHaveBeenCalledWith({ where: { id: 'fa-1' } });
      expect(res).toEqual({ id: 'fa-1' });
    });

    it('Negative Case - P2025 → NotFoundException', async () => {
      (prismaMock.familyApprovals.findUniqueOrThrow as jest.Mock).mockRejectedValue(prismaP2025());

      await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('Negative Case - Error umum → InternalServerErrorException', async () => {
      (prismaMock.familyApprovals.findUniqueOrThrow as jest.Mock).mockResolvedValue({ id: 'fa-1' });
      (prismaMock.familyApprovals.delete as jest.Mock).mockRejectedValue(new Error('db err'));

      await expect(service.remove('fa-1')).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });
});
