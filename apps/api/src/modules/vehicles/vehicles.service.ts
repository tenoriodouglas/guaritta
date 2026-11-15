import { Injectable, NotFoundException } from '@nestjs/common';
import { assertFound } from '../../common/utils/assert-found.js';
import { normalizePlate, plateKey } from '../../common/utils/plate.js';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { ListVehiclesQueryDto } from './dto/list-vehicles-query.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';
import { Vehicle, VehiclesRepository } from './vehicles.repository.js';

@Injectable()
export class VehiclesService {
  constructor(private readonly repository: VehiclesRepository) {}

  create(dto: CreateVehicleDto): Promise<Vehicle> {
    return this.repository.create({
      ...dto,
      plate: normalizePlate(dto.plate),
      plateKey: plateKey(dto.plate),
    });
  }

  findAll(query: ListVehiclesQueryDto): Promise<Vehicle[]> {
    return this.repository.findAll(query);
  }

  async findOne(id: string): Promise<Vehicle> {
    return assertFound(await this.repository.findById(id), 'Vehicle', id);
  }

  /** Matches legacy and Mercosul versions of the same plate. */
  async findByPlate(plate: string): Promise<Vehicle> {
    return assertFound(await this.repository.findByPlateKey(plateKey(plate)), 'Vehicle with plate', plate);
  }

  async update(id: string, dto: UpdateVehicleDto | { status: Vehicle['status'] }): Promise<Vehicle> {
    return assertFound(await this.repository.update(id, dto), 'Vehicle', id);
  }

  async remove(id: string): Promise<void> {
    if (!(await this.repository.delete(id))) throw new NotFoundException(`Vehicle ${id} not found`);
  }
}
