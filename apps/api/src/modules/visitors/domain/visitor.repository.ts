import { Visitor } from './visitor.entity';

// Injection token to decouple services from the persistence implementation.
export const VISITOR_REPOSITORY = Symbol('VISITOR_REPOSITORY');

export interface VisitorRepository {
  save(visitor: Visitor): Promise<Visitor>;
  findById(id: string): Promise<Visitor | null>;
  findAll(): Promise<Visitor[]>;
}
