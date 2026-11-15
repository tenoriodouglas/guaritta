import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { Delivery } from './domain/delivery.entity';
import { PickupDeliveryDto } from './dto/pickup-delivery.dto';
import { RegisterDeliveryDto } from './dto/register-delivery.dto';

@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly service: DeliveriesService) {}

  @Post()
  register(@Body() dto: RegisterDeliveryDto): Promise<Delivery> {
    return this.service.register(dto);
  }

  @Get()
  findByUnit(@Query('unit') unit: string): Promise<Delivery[]> {
    return this.service.findByUnit(unit);
  }

  @Patch(':id/pickup')
  pickup(@Param('id', ParseUUIDPipe) id: string, @Body() dto: PickupDeliveryDto): Promise<Delivery> {
    return this.service.pickup(id, dto);
  }
}
