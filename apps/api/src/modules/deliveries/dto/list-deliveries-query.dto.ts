import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

export class ListDeliveriesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  unitId?: string;

  @IsOptional()
  @IsIn(['RECEIVED', 'PICKED_UP'])
  status?: 'RECEIVED' | 'PICKED_UP';
}
