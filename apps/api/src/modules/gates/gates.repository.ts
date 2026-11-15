import { Inject, Injectable } from '@nestjs/common';
import { eq, getTableColumns } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../../database/database.constants.js';
import { gates } from '../../database/schema/index.js';

export type Gate = Omit<typeof gates.$inferSelect, 'deviceKeyHash'>;
export type NewGate = typeof gates.$inferInsert;

// Never expose the device key hash in API responses.
const { deviceKeyHash: _omit, ...publicColumns } = getTableColumns(gates);

@Injectable()
export class GatesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(data: NewGate): Promise<Gate> {
    const [gate] = await this.db.insert(gates).values(data).returning(publicColumns);
    return gate;
  }

  findAll(): Promise<Gate[]> {
    return this.db.select(publicColumns).from(gates).orderBy(gates.name);
  }

  async findById(id: string): Promise<Gate | undefined> {
    const [gate] = await this.db.select(publicColumns).from(gates).where(eq(gates.id, id));
    return gate;
  }

  async findByDeviceKeyHash(hash: string): Promise<Gate | undefined> {
    const [gate] = await this.db.select(publicColumns).from(gates).where(eq(gates.deviceKeyHash, hash));
    return gate;
  }

  async update(id: string, data: Partial<NewGate>): Promise<Gate | undefined> {
    const [gate] = await this.db.update(gates).set(data).where(eq(gates.id, id)).returning(publicColumns);
    return gate;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.db.delete(gates).where(eq(gates.id, id)).returning({ id: gates.id });
    return deleted.length > 0;
  }
}
