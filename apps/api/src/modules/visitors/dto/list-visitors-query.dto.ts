import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import type { VisitStatus } from '../visit-lifecycle.js';

export class ListVisitorsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  unitId?: string;

  @IsOptional()
  @IsIn(['AUTHORIZED', 'INSIDE', 'LEFT', 'CANCELLED'])
  status?: VisitStatus;
}
