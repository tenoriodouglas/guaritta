import { IsIn } from 'class-validator';

export class SetVehicleStatusDto {
  @IsIn(['ACTIVE', 'BLOCKED'])
  status: 'ACTIVE' | 'BLOCKED';
}
