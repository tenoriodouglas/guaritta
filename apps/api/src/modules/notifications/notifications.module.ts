import { Module } from '@nestjs/common';
import { NotificationListeners } from './notification.listeners.js';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsRepository } from './notifications.repository.js';
import { NotificationsService } from './notifications.service.js';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRepository, NotificationListeners],
})
export class NotificationsModule {}
