import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { hashPassword } from '../auth/password.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { PublicUser, UsersRepository } from './users.repository.js';

@Injectable()
export class UsersService {
  constructor(private readonly repository: UsersRepository) {}

  async create(dto: CreateUserDto): Promise<PublicUser> {
    if (dto.role === 'RESIDENT' && !dto.residentId) {
      throw new BadRequestException('residentId is required for RESIDENT users');
    }
    const { password, ...data } = dto;
    return this.repository.create({
      ...data,
      email: dto.email.toLowerCase(),
      passwordHash: await hashPassword(password),
    });
  }

  findAll(limit: number, offset: number): Promise<PublicUser[]> {
    return this.repository.findAll(limit, offset);
  }

  async update(id: string, dto: UpdateUserDto): Promise<PublicUser> {
    const { password, ...data } = dto;
    const user = await this.repository.update(id, {
      ...data,
      ...(password ? { passwordHash: await hashPassword(password) } : {}),
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }
}
