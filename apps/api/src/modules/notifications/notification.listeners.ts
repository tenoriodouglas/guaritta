import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ACCESS_DECIDED, AccessEvent } from '../access/access.events.js';
import { DELIVERY_RECEIVED, DeliveryReceivedEvent } from '../deliveries/delivery.events.js';
import { VISITOR_ARRIVED, VisitorArrivedEvent } from '../visitors/visitor.events.js';
import { NotificationsService } from './notifications.service.js';

/** Translates domain events into resident-facing notifications (pt-BR content). */
@Injectable()
export class NotificationListeners {
  private readonly logger = new Logger(NotificationListeners.name);

  constructor(private readonly notifications: NotificationsService) {}

  @OnEvent(DELIVERY_RECEIVED, { async: true })
  async onDelivery(event: DeliveryReceivedEvent): Promise<void> {
    await this.safely(() =>
      this.notifications.notify({
        unitId: event.unitId,
        type: 'DELIVERY_RECEIVED',
        title: 'Encomenda recebida',
        body: `Uma encomenda (${event.carrier}) chegou na portaria.`,
      }),
    );
  }

  @OnEvent(VISITOR_ARRIVED, { async: true })
  async onVisitor(event: VisitorArrivedEvent): Promise<void> {
    await this.safely(() =>
      this.notifications.notify({
        unitId: event.unitId,
        type: 'VISITOR_ARRIVED',
        title: 'Visitante chegou',
        body: `${event.name} entrou no condomínio.`,
      }),
    );
  }

  @OnEvent(ACCESS_DECIDED, { async: true })
  async onAccess({ request }: AccessEvent): Promise<void> {
    if (!request.unitId || !request.plateRead) return;
    if (
      request.status === 'APPROVED' &&
      request.subject === 'RESIDENT_VEHICLE' &&
      request.direction === 'IN'
    ) {
      await this.safely(() =>
        this.notifications.notify({
          unitId: request.unitId!,
          type: 'VEHICLE_ENTERED',
          title: 'Veículo entrou',
          body: `O veículo ${request.plateRead} entrou no condomínio.`,
        }),
      );
    } else if (request.status === 'DENIED') {
      await this.safely(() =>
        this.notifications.notify({
          unitId: request.unitId!,
          type: 'ACCESS_DENIED',
          title: 'Acesso negado',
          body: `A portaria negou o acesso do veículo ${request.plateRead}.`,
        }),
      );
    }
  }

  // Notification failures must never break the originating flow.
  private async safely(action: () => Promise<unknown>): Promise<void> {
    try {
      await action();
    } catch (error) {
      this.logger.error(`Notification failed: ${(error as Error).message}`);
    }
  }
}
