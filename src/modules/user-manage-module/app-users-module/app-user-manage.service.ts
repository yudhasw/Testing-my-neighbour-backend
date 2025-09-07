import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateAppUserManageDto } from '../../../dtos/requests/create/create-app-user-manage.dto';
import { UpdateAppUserManageDto } from '../../../dtos/requests/update/update-app-user-manage.dto';
import { DatabaseService } from '../../../common/database/database.service';
import { PrismaClientKnownRequestError } from '../../../common/database/generated/prisma/runtime/library';

@Injectable()
export class AppUserManageService {
  constructor(private readonly prisma: DatabaseService) {}
  async create(createRequest: CreateAppUserManageDto) {
    try {
      const hashedPassword = await this.passwordHashing(createRequest.password);

      return await this.prisma.users.create({
        data: {
          fullName: createRequest.fullName,
          firstName: createRequest.firstName,
          lastName: createRequest.lastName,
          username: createRequest.username,
          primaryEmail: createRequest.primaryEmail,
          password: hashedPassword,
          role: createRequest.role,
          gender: createRequest.gender,
        },
        omit: {
          password: true,
        },
      });
    } catch (error) {
      console.error((error as Error).message);
      throw new InternalServerErrorException(
        'Terjadi Kesalahan Saat Membuat Data Pengguna Aplikasi',
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.users.findMany({
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
          _count: {
            select: { ForumPosts: true, ForumComments: true },
          },
        },
        orderBy: {
          fullName: 'asc',
        },
      });
    } catch (error) {
      console.error((error as Error).message);
      throw new InternalServerErrorException(
        'Terjadi Kesalahan Saat Mendapatkan Data Pengguna Aplikasi',
      );
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.users.findUniqueOrThrow({
        where: { id: id },
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
                select: {
                  title: true,
                  description: true,
                  submittedAt: true,
                  status: true,
                },
              },
              Announcements: {
                select: {
                  title: true,
                  content: true,
                  publishDate: true,
                  expiryDate: true,
                },
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
        // Omit tidak didukung pada findUnique dengan include
        // Anda harus memilih properti secara eksplisit dengan 'select'
      });
    } catch (error) {
      // Catch specific errors like NotFoundError
      if ((error as Error).name === 'NotFoundError') {
        throw new NotFoundException(
          `Pengguna Aplikasi dengan id: ${id} tidak ditemukan`,
        );
      }
      console.error((error as Error).message);
      throw new InternalServerErrorException(
        'Terjadi Kesalahan Saat Mendapatkan Data Pengguna Aplikasi', // Perbaiki pesan error
      );
    }
  }

  async update(id: string, updateRequest: UpdateAppUserManageDto) {
    try {
      const existData = await this.prisma.users.findUniqueOrThrow({
        where: { id: id },
      });

      if (!existData) {
        throw new NotFoundException(
          `Pengguna Aplikasi dengan id: ${id} tidak ditemukan`,
        );
      }

      const updatedData = await this.prisma.users.update({
        where: { id: id },
        data: {
          fullName: updateRequest.fullName ?? existData.fullName,
          firstName: updateRequest.firstName ?? existData.firstName,
          lastName: updateRequest.lastName ?? existData.lastName,
          username: updateRequest.username ?? existData.username,
          primaryEmail: updateRequest.primaryEmail ?? existData.primaryEmail,
          role: updateRequest.role ?? existData.role,
          gender: updateRequest.gender ?? existData.gender,
          secondaryEmail:
            updateRequest.secondaryEmail ?? existData.secondaryEmail,
          contactNumber: updateRequest.contactNumber ?? existData.contactNumber,
          dateOfBirth: updateRequest.dateOfBirth ?? existData.dateOfBirth,
          updatedAt: new Date(),
        },
        omit: {
          password: true,
        },
      });

      return updatedData;
    } catch (error) {
      if ((error as Error).name === 'NotFoundError') {
        throw new NotFoundException(
          `Pengguna Aplikasi dengan id: ${id} tidak ditemukan`,
        );
      }

      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Pengguna Aplikasi dengan id: ${id} tidak ditemukan`,
          );
        }
      }

      console.error((error as Error).message);
      throw new InternalServerErrorException(
        'Terjadi Kesalahan Saat Mendapatkan Pengguna Aplikasi',
      );
    }
  }

  async remove(id: string) {
    try {
      const existData = await this.prisma.users.findUniqueOrThrow({
        where: { id: id },
      });

      if (!existData) {
        throw new NotFoundException(
          `Pengguna Aplikasi dengan id: ${id} tidak ditemukan`,
        );
      }

      return await this.prisma.users.delete({
        where: { id: id },
      });
    } catch (error) {
      if ((error as Error).name === 'NotFoundError') {
        throw new NotFoundException(
          `Pengguna Aplikasi dengan id: ${id} tidak ditemukan`,
        );
      }

      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Resident dengan id: ${id} tidak ditemukan`,
          );
        }
      }

      console.error((error as Error).message);
      throw new InternalServerErrorException(
        'Terjadi Kesalahan Saat Menghapus Data Pengguna Aplikasi',
      );
    }
  }

  async passwordHashing(password: string): Promise<string> {
    return await bcrypt.hash(password, 15);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
