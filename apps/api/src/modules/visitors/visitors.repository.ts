import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, gte, lte, type SQL } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../../database/database.constants.js';
import { visitors } from '../../database/schema/index.js';
import type { VisitStatus } from './visit-lifecycle.js';

export type Visitor = typeof visitors.$inferSelect;
export type NewVisitor = typeof visitors.$inferInsert;

@Injectable()
export class VisitorsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(data: NewVisitor): Promise<Visitor> {
    const [visitor] = await this.db.insert(visitors).values(data).returning();
    return visitor;
  }

  findAll(filter: {
    unitId?: string;
    status?: VisitStatus;
    limit: number;
    offset: number;
  }): Promise<Visitor[]> {
    const where: SQL[] = [];
    if (filter.unitId) where.push(eq(visitors.unitId, filter.unitId));
    if (filter.status) where.push(eq(visitors.status, filter.status));
    return this.db
      .select()
      .from(visitors)
      .where(and(...where))
      .orderBy(desc(visitors.createdAt))
      .limit(filter.limit)
      .offset(filter.offset);
  }

  async findById(id: string): Promise<Visitor | undefined> {
    const [visitor] = await this.db.select().from(visitors).where(eq(visitors.id, id));
    return visitor;
  }

  /** Authorized visitor whose plate matches and whose window covers `at`. */
  async findAuthorizedByPlateKey(plateKey: string, at: Date): Promise<Visitor | undefined> {
    const [visitor] = await this.db
      .select()
      .from(visitors)
      .where(
        and(
          eq(visitors.plateKey, plateKey),
          eq(visitors.status, 'AUTHORIZED'),
          lte(visitors.validFrom, at),
          gte(visitors.validUntil, at),
        ),
      )
      .orderBy(desc(visitors.createdAt))
      .limit(1);
    return visitor;
  }

  /** Visitor currently inside with the given plate (exit matching). */
  async findInsideByPlateKey(plateKey: string): Promise<Visitor | undefined> {
    const [visitor] = await this.db
      .select()
      .from(visitors)
      .where(and(eq(visitors.plateKey, plateKey), eq(visitors.status, 'INSIDE')))
      .orderBy(desc(visitors.enteredAt))
      .limit(1);
    return visitor;
  }

  /** Atomic status change; returns undefined if the current status no longer matches. */
  async transition(
    id: string,
    from: VisitStatus,
    data: Partial<NewVisitor> & { status: VisitStatus },
  ): Promise<Visitor | undefined> {
    const [visitor] = await this.db
      .update(visitors)
      .set(data)
      .where(and(eq(visitors.id, id), eq(visitors.status, from)))
      .returning();
    return visitor;
  }
}
