import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { IsPlate } from '../../../common/validators/is-plate.validator.js';

/** Operator-initiated release (intercom, pedestrian, camera failure). */
export class ManualAccessDto {
  @IsUUID()
  gateId: string;

  @IsOptional()
  @IsIn(['IN', 'OUT'])
  direction?: 'IN' | 'OUT';

  @IsOptional()
  @IsPlate()
  plate?: string;

  @IsOptional()
  @IsUUID()
  visitorId?: string;

  @IsOptional()
  @IsUUID()
  unitId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}
