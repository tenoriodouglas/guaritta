import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class SummaryQueryDto {
  /** Defaults to the start of the current day. */
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  since?: Date;
}
