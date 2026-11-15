import { Controller, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query, Sse } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto.js';
import { NotificationsService } from './notifications.service.js';

/** Resident inbox; RESIDENT tokens always carry a unitId. */
@ApiTags('notifications')
@ApiBearerAuth()
@Roles('RESIDENT')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  findAll(@Query() { unreadOnly, limit, offset }: ListNotificationsQueryDto, @CurrentUser() user: AuthUser) {
    return this.notifications.findByUnit(user.unitId!, unreadOnly, limit, offset);
  }

  @Sse('stream')
  stream(@CurrentUser() user: AuthUser) {
    return this.notifications.streamForUnit(user.unitId!);
  }

  @Patch(':id/read')
  markRead(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.notifications.markRead(id, user.unitId!);
  }

  @Post('read-all')
  @HttpCode(200)
  markAllRead(@CurrentUser() user: AuthUser) {
    return this.notifications.markAllRead(user.unitId!);
  }
}
