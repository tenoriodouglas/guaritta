import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CreateGateDto } from './dto/create-gate.dto.js';
import { UpdateGateDto } from './dto/update-gate.dto.js';
import { GatesService } from './gates.service.js';

@ApiTags('gates')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('gates')
export class GatesController {
  constructor(private readonly gates: GatesService) {}

  @Post()
  create(@Body() dto: CreateGateDto) {
    return this.gates.create(dto);
  }

  @Roles('ADMIN', 'CONCIERGE')
  @Get()
  findAll() {
    return this.gates.findAll();
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateGateDto) {
    return this.gates.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.gates.remove(id);
  }

  @Post(':id/device-key')
  rotateDeviceKey(@Param('id', ParseUUIDPipe) id: string) {
    return this.gates.rotateDeviceKey(id);
  }
}
