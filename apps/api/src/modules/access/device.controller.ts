import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator.js';
import { AccessService } from './access.service.js';
import { PlateReadDto } from './dto/plate-read.dto.js';
import { DeviceKeyGuard, type DeviceRequest } from './guards/device-key.guard.js';

/** Endpoints called by field devices (LPR cameras), authenticated by device key instead of JWT. */
@ApiTags('devices')
@ApiSecurity('device-key')
@Public()
@SkipThrottle()
@UseGuards(DeviceKeyGuard)
@Controller('devices')
export class DeviceController {
  constructor(private readonly access: AccessService) {}

  @Post('plate-reads')
  plateRead(@Req() request: DeviceRequest, @Body() dto: PlateReadDto) {
    // DeviceKeyGuard guarantees the gate is attached.
    return this.access.handlePlateRead(request.gate!, dto);
  }
}
