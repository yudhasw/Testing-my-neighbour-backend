import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateFamilyCodeManageDto } from '../../../../dtos/requests/create/create-family-code-manage.dto';
import { UpdateFamilyCodeManageDto } from '../../../../dtos/requests/update/update-family-code-manage.dto';
import { DatabaseService } from '../../../../common/database/database.service';
import { PrismaClientKnownRequestError } from '../../../../common/database/generated/prisma/runtime/library';

@Injectable()
export class FamilyCodeManageService {
  constructor(private readonly prisma: DatabaseService) {}

  async create(createRequest: CreateFamilyCodeManageDto) {
    try {
      return await this.prisma.familyCodes.create({
        data: {
          code: createRequest.code,
          headResident: {
            connect: { id: createRequest.headOfHousehold ?? undefined },
          },
          unit: { connect: { id: createRequest.unitId ?? undefined } },
          isActive: createRequest.isActive ?? true,
          maxMembers: createRequest.maxMembers ?? 10,
        },
      });
    } catch (error) {
      console.error((error as Error).message);
      throw new InternalServerErrorException(
        'Terjadi kesalahan saat membuat kode keluarga.',
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.familyCodes.findMany({
        orderBy: {
          createdAt: 'asc',
          code: 'asc',
        },
      });
    } catch (error) {
      console.error((error as Error).message);
      throw new InternalServerErrorException(
        'Terjadi kesalahan saat mendapatkan data kode keluarga.',
      );
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.familyCodes.findUniqueOrThrow({
        where: { id: id },
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
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Kode keluarga dengan id: ${id} tidak ditemukan.`,
        );
      }
      console.error((error as Error).message);
      throw new InternalServerErrorException(
        'Terjadi kesalahan saat mendapatkan kode keluarga.',
      );
    }
  }

  async update(id: string, updateRequest: UpdateFamilyCodeManageDto) {
    try {
      const existData = await this.prisma.familyCodes.findUniqueOrThrow({
        where: { id: id },
      });

      if (!existData) {
        throw new NotFoundException(
          `Code Keluarga dengan id: ${id} tidak ditemukan`,
        );
      }

      return await this.prisma.familyCodes.update({
        where: { id: id },
        data: {
          code: updateRequest.code ?? existData.code,
          headResident: {
            connect: updateRequest.headOfHousehold
              ? { id: updateRequest.headOfHousehold }
              : undefined,
          },
          unit: updateRequest.unitId
            ? { connect: { id: updateRequest.unitId } }
            : undefined,
          isActive: updateRequest.isActive,
          maxMembers: updateRequest.maxMembers,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Kode keluarga dengan id: ${id} tidak ditemukan.`,
        );
      }
      console.error((error as Error).message);
      throw new InternalServerErrorException(
        'Terjadi kesalahan saat memperbarui kode keluarga.',
      );
    }
  }

  async remove(id: string) {
    try {
      const existData = await this.prisma.familyCodes.findUniqueOrThrow({
        where: { id: id },
      });

      if (!existData) {
        throw new NotFoundException(
          `Code Keluarga dengan id: ${id} tidak ditemukan`,
        );
      }

      return await this.prisma.familyCodes.delete({
        where: { id: id },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Kode keluarga dengan id: ${id} tidak ditemukan.`,
        );
      }
      console.error((error as Error).message);
      throw new InternalServerErrorException(
        'Terjadi kesalahan saat menghapus kode keluarga.',
      );
    }
  }
}
