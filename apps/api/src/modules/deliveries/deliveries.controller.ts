import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { scopeUnitId } from '../auth/unit-access.js';
import { DeliveriesService } from './deliveries.service.js';
import { ListDeliveriesQueryDto } from './dto/list-deliveries-query.dto.js';
import { PickupDeliveryDto } from './dto/pickup-delivery.dto.js';
import { RegisterDeliveryDto } from './dto/register-delivery.dto.js';

@ApiTags('deliveries')
@ApiBearerAuth()
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveries: DeliveriesService) {}

  @Roles('ADMIN', 'CONCIERGE')
  @Post()
  register(@Body() dto: RegisterDeliveryDto, @CurrentUser() user: AuthUser) {
    return this.deliveries.register(dto, user);
  }

  @Get()
  findAll(@Query() query: ListDeliveriesQueryDto, @CurrentUser() user: AuthUser) {
    return this.deliveries.findAll({ ...query, unitId: scopeUnitId(user, query.unitId) });
  }

  @Roles('ADMIN', 'CONCIERGE')
  @Patch(':id/pickup')
  pickup(@Param('id', ParseUUIDPipe) id: string, @Body() dto: PickupDeliveryDto) {
    return this.deliveries.pickup(id, dto);
  }
}
