import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { IsPlate } from '../../../common/validators/is-plate.validator.js';

export type AccessStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'EXPIRED';

export class ListAccessQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['PENDING', 'APPROVED', 'DENIED', 'EXPIRED'])
  status?: AccessStatus;

  @IsOptional()
  @IsUUID()
  gateId?: string;

  @IsOptional()
  @IsUUID()
  unitId?: string;

  @IsOptional()
  @IsPlate()
  plate?: string;
}
