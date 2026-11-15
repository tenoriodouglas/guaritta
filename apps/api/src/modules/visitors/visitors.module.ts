import { Module } from '@nestjs/common';
import { VisitorsController } from './visitors.controller.js';
import { VisitorsRepository } from './visitors.repository.js';
import { VisitorsService } from './visitors.service.js';

@Module({
  controllers: [VisitorsController],
  providers: [VisitorsService, VisitorsRepository],
  exports: [VisitorsService, VisitorsRepository],
})
export class VisitorsModule {}
