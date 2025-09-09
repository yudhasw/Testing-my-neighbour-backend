import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import {
  PaymentStatus,
  PaymentType,
} from '../../common/database/generated/prisma';

export class PaymentsReportFilterDto {
  @IsOptional()
  @IsDateString({}, { message: 'Tanggal mulai harus dalam format ISO 8601.' })
  readonly startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Tanggal akhir harus dalam format ISO 8601.' })
  readonly endDate?: string;

  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'Status pembayaran tidak valid.' })
  readonly status?: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentType, { message: 'Tipe pembayaran tidak valid.' })
  readonly paymentType?: PaymentType;
}
