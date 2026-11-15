import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { IsPlate } from '../../../common/validators/is-plate.validator.js';

export class CreateVehicleDto {
  @IsUUID()
  unitId: string;

  @IsOptional()
  @IsUUID()
  residentId?: string;

  @IsPlate()
  plate: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  brand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  model?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  color?: string;
}
