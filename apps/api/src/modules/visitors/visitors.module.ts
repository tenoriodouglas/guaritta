import { Module } from '@nestjs/common';
import { VISITOR_REPOSITORY } from './domain/visitor.repository';
import { InMemoryVisitorRepository } from './infra/in-memory-visitor.repository';
import { VisitorsController } from './visitors.controller';
import { VisitorsService } from './visitors.service';

@Module({
  controllers: [VisitorsController],
  providers: [VisitorsService, { provide: VISITOR_REPOSITORY, useClass: InMemoryVisitorRepository }],
})
export class VisitorsModule {}
