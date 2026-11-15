import { Module } from '@nestjs/common';
import { ResidentsController } from './residents.controller.js';
import { ResidentsRepository } from './residents.repository.js';
import { ResidentsService } from './residents.service.js';

@Module({
  controllers: [ResidentsController],
  providers: [ResidentsService, ResidentsRepository],
})
export class ResidentsModule {}
