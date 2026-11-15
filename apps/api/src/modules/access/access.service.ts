import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { assertFound } from '../../common/utils/assert-found.js';
import { correctOcrPlate, isValidPlate, normalizePlate, plateKey } from '../../common/utils/plate.js';
import type { Env } from '../../config/env.js';
import { AlprService } from '../alpr/alpr.service.js';
import type { AuthUser } from '../auth/auth-user.js';
import { GateCommanderService } from '../gates/gate-commander.service.js';
import type { Gate } from '../gates/gates.repository.js';
import { GatesService } from '../gates/gates.service.js';
import { VehiclesRepository } from '../vehicles/vehicles.repository.js';
import { VisitorsRepository } from '../visitors/visitors.repository.js';
import { VisitorsService } from '../visitors/visitors.service.js';
import { ACCESS_DECIDED, ACCESS_REQUESTED, AccessEvent } from './access.events.js';
import { AccessRepository, type AccessRequest } from './access.repository.js';
import { type Decision, decideAccess } from './decision-engine.js';
import { ListAccessQueryDto } from './dto/list-access-query.dto.js';
import { ManualAccessDto } from './dto/manual-access.dto.js';
import { PlateReadDto } from './dto/plate-read.dto.js';

// Cameras emit several reads per pass; reads within this window reuse the pending request.
const DEDUP_WINDOW_MS = 30_000;

type Direction = 'IN' | 'OUT';

@Injectable()
export class AccessService {
  private readonly logger = new Logger(AccessService.name);
  private readonly ttlMs: number;
  private readonly minConfidence: number;

  constructor(
    private readonly repository: AccessRepository,
    private readonly alpr: AlprService,
    private readonly gates: GatesService,
    private readonly commander: GateCommanderService,
    private readonly vehicles: VehiclesRepository,
    private readonly visitorsRepository: VisitorsRepository,
    private readonly visitors: VisitorsService,
    private readonly events: EventEmitter2,
    config: ConfigService<Env, true>,
  ) {
    this.ttlMs = config.get('ACCESS_REQUEST_TTL_SECONDS', { infer: true }) * 1000;
    this.minConfidence = config.get('ALPR_MIN_CONFIDENCE', { infer: true });
  }

  /** Camera read -> identification -> pending request for operator release. */
  async handlePlateRead(gate: Gate, dto: PlateReadDto): Promise<AccessRequest> {
    const read = dto.plate
      ? { plate: correctOcrPlate(dto.plate), confidence: dto.confidence ?? 1 }
      : await this.alpr.readImage(Buffer.from(dto.imageBase64 ?? '', 'base64'));
    const direction = dto.direction ?? 'IN';

    if (!read || !isValidPlate(read.plate)) {
      return this.open(gate, direction, 'LPR', {
        plateRead: dto.plate ?? null,
        confidence: read?.confidence ?? null,
        snapshotUrl: dto.snapshotUrl,
        decision: { subject: 'UNKNOWN_VEHICLE', suggestion: 'REVIEW', reason: 'Plate could not be read' },
      });
    }

    const key = plateKey(read.plate);
    const duplicate = await this.repository.findRecentPending(
      gate.id,
      key,
      new Date(Date.now() - DEDUP_WINDOW_MS),
    );
    if (duplicate) return duplicate;

    const decision = await this.identify(key, direction, read.confidence);
    return this.open(gate, direction, 'LPR', {
      plateRead: normalizePlate(read.plate),
      plateKey: key,
      confidence: read.confidence,
      snapshotUrl: dto.snapshotUrl,
      decision,
    });
  }

  /** Operator-initiated release; recorded and executed through the same approval path. */
  async manualRelease(dto: ManualAccessDto, user: AuthUser): Promise<AccessRequest> {
    const gate = await this.gates.findOne(dto.gateId);
    const direction = dto.direction ?? 'IN';
    let decision: Decision = {
      subject: 'PERSON',
      suggestion: 'APPROVE',
      reason: 'Manual release',
      unitId: dto.unitId,
    };
    if (dto.visitorId) {
      const visitor = assertFound(
        await this.visitorsRepository.findById(dto.visitorId),
        'Visitor',
        dto.visitorId,
      );
      decision = {
        subject: 'VISITOR',
        suggestion: 'APPROVE',
        reason: 'Manual release',
        unitId: visitor.unitId,
        visitorId: visitor.id,
      };
    } else if (dto.plate) {
      decision = await this.identify(plateKey(dto.plate), direction, null);
    }

    const request = await this.open(gate, direction, 'MANUAL', {
      plateRead: dto.plate ? normalizePlate(dto.plate) : null,
      plateKey: dto.plate ? plateKey(dto.plate) : null,
      confidence: null,
      decision,
    });
    return this.approve(request.id, user, dto.note);
  }

