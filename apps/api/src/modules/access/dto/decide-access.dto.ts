import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DecideAccessDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}
