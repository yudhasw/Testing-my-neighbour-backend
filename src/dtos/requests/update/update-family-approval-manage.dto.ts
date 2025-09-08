import { PartialType } from '@nestjs/mapped-types';
import { CreateFamilyApprovalManageDto } from '../create/create-family-approval-manage.dto';

export class UpdateFamilyApprovalManageDto extends PartialType(
  CreateFamilyApprovalManageDto,
) {}
