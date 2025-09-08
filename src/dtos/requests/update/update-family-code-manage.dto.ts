import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsUnique } from '../../../common/pipes/validators/is-unique-validators';

export class UpdateFamilyCodeManageDto {
  @IsString({ message: 'Kode keluarga harus berupa teks.' })
  @IsOptional()
  @IsUnique(
    { field: 'code', model: 'familyCodes' },
    { message: 'Kode keluarga sudah terdaftar.' },
  )
  readonly code?: string;

  @IsUUID('4', {
    message: 'ID kepala keluarga harus berupa UUID versi 4 yang valid.',
  })
  @IsOptional()
  readonly headOfHousehold?: string;

  @IsUUID('4', {
    message: 'ID unit hunian harus berupa UUID versi 4 yang valid.',
  })
  @IsOptional()
  readonly unitId?: string;

  @IsBoolean({ message: 'Status aktif harus berupa boolean.' })
  @IsOptional()
  readonly isActive?: boolean;

  @IsInt({ message: 'Jumlah anggota maksimal harus berupa angka bulat.' })
  @IsOptional()
  @Min(1, { message: 'Jumlah anggota minimal 1 orang.' })
  @Max(20, { message: 'Jumlah anggota maksimal 20 orang.' })
  @Type(() => Number)
  readonly maxMembers?: number;
}
