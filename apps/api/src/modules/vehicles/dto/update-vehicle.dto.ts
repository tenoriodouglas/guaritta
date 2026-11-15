import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateVehicleDto } from './create-vehicle.dto.js';

export class UpdateVehicleDto extends PartialType(OmitType(CreateVehicleDto, ['unitId', 'plate'] as const)) {}
