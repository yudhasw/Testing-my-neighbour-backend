import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateFamilyApprovalManageDto } from '../../../../dtos/requests/create/create-family-approval-manage.dto';
import { UpdateFamilyApprovalManageDto } from '../../../../dtos/requests/update/update-family-approval-manage.dto';
import { DatabaseService } from '../../../../common/database/database.service';
import { PrismaClientKnownRequestError } from '../../../../common/database/generated/prisma/runtime/library';
import { ApprovalStatus } from '../../../../common/database/generated/prisma';

@Injectable()
export class FamilyApprovalManageService {
  constructor(private readonly prisma: DatabaseService) {}

  async create(createRequest: CreateFamilyApprovalManageDto) {
    try {
      const existingRequest = await this.prisma.familyApprovals.findFirst({
        where: {
          familyMemberId: createRequest.familyMemberId,
          status: ApprovalStatus.PENDING,
        },
      });

      if (existingRequest) {
        throw new BadRequestException(
          'Permintaan persetujuan yang tertunda sudah ada untuk anggota keluarga ini.',
        );
      }

      return await this.prisma.familyApprovals.create({
        data: {
          familyMemberId: createRequest.familyMemberId,
          headOfHouseholdId: createRequest.headOfHouseholdId,
          status: ApprovalStatus.PENDING,
          notes: createRequest.notes,
        },
      });
    } catch (error) {
      console.error((error as Error).message);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'ID anggota keluarga atau ID kepala rumah tangga tidak valid.',
          );
        }
      }
      if (error instanceof BadRequestException) throw error; // Re-throw custom error
      throw new InternalServerErrorException(
        'Terjadi kesalahan saat membuat Data permintaan persetujuan keluarga.',
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.familyApprovals.findMany({
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
        orderBy: {
          requestedAt: 'desc',
        },
      });
    } catch (error) {
      console.error((error as Error).message);
      throw new InternalServerErrorException(
        'Terjadi kesalahan saat mengambil semua Data permintaan persetujuan keluarga.',
      );
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.familyApprovals.findUniqueOrThrow({
        where: { id: id },
        include: {
          familyMember: true,
          headOfHousehold: true,
        },
      });
    } catch (error) {
      console.error((error as Error).message);
      if ((error as PrismaClientKnownRequestError).code === 'P2025') {
        throw new NotFoundException(
          `Data Permintaan persetujuan keluarga dengan ID ${id} tidak ditemukan.`,
        );
      }
      throw new InternalServerErrorException(
        'Terjadi kesalahan saat mengambil Data permintaan persetujuan keluarga.',
      );
    }
  }

  async update(id: string, updateRequest: UpdateFamilyApprovalManageDto) {
    try {
      const existData = await this.prisma.familyApprovals.findUniqueOrThrow({
        where: { id: id },
      });

      if (!existData) {
        throw new NotFoundException(
          `Data permintaan persetujuan Keluarga dengan id: ${id} tidak ditemukan`,
        );
      }

      return await this.prisma.familyApprovals.update({
        where: { id: id },
        data: {
          status: updateRequest.status,
          respondedAt:
            updateRequest.status !== ApprovalStatus.PENDING
              ? new Date()
              : undefined,
          notes: updateRequest.notes,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      if ((error as PrismaClientKnownRequestError).code === 'P2025') {
        throw new NotFoundException(
          `Data Permintaan persetujuan keluarga dengan ID ${id} tidak ditemukan.`,
        );
      }
      throw new InternalServerErrorException(
        'Terjadi kesalahan saat memperbarui Data permintaan persetujuan keluarga.',
      );
    }
  }

  async remove(id: string) {
    try {
      const existData = await this.prisma.familyApprovals.findUniqueOrThrow({
        where: { id: id },
      });

      if (!existData) {
        throw new NotFoundException(
          `Data permintaan persetujuan Keluarga dengan id: ${id} tidak ditemukan`,
        );
      }

      return await this.prisma.familyApprovals.delete({
        where: { id: id },
      });
    } catch (error) {
      if ((error as PrismaClientKnownRequestError).code === 'P2025') {
        throw new NotFoundException(
          `Data Permintaan persetujuan keluarga dengan ID ${id} tidak ditemukan.`,
        );
      }
      throw new InternalServerErrorException(
        'Terjadi kesalahan saat menghapus Data permintaan persetujuan keluarga.',
      );
    }
  }
}
