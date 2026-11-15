import { Injectable, NotFoundException } from '@nestjs/common';
import { assertFound } from '../../common/utils/assert-found.js';
import { CreateResidentDto } from './dto/create-resident.dto.js';
import { ListResidentsQueryDto } from './dto/list-residents-query.dto.js';
import { UpdateResidentDto } from './dto/update-resident.dto.js';
import { Resident, ResidentsRepository } from './residents.repository.js';

@Injectable()
export class ResidentsService {
  constructor(private readonly repository: ResidentsRepository) {}

  create(dto: CreateResidentDto): Promise<Resident> {
    return this.repository.create(dto);
  }

  findAll(query: ListResidentsQueryDto): Promise<Resident[]> {
    return this.repository.findAll(query);
  }

  async findOne(id: string): Promise<Resident> {
    return assertFound(await this.repository.findById(id), 'Resident', id);
  }

  async update(id: string, dto: UpdateResidentDto): Promise<Resident> {
    return assertFound(await this.repository.update(id, dto), 'Resident', id);
  }

  async remove(id: string): Promise<void> {
    if (!(await this.repository.delete(id))) throw new NotFoundException(`Resident ${id} not found`);
  }
}
