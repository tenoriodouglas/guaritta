import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class RegisterDeliveryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unit: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  carrier: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
