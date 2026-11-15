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
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { ListVehiclesQueryDto } from './dto/list-vehicles-query.dto.js';
import { SetVehicleStatusDto } from './dto/set-vehicle-status.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';
import { VehiclesService } from './vehicles.service.js';

@ApiTags('vehicles')
@ApiBearerAuth()
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehicles: VehiclesService) {}

  // Residents can self-register vehicles for their own unit.
  @Post()
  create(@Body() dto: CreateVehicleDto, @CurrentUser() user: AuthUser) {
    assertUnitAccess(user, dto.unitId);
    return this.vehicles.create(dto);
  }

  @Get()
  findAll(@Query() query: ListVehiclesQueryDto, @CurrentUser() user: AuthUser) {
    return this.vehicles.findAll({ ...query, unitId: scopeUnitId(user, query.unitId) });
  }

  @Roles('ADMIN', 'CONCIERGE')
  @Get('plate/:plate')
  findByPlate(@Param('plate') plate: string) {
    return this.vehicles.findByPlate(plate);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleDto,
    @CurrentUser() user: AuthUser,
  ) {
    assertUnitAccess(user, (await this.vehicles.findOne(id)).unitId);
    return this.vehicles.update(id, dto);
  }

  @Roles('ADMIN', 'CONCIERGE')
  @Patch(':id/status')
  setStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SetVehicleStatusDto) {
    return this.vehicles.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    assertUnitAccess(user, (await this.vehicles.findOne(id)).unitId);
    return this.vehicles.remove(id);
  }
}
