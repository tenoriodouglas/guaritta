import { Delivery } from './delivery.entity';

// Injection token to decouple services from the persistence implementation.
export const DELIVERY_REPOSITORY = Symbol('DELIVERY_REPOSITORY');

export interface DeliveryRepository {
  save(delivery: Delivery): Promise<Delivery>;
  findById(id: string): Promise<Delivery | null>;
  findByUnit(unit: string): Promise<Delivery[]>;
}
