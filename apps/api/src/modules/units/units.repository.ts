import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, type SQL } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../../database/database.constants.js';
import { residents, units, vehicles } from '../../database/schema/index.js';

export type Unit = typeof units.$inferSelect;
export type NewUnit = typeof units.$inferInsert;

@Injectable()
export class UnitsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(data: NewUnit): Promise<Unit> {
    const [unit] = await this.db.insert(units).values(data).returning();
    return unit;
  }

  findAll(filter: { block?: string; limit: number; offset: number }): Promise<Unit[]> {
    const where: SQL[] = [];
    if (filter.block !== undefined) where.push(eq(units.block, filter.block));
    return this.db
      .select()
      .from(units)
      .where(and(...where))
      .orderBy(asc(units.block), asc(units.number))
      .limit(filter.limit)
      .offset(filter.offset);
  }

  async findById(id: string): Promise<Unit | undefined> {
    const [unit] = await this.db.select().from(units).where(eq(units.id, id));
    return unit;
  }

  /** Unit with its residents and vehicles, for the detail view. */
  async findDetailed(id: string) {
    const unit = await this.findById(id);
    if (!unit) return undefined;
    const [unitResidents, unitVehicles] = await Promise.all([
      this.db.select().from(residents).where(eq(residents.unitId, id)).orderBy(residents.name),
      this.db.select().from(vehicles).where(eq(vehicles.unitId, id)).orderBy(vehicles.plate),
    ]);
    return { ...unit, residents: unitResidents, vehicles: unitVehicles };
  }

  async update(id: string, data: Partial<NewUnit>): Promise<Unit | undefined> {
    const [unit] = await this.db.update(units).set(data).where(eq(units.id, id)).returning();
    return unit;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db.delete(units).where(eq(units.id, id)).returning({ id: units.id });
    return deleted.length > 0;
  }
}
