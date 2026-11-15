import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { assertUnitAccess, scopeUnitId } from '../auth/unit-access.js';
import { AuthorizeVisitorDto } from './dto/authorize-visitor.dto.js';
import { ListVisitorsQueryDto } from './dto/list-visitors-query.dto.js';
import { VisitorsService } from './visitors.service.js';

@ApiTags('visitors')
@ApiBearerAuth()
@Controller('visitors')
export class VisitorsController {
  constructor(private readonly visitors: VisitorsService) {}

  @Post()
  authorize(@Body() dto: AuthorizeVisitorDto, @CurrentUser() user: AuthUser) {
    assertUnitAccess(user, dto.unitId);
    return this.visitors.authorize(dto, user);
  }

  @Get()
  findAll(@Query() query: ListVisitorsQueryDto, @CurrentUser() user: AuthUser) {
    return this.visitors.findAll({ ...query, unitId: scopeUnitId(user, query.unitId) });
  }

  @Roles('ADMIN', 'CONCIERGE')
  @Patch(':id/entry')
  registerEntry(@Param('id', ParseUUIDPipe) id: string) {
    return this.visitors.registerEntry(id);
  }

  @Roles('ADMIN', 'CONCIERGE')
  @Patch(':id/exit')
  registerExit(@Param('id', ParseUUIDPipe) id: string) {
    return this.visitors.registerExit(id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.visitors.cancel(id, user);
  }
}
