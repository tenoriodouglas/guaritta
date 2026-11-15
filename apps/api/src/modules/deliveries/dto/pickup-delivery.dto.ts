import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class PickupDeliveryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  pickedUpBy: string;
}
