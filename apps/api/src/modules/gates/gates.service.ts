import { Injectable, NotFoundException } from '@nestjs/common';
import { assertFound } from '../../common/utils/assert-found.js';
import { generateDeviceKey, hashDeviceKey } from './device-key.js';
import { CreateGateDto } from './dto/create-gate.dto.js';
import { UpdateGateDto } from './dto/update-gate.dto.js';
import { Gate, GatesRepository } from './gates.repository.js';

@Injectable()
export class GatesService {
  constructor(private readonly repository: GatesRepository) {}

  create(dto: CreateGateDto): Promise<Gate> {
    return this.repository.create(dto);
  }

  findAll(): Promise<Gate[]> {
    return this.repository.findAll();
  }

  async findOne(id: string): Promise<Gate> {
    return assertFound(await this.repository.findById(id), 'Gate', id);
  }

  async update(id: string, dto: UpdateGateDto): Promise<Gate> {
    return assertFound(await this.repository.update(id, dto), 'Gate', id);
  }

  async remove(id: string): Promise<void> {
    if (!(await this.repository.delete(id))) throw new NotFoundException(`Gate ${id} not found`);
  }

  /** Issues a new camera key, invalidating the previous one. Plain key is returned only once. */
  async rotateDeviceKey(id: string): Promise<{ deviceKey: string }> {
    const deviceKey = generateDeviceKey();
    assertFound(await this.repository.update(id, { deviceKeyHash: hashDeviceKey(deviceKey) }), 'Gate', id);
    return { deviceKey };
  }

  findByDeviceKey(key: string): Promise<Gate | undefined> {
    return this.repository.findByDeviceKeyHash(hashDeviceKey(key));
  }
}
