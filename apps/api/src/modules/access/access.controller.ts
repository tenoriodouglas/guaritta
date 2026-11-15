import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, Query, Sse } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { scopeUnitId } from '../auth/unit-access.js';
import { AccessStreamService } from './access-stream.service.js';
import { AccessService } from './access.service.js';
import { DecideAccessDto } from './dto/decide-access.dto.js';
import { ListAccessQueryDto } from './dto/list-access-query.dto.js';
import { ManualAccessDto } from './dto/manual-access.dto.js';
import { SummaryQueryDto } from './dto/summary-query.dto.js';

@ApiTags('access')
@ApiBearerAuth()
@Controller('access')
export class AccessController {
  constructor(
    private readonly access: AccessService,
    private readonly stream: AccessStreamService,
  ) {}

  /** Real-time feed for the concierge console (access.requested / access.decided). */
  @Roles('ADMIN', 'CONCIERGE')
  @Sse('stream')
  events() {
    return this.stream.events;
  }

  /** Residents see their own unit's access history. */
  @Get('requests')
  findAll(@Query() query: ListAccessQueryDto, @CurrentUser() user: AuthUser) {
    return this.access.findAll({ ...query, unitId: scopeUnitId(user, query.unitId) });
  }

  @Roles('ADMIN', 'CONCIERGE')
  @Get('requests/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.access.findOne(id);
  }

  @Roles('ADMIN', 'CONCIERGE')
  @Post('requests/:id/approve')
  @HttpCode(200)
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DecideAccessDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.access.approve(id, user, dto.note);
  }

  @Roles('ADMIN', 'CONCIERGE')
  @Post('requests/:id/deny')
  @HttpCode(200)
  deny(@Param('id', ParseUUIDPipe) id: string, @Body() dto: DecideAccessDto, @CurrentUser() user: AuthUser) {
    return this.access.deny(id, user, dto.note);
  }

  @Roles('ADMIN', 'CONCIERGE')
  @Post('manual')
  manual(@Body() dto: ManualAccessDto, @CurrentUser() user: AuthUser) {
    return this.access.manualRelease(dto, user);
  }

  @Roles('ADMIN', 'CONCIERGE')
  @Get('summary')
  summary(@Query() { since }: SummaryQueryDto) {
    const start = since ?? new Date(new Date().setHours(0, 0, 0, 0));
    return this.access.summary(start);
  }
}
