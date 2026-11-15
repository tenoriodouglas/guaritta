import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { assertFound } from '../../common/utils/assert-found.js';
import { normalizePlate, plateKey } from '../../common/utils/plate.js';
import type { AuthUser } from '../auth/auth-user.js';
import { assertUnitAccess } from '../auth/unit-access.js';
import { AuthorizeVisitorDto } from './dto/authorize-visitor.dto.js';
import { ListVisitorsQueryDto } from './dto/list-visitors-query.dto.js';
import { type VisitAction, visitTransition } from './visit-lifecycle.js';
import { VISITOR_ARRIVED, VisitorArrivedEvent } from './visitor.events.js';
import { Visitor, VisitorsRepository } from './visitors.repository.js';

const DEFAULT_VALIDITY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class VisitorsService {
  constructor(
    private readonly repository: VisitorsRepository,
    private readonly events: EventEmitter2,
  ) {}

  authorize(dto: AuthorizeVisitorDto, user: AuthUser): Promise<Visitor> {
    const validFrom = dto.validFrom ?? new Date();
    const validUntil = dto.validUntil ?? new Date(validFrom.getTime() + DEFAULT_VALIDITY_MS);
    if (validUntil <= validFrom) throw new BadRequestException('validUntil must be after validFrom');

    return this.repository.create({
      ...dto,
      plate: dto.plate ? normalizePlate(dto.plate) : null,
      plateKey: dto.plate ? plateKey(dto.plate) : null,
      validFrom,
      validUntil,
      authorizedById: user.sub,
    });
  }

  findAll(query: ListVisitorsQueryDto): Promise<Visitor[]> {
    return this.repository.findAll(query);
  }

  async findOne(id: string): Promise<Visitor> {
    return assertFound(await this.repository.findById(id), 'Visitor', id);
  }

  async registerEntry(id: string): Promise<Visitor> {
    const visitor = await this.apply(id, 'enter', { enteredAt: new Date() });
    this.events.emit(VISITOR_ARRIVED, new VisitorArrivedEvent(visitor.id, visitor.unitId, visitor.name));
    return visitor;
  }

  registerExit(id: string): Promise<Visitor> {
    return this.apply(id, 'exit', { leftAt: new Date() });
  }

  async cancel(id: string, user: AuthUser): Promise<Visitor> {
    assertUnitAccess(user, (await this.findOne(id)).unitId);
    return this.apply(id, 'cancel', {});
  }

  private async apply(id: string, action: VisitAction, data: Partial<Visitor>): Promise<Visitor> {
    const { from, to } = visitTransition(action);
    const updated = await this.repository.transition(id, from, { ...data, status: to });
    if (updated) return updated;
    const current = await this.findOne(id);
    throw new ConflictException(`Cannot ${action}: visitor status is ${current.status}, expected ${from}`);
  }
}
