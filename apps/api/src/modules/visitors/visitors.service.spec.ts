import { ConflictException } from '@nestjs/common';
import { VisitStatus } from './domain/visitor.entity';
import { InMemoryVisitorRepository } from './infra/in-memory-visitor.repository';
import { VisitorsService } from './visitors.service';

describe('VisitorsService', () => {
  let service: VisitorsService;

  beforeEach(() => {
    service = new VisitorsService(new InMemoryVisitorRepository());
  });

  it('follows the full visit lifecycle', async () => {
    const visitor = await service.authorize({ name: 'Ana', document: '123', unit: 'A-101' });
    expect((await service.registerEntry(visitor.id)).status).toBe(VisitStatus.INSIDE);
    expect((await service.registerExit(visitor.id)).status).toBe(VisitStatus.LEFT);
  });

  it('rejects exit before entry', async () => {
    const visitor = await service.authorize({ name: 'Ana', document: '123', unit: 'A-101' });
    await expect(service.registerExit(visitor.id)).rejects.toBeInstanceOf(ConflictException);
  });
});
