import { IsString, MaxLength, MinLength } from 'class-validator';

export class PickupDeliveryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  pickedUpBy: string;
}
