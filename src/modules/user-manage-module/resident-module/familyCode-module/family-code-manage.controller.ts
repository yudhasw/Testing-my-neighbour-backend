import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FamilyCodeManageService } from './family-code-manage.service';
import { CreateFamilyCodeManageDto } from '../../../../dtos/requests/create/create-family-code-manage.dto';
import { UpdateFamilyCodeManageDto } from '../../../../dtos/requests/update/update-family-code-manage.dto';

@Controller('family-code-manage')
export class FamilyCodeManageController {
  constructor(
    private readonly familyCodeManageService: FamilyCodeManageService,
  ) {}

  @Post()
  create(@Body() createFamilyCodeManageDto: CreateFamilyCodeManageDto) {
    return this.familyCodeManageService.create(createFamilyCodeManageDto);
  }

  @Get()
  findAll() {
    return this.familyCodeManageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.familyCodeManageService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFamilyCodeManageDto: UpdateFamilyCodeManageDto,
  ) {
    return this.familyCodeManageService.update(id, updateFamilyCodeManageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.familyCodeManageService.remove(id);
  }
}
