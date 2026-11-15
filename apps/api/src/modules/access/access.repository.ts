import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, gt, gte, lte, type SQL } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../../database/database.constants.js';
import { accessRequests } from '../../database/schema/index.js';
import type { AccessStatus } from './dto/list-access-query.dto.js';

export type AccessRequest = typeof accessRequests.$inferSelect;
export type NewAccessRequest = typeof accessRequests.$inferInsert;

@Injectable()
export class AccessRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(data: NewAccessRequest): Promise<AccessRequest> {
    const [request] = await this.db.insert(accessRequests).values(data).returning();
    return request;
  }

  findAll(filter: {
    status?: AccessStatus;
    gateId?: string;
    unitId?: string;
    plateKey?: string;
    limit: number;
    offset: number;
  }): Promise<AccessRequest[]> {
    const where: SQL[] = [];
    if (filter.status) where.push(eq(accessRequests.status, filter.status));
    if (filter.gateId) where.push(eq(accessRequests.gateId, filter.gateId));
    if (filter.unitId) where.push(eq(accessRequests.unitId, filter.unitId));
    if (filter.plateKey) where.push(eq(accessRequests.plateKey, filter.plateKey));
    return this.db
      .select()
      .from(accessRequests)
      .where(and(...where))
      .orderBy(desc(accessRequests.createdAt))
      .limit(filter.limit)
      .offset(filter.offset);
  }

  async findById(id: string): Promise<AccessRequest | undefined> {
    const [request] = await this.db.select().from(accessRequests).where(eq(accessRequests.id, id));
    return request;
  }

  /** Pending request for the same plate at the same gate, used to absorb camera read bursts. */
  async findRecentPending(gateId: string, plateKey: string, since: Date): Promise<AccessRequest | undefined> {
    const [request] = await this.db
      .select()
      .from(accessRequests)
      .where(
        and(
          eq(accessRequests.gateId, gateId),
          eq(accessRequests.plateKey, plateKey),
          eq(accessRequests.status, 'PENDING'),
          gte(accessRequests.createdAt, since),
        ),
      )
      .limit(1);
    return request;
  }

  /** Atomically resolves a non-expired pending request; undefined if already handled. */
  async decide(
    id: string,
    status: 'APPROVED' | 'DENIED',
    decidedById: string,
    note?: string,
  ): Promise<AccessRequest | undefined> {
    const [request] = await this.db
      .update(accessRequests)
      .set({ status, decidedById, decidedAt: new Date(), decisionNote: note })
      .where(
        and(
          eq(accessRequests.id, id),
          eq(accessRequests.status, 'PENDING'),
          gt(accessRequests.expiresAt, new Date()),
        ),
      )
      .returning();
    return request;
  }

  /** Rolls back an approval when the gate could not be opened. */
  async revertToPending(id: string): Promise<void> {
    await this.db
      .update(accessRequests)
      .set({ status: 'PENDING', decidedById: null, decidedAt: null, decisionNote: null })
      .where(eq(accessRequests.id, id));
  }

  expireOverdue(now: Date): Promise<AccessRequest[]> {
    return this.db
      .update(accessRequests)
      .set({ status: 'EXPIRED' })
      .where(and(eq(accessRequests.status, 'PENDING'), lte(accessRequests.expiresAt, now)))
      .returning();
  }

  /** Request counts grouped by status and subject since a given instant. */
  summary(since: Date) {
    return this.db
      .select({ status: accessRequests.status, subject: accessRequests.subject, total: count() })
      .from(accessRequests)
      .where(gte(accessRequests.createdAt, since))
      .groupBy(accessRequests.status, accessRequests.subject);
  }
}
