import { Injectable } from '@nestjs/common';
import { Delivery } from '../domain/delivery.entity';
import { DeliveryRepository } from '../domain/delivery.repository';

@Injectable()
export class InMemoryDeliveryRepository implements DeliveryRepository {
  private readonly items = new Map<string, Delivery>();

  async save(delivery: Delivery): Promise<Delivery> {
    this.items.set(delivery.id, delivery);
    return delivery;
  }

  async findById(id: string): Promise<Delivery | null> {
    return this.items.get(id) ?? null;
  }

  async findByUnit(unit: string): Promise<Delivery[]> {
    return [...this.items.values()].filter((d) => d.unit === unit);
  }
}
