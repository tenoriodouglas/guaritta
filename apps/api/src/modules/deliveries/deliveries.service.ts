import { ConflictException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { assertFound } from '../../common/utils/assert-found.js';
import type { AuthUser } from '../auth/auth-user.js';
import { Delivery, DeliveriesRepository } from './deliveries.repository.js';
import { DELIVERY_RECEIVED, DeliveryReceivedEvent } from './delivery.events.js';
import { ListDeliveriesQueryDto } from './dto/list-deliveries-query.dto.js';
import { PickupDeliveryDto } from './dto/pickup-delivery.dto.js';
import { RegisterDeliveryDto } from './dto/register-delivery.dto.js';

@Injectable()
export class DeliveriesService {
  constructor(
    private readonly repository: DeliveriesRepository,
    private readonly events: EventEmitter2,
  ) {}

  async register(dto: RegisterDeliveryDto, user: AuthUser): Promise<Delivery> {
    const delivery = await this.repository.create({ ...dto, receivedById: user.sub });
    this.events.emit(
      DELIVERY_RECEIVED,
      new DeliveryReceivedEvent(delivery.id, delivery.unitId, delivery.carrier),
    );
    return delivery;
  }

  findAll(query: ListDeliveriesQueryDto): Promise<Delivery[]> {
    return this.repository.findAll(query);
  }

  async pickup(id: string, dto: PickupDeliveryDto): Promise<Delivery> {
    const delivery = await this.repository.markPickedUp(id, dto.pickedUpBy);
    if (delivery) return delivery;
    assertFound(await this.repository.findById(id), 'Delivery', id);
    throw new ConflictException(`Delivery ${id} already picked up`);
  }
}
