import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

export class ListVehiclesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  unitId?: string;
}
