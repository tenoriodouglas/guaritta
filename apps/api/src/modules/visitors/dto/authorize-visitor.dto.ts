import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AuthorizeVisitorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  document: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unit: string;
}
