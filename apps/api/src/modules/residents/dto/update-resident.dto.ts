import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateResidentDto } from './create-resident.dto.js';

export class UpdateResidentDto extends PartialType(OmitType(CreateResidentDto, ['unitId'] as const)) {}
