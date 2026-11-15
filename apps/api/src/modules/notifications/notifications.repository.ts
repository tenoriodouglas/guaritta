import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, isNull, type SQL } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../../database/database.constants.js';
import { notifications } from '../../database/schema/index.js';

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

@Injectable()
export class NotificationsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(data: NewNotification): Promise<Notification> {
    const [notification] = await this.db.insert(notifications).values(data).returning();
    return notification;
  }

  findByUnit(filter: {
    unitId: string;
    unreadOnly?: boolean;
    limit: number;
    offset: number;
  }): Promise<Notification[]> {
    const where: SQL[] = [eq(notifications.unitId, filter.unitId)];
    if (filter.unreadOnly) where.push(isNull(notifications.readAt));
    return this.db
      .select()
      .from(notifications)
      .where(and(...where))
      .orderBy(desc(notifications.createdAt))
      .limit(filter.limit)
      .offset(filter.offset);
  }

  async markRead(id: string, unitId: string): Promise<Notification | undefined> {
    const [notification] = await this.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.unitId, unitId)))
      .returning();
    return notification;
  }

  async markAllRead(unitId: string): Promise<number> {
    const updated = await this.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.unitId, unitId), isNull(notifications.readAt)))
      .returning({ id: notifications.id });
    return updated.length;
  }
}
