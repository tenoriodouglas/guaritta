import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUnitDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  block?: string;

  @IsString()
  @MaxLength(20)
  number: string;

  @IsOptional()
  @IsInt()
  floor?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