  /** Human release: claims the request atomically, then opens the gate. */
  async approve(id: string, user: AuthUser, note?: string): Promise<AccessRequest> {
    const request = await this.claim(id, 'APPROVED', user, note);
    const gate = await this.gates.findOne(request.gateId);
    try {
      await this.commander.open(gate, request.id);
    } catch (error) {
      await this.repository.revertToPending(request.id);
      throw error;
    }
    await this.syncVisitor(request);
    this.events.emit(ACCESS_DECIDED, new AccessEvent(request));
    return request;
  }

  async deny(id: string, user: AuthUser, note?: string): Promise<AccessRequest> {
    const request = await this.claim(id, 'DENIED', user, note);
    this.events.emit(ACCESS_DECIDED, new AccessEvent(request));
    return request;
  }

  findAll(query: ListAccessQueryDto): Promise<AccessRequest[]> {
    return this.repository.findAll({ ...query, plateKey: query.plate ? plateKey(query.plate) : undefined });
  }

  async findOne(id: string): Promise<AccessRequest> {
    return assertFound(await this.repository.findById(id), 'Access request', id);
  }

  async expireOverdue(): Promise<number> {
    const expired = await this.repository.expireOverdue(new Date());
    expired.forEach((request) => this.events.emit(ACCESS_DECIDED, new AccessEvent(request)));
    return expired.length;
  }

  async summary(since: Date) {
    const rows = await this.repository.summary(since);
    const byStatus: Record<string, number> = {};
    const bySubject: Record<string, number> = {};
    for (const row of rows) {
      byStatus[row.status] = (byStatus[row.status] ?? 0) + row.total;
      bySubject[row.subject] = (bySubject[row.subject] ?? 0) + row.total;
    }
    return { since, total: rows.reduce((sum, r) => sum + r.total, 0), byStatus, bySubject };
  }

  private async identify(key: string, direction: Direction, confidence: number | null): Promise<Decision> {
    const vehicle = await this.vehicles.findByPlateKey(key);
    const visitor = vehicle
      ? undefined
      : direction === 'IN'
        ? await this.visitorsRepository.findAuthorizedByPlateKey(key, new Date())
        : await this.visitorsRepository.findInsideByPlateKey(key);
    return decideAccess({ direction, confidence, minConfidence: this.minConfidence, vehicle, visitor });
  }

  private async open(
    gate: Gate,
    direction: Direction,
    source: 'LPR' | 'MANUAL',
    data: {
      plateRead: string | null;
      plateKey?: string | null;
      confidence: number | null;
      snapshotUrl?: string;
      decision: Decision;
    },
  ): Promise<AccessRequest> {
    const { decision, ...read } = data;
    const request = await this.repository.create({
      ...read,
      ...decision,
      gateId: gate.id,
      direction,
      source,
      expiresAt: new Date(Date.now() + this.ttlMs),
    });
    if (source === 'LPR') this.events.emit(ACCESS_REQUESTED, new AccessEvent(request));
    return request;
  }

  private async claim(
    id: string,
    status: 'APPROVED' | 'DENIED',
    user: AuthUser,
    note?: string,
  ): Promise<AccessRequest> {
    const request = await this.repository.decide(id, status, user.sub, note);
    if (request) return request;
    const current = await this.findOne(id);
    throw new ConflictException(
      `Access request is ${current.status}${current.status === 'PENDING' ? ' but expired' : ''}`,
    );
  }

  /** Keeps the visitor lifecycle in sync with physical passage. */
  private async syncVisitor(request: AccessRequest): Promise<void> {
    if (!request.visitorId) return;
    try {
      if (request.direction === 'IN') await this.visitors.registerEntry(request.visitorId);
      else await this.visitors.registerExit(request.visitorId);
    } catch (error) {
      // Lifecycle mismatch (e.g. re-entry) must not block physical access.
      this.logger.warn(`Visitor ${request.visitorId} not updated: ${(error as Error).message}`);
    }
  }
}
