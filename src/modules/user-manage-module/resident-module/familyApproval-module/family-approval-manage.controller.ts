import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FamilyApprovalManageService } from './family-approval-manage.service';
import { CreateFamilyApprovalManageDto } from '../../../../dtos/requests/create/create-family-approval-manage.dto';
import { UpdateFamilyApprovalManageDto } from '../../../../dtos/requests/update/update-family-approval-manage.dto';

@Controller('family-approval-manage')
export class FamilyApprovalManageController {
  constructor(
    private readonly familyApprovalManageService: FamilyApprovalManageService,
  ) {}

  @Post()
  create(@Body() createFamilyApprovalManageDto: CreateFamilyApprovalManageDto) {
    return this.familyApprovalManageService.create(
      createFamilyApprovalManageDto,
    );
  }

  @Get()
  findAll() {
    return this.familyApprovalManageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.familyApprovalManageService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFamilyApprovalManageDto: UpdateFamilyApprovalManageDto,
  ) {
    return this.familyApprovalManageService.update(
      id,
      updateFamilyApprovalManageDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.familyApprovalManageService.remove(id);
  }
}
