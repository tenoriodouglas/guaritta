import {
  IsBase64,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

/** Payload sent by a gate camera. Either `plate` (on-board LPR) or `imageBase64` is required. */
export class PlateReadDto {
  @ValidateIf((o: PlateReadDto) => !o.imageBase64)
  @IsString()
  @MaxLength(10)
  plate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence?: number;

  @ValidateIf((o: PlateReadDto) => !o.plate)
  @IsBase64()
  imageBase64?: string;

  @IsOptional()
  @IsIn(['IN', 'OUT'])
  direction?: 'IN' | 'OUT';

  @IsOptional()
  @IsUrl()
  snapshotUrl?: string;
}
