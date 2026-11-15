import { Injectable, NotFoundException } from '@nestjs/common';
import { assertFound } from '../../common/utils/assert-found.js';
import { CreateUnitDto } from './dto/create-unit.dto.js';
import { ListUnitsQueryDto } from './dto/list-units-query.dto.js';
import { UpdateUnitDto } from './dto/update-unit.dto.js';
import { Unit, UnitsRepository } from './units.repository.js';

@Injectable()
export class UnitsService {
  constructor(private readonly repository: UnitsRepository) {}

  create(dto: CreateUnitDto): Promise<Unit> {
    return this.repository.create({ ...dto, block: dto.block?.toUpperCase() ?? '' });
  }

  findAll(query: ListUnitsQueryDto): Promise<Unit[]> {
    return this.repository.findAll({ ...query, block: query.block?.toUpperCase() });
  }

  async findOne(id: string) {
    return assertFound(await this.repository.findDetailed(id), 'Unit', id);
  }

  async update(id: string, dto: UpdateUnitDto): Promise<Unit> {
    const data = dto.block === undefined ? dto : { ...dto, block: dto.block.toUpperCase() };
    return assertFound(await this.repository.update(id, data), 'Unit', id);
  }

  async remove(id: string): Promise<void> {
    if (!(await this.repository.delete(id))) throw new NotFoundException(`Unit ${id} not found`);
  }
}
