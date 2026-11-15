import { PartialType } from '@nestjs/swagger';
import { CreateGateDto } from './create-gate.dto.js';

export class UpdateGateDto extends PartialType(CreateGateDto) {}
