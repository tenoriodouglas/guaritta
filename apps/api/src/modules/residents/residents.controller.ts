import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { assertUnitAccess, scopeUnitId } from '../auth/unit-access.js';
import { CreateResidentDto } from './dto/create-resident.dto.js';
import { ListResidentsQueryDto } from './dto/list-residents-query.dto.js';
import { UpdateResidentDto } from './dto/update-resident.dto.js';
import { ResidentsService } from './residents.service.js';

@ApiTags('residents')
@ApiBearerAuth()
@Controller('residents')
export class ResidentsController {
  constructor(private readonly residents: ResidentsService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateResidentDto) {
    return this.residents.create(dto);
  }

  @Get()
  findAll(@Query() query: ListResidentsQueryDto, @CurrentUser() user: AuthUser) {
    return this.residents.findAll({ ...query, unitId: scopeUnitId(user, query.unitId) });
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    const resident = await this.residents.findOne(id);
    assertUnitAccess(user, resident.unitId);
    return resident;
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateResidentDto) {
    return this.residents.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.residents.remove(id);
  }
}
