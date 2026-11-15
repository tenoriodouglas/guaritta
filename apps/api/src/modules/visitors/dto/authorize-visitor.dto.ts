import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { IsPlate } from '../../../common/validators/is-plate.validator.js';

export class AuthorizeVisitorDto {
  @IsUUID()
  unitId: string;

  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  document?: string;

  /** Enables automatic recognition at the vehicle gate. */
  @IsOptional()
  @IsPlate()
  plate?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  validFrom?: Date;

  /** Defaults to 24h after validFrom. */
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  validUntil?: Date;
}
