import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

export class ListResidentsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  unitId?: string;

  /** Case-insensitive name search. */
  @IsOptional()
  @IsString()
  @MaxLength(60)
  search?: string;
}
