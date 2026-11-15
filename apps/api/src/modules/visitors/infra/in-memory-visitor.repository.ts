import { Injectable } from '@nestjs/common';
import { Visitor } from '../domain/visitor.entity';
import { VisitorRepository } from '../domain/visitor.repository';

@Injectable()
export class InMemoryVisitorRepository implements VisitorRepository {
  private readonly items = new Map<string, Visitor>();

  async save(visitor: Visitor): Promise<Visitor> {
    this.items.set(visitor.id, visitor);
    return visitor;
  }

  async findById(id: string): Promise<Visitor | null> {
    return this.items.get(id) ?? null;
  }

  async findAll(): Promise<Visitor[]> {
    return [...this.items.values()];
  }
}
