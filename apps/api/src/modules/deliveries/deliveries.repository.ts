import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, type SQL } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../../database/database.constants.js';
import { deliveries } from '../../database/schema/index.js';

export type Delivery = typeof deliveries.$inferSelect;
export type NewDelivery = typeof deliveries.$inferInsert;

@Injectable()
export class DeliveriesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(data: NewDelivery): Promise<Delivery> {
    const [delivery] = await this.db.insert(deliveries).values(data).returning();
    return delivery;
  }

  findAll(filter: {
    unitId?: string;
    status?: Delivery['status'];
    limit: number;
    offset: number;
  }): Promise<Delivery[]> {
    const where: SQL[] = [];
    if (filter.unitId) where.push(eq(deliveries.unitId, filter.unitId));
    if (filter.status) where.push(eq(deliveries.status, filter.status));
    return this.db
      .select()
      .from(deliveries)
      .where(and(...where))
      .orderBy(desc(deliveries.createdAt))
      .limit(filter.limit)
      .offset(filter.offset);
  }

  async findById(id: string): Promise<Delivery | undefined> {
    const [delivery] = await this.db.select().from(deliveries).where(eq(deliveries.id, id));
    return delivery;
  }

  /** Atomic pickup; returns undefined if already picked up or missing. */
  async markPickedUp(id: string, pickedUpBy: string): Promise<Delivery | undefined> {
    const [delivery] = await this.db
      .update(deliveries)
      .set({ status: 'PICKED_UP', pickedUpAt: new Date(), pickedUpBy })
      .where(and(eq(deliveries.id, id), eq(deliveries.status, 'RECEIVED')))
      .returning();
    return delivery;
  }
}
