import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { generateId } from '../../common/id';
import { VisitStatus, Visitor } from './domain/visitor.entity';
import { VISITOR_REPOSITORY, VisitorRepository } from './domain/visitor.repository';
import { AuthorizeVisitorDto } from './dto/authorize-visitor.dto';

@Injectable()
export class VisitorsService {
  constructor(@Inject(VISITOR_REPOSITORY) private readonly repository: VisitorRepository) {}

  authorize(dto: AuthorizeVisitorDto): Promise<Visitor> {
    return this.repository.save({
      id: generateId(),
      ...dto,
      status: VisitStatus.AUTHORIZED,
      authorizedAt: new Date(),
    });
  }

  findAll(): Promise<Visitor[]> {
    return this.repository.findAll();
  }

  async registerEntry(id: string): Promise<Visitor> {
    const visitor = await this.getOrFail(id);
    this.assertStatus(visitor, VisitStatus.AUTHORIZED);
    return this.repository.save({ ...visitor, status: VisitStatus.INSIDE, enteredAt: new Date() });
  }

  async registerExit(id: string): Promise<Visitor> {
    const visitor = await this.getOrFail(id);
    this.assertStatus(visitor, VisitStatus.INSIDE);
    return this.repository.save({ ...visitor, status: VisitStatus.LEFT, leftAt: new Date() });
  }

  private async getOrFail(id: string): Promise<Visitor> {
    const visitor = await this.repository.findById(id);
    if (!visitor) throw new NotFoundException(`Visitor ${id} not found`);
    return visitor;
  }

  // Enforces the AUTHORIZED -> INSIDE -> LEFT lifecycle.
  private assertStatus(visitor: Visitor, expected: VisitStatus): void {
    if (visitor.status !== expected) {
      throw new ConflictException(`Visitor status is ${visitor.status}, expected ${expected}`);
    }
  }
}
