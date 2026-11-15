import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import type { UserRole } from '../../auth/auth-user.js';

const ROLES: UserRole[] = ['ADMIN', 'CONCIERGE', 'RESIDENT'];

export class CreateUserDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsIn(ROLES)
  role: UserRole;

  // Residents must be linked to a resident record (and therefore a unit).
  @ValidateIf((o: CreateUserDto) => o.role === 'RESIDENT')
  @IsUUID()
  @IsOptional()
  residentId?: string;
}
