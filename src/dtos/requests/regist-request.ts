/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsDate,
  IsOptional,
  IsEmail,
  IsEnum,
  Matches,
  ValidateIf,
  IsUUID,
  IsDateString,
  IsBoolean,
  IsArray,
  IsStrongPassword,
} from 'class-validator';
import {
  Gender,
  ResidentStatus,
  UserRole,
} from '../../common/database/generated/prisma';
import { IsUnique } from '../../common/pipes/validators/is-unique-validators';

export enum RegistrationMethod {
  ADMIN_DRIVEN = 'ADMIN_DRIVEN',
  USER_DRIVEN = 'USER_DRIVEN',
}

export class RegistRequest {
  @IsString({ message: 'Nama lengkap harus berupa teks' })
  @IsNotEmpty({ message: 'Nama lengkap tidak boleh kosong' })
  readonly fullName: string;

  @IsString({ message: 'Nama depan harus berupa teks' })
  @IsNotEmpty({ message: 'Nama depan tidak boleh kosong' })
  readonly firstName: string;

  @IsString({ message: 'Nama belakang harus berupa teks' })
  @IsNotEmpty({ message: 'Nama belakang tidak boleh kosong' })
  readonly lastName: string;

  @IsString({ message: 'Username harus berupa teks' })
  @IsNotEmpty({ message: 'Username tidak boleh kosong' })
  @IsUnique(
    { field: 'username', model: 'users' },
    { message: 'Username sudah terdaftar ' },
  )
  @MinLength(5, { message: 'Username harus lebih dari 5 karakter' })
  @MaxLength(15, { message: 'Username harus kurang dari 15 karakter' })
  readonly username: string;

  @IsString({ message: 'Password harus berupa teks' })
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @MinLength(4, { message: 'Password minimal 4 karakter' })
  @IsStrongPassword(
    {
      minLength: 4,
      minLowercase: 1,
      minNumbers: 3,
      minSymbols: 1,
      minUppercase: 1,
    },
    {
      message: 'Kata sandi harus minimal 4 karakter, 3 angka, dan 1 simbol.',
    },
  )
  @MaxLength(15, {
    message: 'Password maksimal 15 karakter',
  })
  readonly password: string;

  @IsDate({ message: 'Tanggal lahir harus berupa format tanggal' })
  @IsOptional()
  @Type(() => Date)
  readonly dateOfBirth: Date;

  @IsNotEmpty({ message: 'Peran tidak boleh kosong' })
  @IsEnum(UserRole, {
    message: 'Peran tidak valid: ' + Object.values(UserRole).join(', '),
  })
  readonly role: UserRole;

  @IsNotEmpty({ message: 'Jenis kelamin tidak boleh kosong' })
  @IsEnum(Gender, {
    message: 'Jenis kelamin tidak valid: ' + Object.values(Gender).join(', '),
  })
  readonly gender: Gender;

  @IsString({ message: 'Nomor kontak harus berupa teks' })
  @IsOptional()
  readonly contactNumber: string;

  @IsString({ message: 'Email utama harus berupa teks' })
  @IsNotEmpty({ message: 'Email utama tidak boleh kosong' })
  @IsUnique(
    { field: 'primaryEmail', model: 'users' },
    { message: 'Email utama sudah digunakan' },
  )
  @IsEmail(
    {
      ignore_max_length: true,
      allow_display_name: true,
    },
    {
      message: 'Kolom Email harus berupa Email yang valid',
    },
  )
  readonly primaryEmail: string;

  @IsNotEmpty({ message: 'Status penghuni tidak boleh kosong.' })
  @IsEnum(ResidentStatus, {
    message:
      'Status penghuni tidak valid. Pilihan: ' +
      Object.values(ResidentStatus).join(', '),
  })
  readonly residentType: ResidentStatus;

  @IsNotEmpty({ message: 'metode registrasi tidak boleh kosong' })
  @IsEnum(RegistrationMethod, {
    message:
      'metode registrasi tidak valid. Pilihan: ' +
      Object.values(ResidentStatus).join(', '),
  })
  registrationMethod: RegistrationMethod;

  @IsString({ message: 'Nama kontak darurat harus berupa teks.' })
  @IsOptional()
  readonly emergencyContactName: string;

  @IsString({ message: 'Nomor kontak darurat harus berupa teks.' })
  @Matches(/^\+?\d{8,15}$/, { message: 'Nomor kontak darurat tidak valid.' })
  @IsOptional()
  readonly emergencyContactNumber: string;

  @IsDate({ message: 'Tanggal masuk harus berupa format tanggal yang valid.' })
  @IsNotEmpty({ message: 'Tanggal Masuk tidak boleh kosong' })
  @Type(() => Date)
  readonly movedInDate: Date;

  @ValidateIf((o) => o.residentType === ResidentStatus.HEAD_HOUSE_HOLD)
  @IsString({ message: 'Nama kontak darurat harus berupa teks.' })
  @IsUUID('4', {
    message: 'ID Unit Hunian harus berupa UUID versi 4 yang valid.',
  })
  @IsNotEmpty({ message: 'ID Unit hunian tidak boleh kosong' })
  unitId: string;

  @ValidateIf((o) => o.residentType === ResidentStatus.HEAD_HOUSE_HOLD)
  @IsOptional({ message: 'Biaya cicilan unit hunain bersifat opsional' })
  @Transform(({ value }) => parseFloat(value))
  kprPaymentAmount?: number;

  @ValidateIf((o) => o.residentType === ResidentStatus.HEAD_HOUSE_HOLD)
  @IsOptional()
  @IsDateString()
  kprDueDate?: string;

  @ValidateIf((o) => o.residentType === ResidentStatus.HEAD_HOUSE_HOLD)
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isKprPaid?: boolean;

  @ValidateIf((o) => o.residentType === ResidentStatus.FAMILY_MEMBERS)
  @IsNotEmpty()
  @IsString()
  familyCode?: string;

  @ValidateIf((o) => o.residentType === ResidentStatus.HEAD_HOUSE_HOLD)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentTypes?: string[];
}
