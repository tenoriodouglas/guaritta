import { NotFoundException } from '@nestjs/common';

/** Narrows a nullable lookup result, throwing 404 when absent. */
export function assertFound<T>(value: T | undefined | null, resource: string, id: string): T {
  if (value === undefined || value === null) throw new NotFoundException(`${resource} ${id} not found`);
  return value;
}
