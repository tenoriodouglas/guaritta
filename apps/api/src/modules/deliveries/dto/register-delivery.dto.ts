import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class RegisterDeliveryDto {
  @IsUUID()
  unitId: string;

  @IsString()
  @MaxLength(60)
  carrier: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  trackingCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
