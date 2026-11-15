import { Inject, Injectable } from '@nestjs/common';
import { and, eq, type SQL } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../../database/database.constants.js';
import { vehicles } from '../../database/schema/index.js';

export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;

@Injectable()
export class VehiclesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(data: NewVehicle): Promise<Vehicle> {
    const [vehicle] = await this.db.insert(vehicles).values(data).returning();
    return vehicle;
  }

  findAll(filter: { unitId?: string; limit: number; offset: number }): Promise<Vehicle[]> {
    const where: SQL[] = [];
    if (filter.unitId) where.push(eq(vehicles.unitId, filter.unitId));
    return this.db
      .select()
      .from(vehicles)
      .where(and(...where))
      .orderBy(vehicles.plate)
      .limit(filter.limit)
      .offset(filter.offset);
  }

  async findById(id: string): Promise<Vehicle | undefined> {
    const [vehicle] = await this.db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }

  async findByPlateKey(plateKey: string): Promise<Vehicle | undefined> {
    const [vehicle] = await this.db.select().from(vehicles).where(eq(vehicles.plateKey, plateKey));
    return vehicle;
  }

  async update(id: string, data: Partial<NewVehicle>): Promise<Vehicle | undefined> {
    const [vehicle] = await this.db.update(vehicles).set(data).where(eq(vehicles.id, id)).returning();
    return vehicle;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db.delete(vehicles).where(eq(vehicles.id, id)).returning({ id: vehicles.id });
    return deleted.length > 0;
  }
}
