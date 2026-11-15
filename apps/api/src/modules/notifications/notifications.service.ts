import { Injectable, MessageEvent, OnModuleDestroy } from '@nestjs/common';
import { filter, map, Observable, Subject } from 'rxjs';
import { assertFound } from '../../common/utils/assert-found.js';
import { NewNotification, Notification, NotificationsRepository } from './notifications.repository.js';

@Injectable()
export class NotificationsService implements OnModuleDestroy {
  private readonly stream = new Subject<Notification>();

  constructor(private readonly repository: NotificationsRepository) {}

  async notify(data: NewNotification): Promise<Notification> {
    const notification = await this.repository.create(data);
    this.stream.next(notification);
    return notification;
  }

  /** Live notifications for a single unit (resident app). */
  streamForUnit(unitId: string): Observable<MessageEvent> {
    return this.stream.pipe(
      filter((n) => n.unitId === unitId),
      map((n) => ({ type: 'notification', data: n })),
    );
  }

  findByUnit(unitId: string, unreadOnly: boolean, limit: number, offset: number): Promise<Notification[]> {
    return this.repository.findByUnit({ unitId, unreadOnly, limit, offset });
  }

  async markRead(id: string, unitId: string): Promise<Notification> {
    return assertFound(await this.repository.markRead(id, unitId), 'Notification', id);
  }

  async markAllRead(unitId: string): Promise<{ updated: number }> {
    return { updated: await this.repository.markAllRead(unitId) };
  }

  onModuleDestroy(): void {
    this.stream.complete();
  }
}
