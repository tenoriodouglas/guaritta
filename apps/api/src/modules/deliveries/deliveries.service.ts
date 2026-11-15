import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { generateId } from '../../common/id';
import { Delivery, DeliveryStatus } from './domain/delivery.entity';
import { DELIVERY_REPOSITORY, DeliveryRepository } from './domain/delivery.repository';
import { PickupDeliveryDto } from './dto/pickup-delivery.dto';
import { RegisterDeliveryDto } from './dto/register-delivery.dto';

@Injectable()
export class DeliveriesService {
  constructor(@Inject(DELIVERY_REPOSITORY) private readonly repository: DeliveryRepository) {}

  register(dto: RegisterDeliveryDto): Promise<Delivery> {
    return this.repository.save({
      id: generateId(),
      ...dto,
      status: DeliveryStatus.RECEIVED,
      receivedAt: new Date(),
    });
  }

  findByUnit(unit: string): Promise<Delivery[]> {
    return this.repository.findByUnit(unit);
  }

  async pickup(id: string, dto: PickupDeliveryDto): Promise<Delivery> {
    const delivery = await this.repository.findById(id);
    if (!delivery) throw new NotFoundException(`Delivery ${id} not found`);
    if (delivery.status === DeliveryStatus.PICKED_UP) {
      throw new ConflictException(`Delivery ${id} already picked up`);
    }
    return this.repository.save({
      ...delivery,
      status: DeliveryStatus.PICKED_UP,
      pickedUpAt: new Date(),
      pickedUpBy: dto.pickedUpBy,
    });
  }
}
