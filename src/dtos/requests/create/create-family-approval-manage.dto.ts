import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApprovalStatus } from 'src/common/database/generated/prisma';

export class CreateFamilyApprovalManageDto {
  @IsUUID('4', {
    message: 'ID anggota keluarga harus berupa UUID versi 4 yang valid.',
  })
  @IsNotEmpty({ message: 'ID anggota keluarga tidak boleh kosong.' })
  readonly familyMemberId: string;

  @IsUUID('4', {
    message: 'ID kepala keluarga harus berupa UUID versi 4 yang valid.',
  })
  @IsNotEmpty({ message: 'ID kepala keluarga tidak boleh kosong.' })
  readonly headOfHouseholdId: string;

  @IsString({ message: 'Catatan harus berupa teks.' })
  @IsOptional()
  readonly notes?: string;

  @IsNotEmpty({ message: 'Peran tidak boleh kosong' })
  @IsEnum(ApprovalStatus, {
    message: 'Peran tidak valid: ' + Object.values(ApprovalStatus).join(', '),
  })
  readonly status: ApprovalStatus;
}
