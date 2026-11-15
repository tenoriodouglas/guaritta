import { Inject, Injectable } from '@nestjs/common';
import { and, eq, ilike, type SQL } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../../database/database.constants.js';
import { residents } from '../../database/schema/index.js';

export type Resident = typeof residents.$inferSelect;
export type NewResident = typeof residents.$inferInsert;

@Injectable()
export class ResidentsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(data: NewResident): Promise<Resident> {
    const [resident] = await this.db.insert(residents).values(data).returning();
    return resident;
  }

  findAll(filter: { unitId?: string; search?: string; limit: number; offset: number }): Promise<Resident[]> {
    const where: SQL[] = [];
    if (filter.unitId) where.push(eq(residents.unitId, filter.unitId));
    if (filter.search) where.push(ilike(residents.name, `%${filter.search}%`));
    return this.db
      .select()
      .from(residents)
      .where(and(...where))
      .orderBy(residents.name)
      .limit(filter.limit)
      .offset(filter.offset);
  }

  async findById(id: string): Promise<Resident | undefined> {
    const [resident] = await this.db.select().from(residents).where(eq(residents.id, id));
    return resident;
  }

  async update(id: string, data: Partial<NewResident>): Promise<Resident | undefined> {
    const [resident] = await this.db.update(residents).set(data).where(eq(residents.id, id)).returning();
    return resident;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(residents)
      .where(eq(residents.id, id))
      .returning({ id: residents.id });
    return deleted.length > 0;
  }
}
