import { registerDecorator, ValidationOptions } from 'class-validator';
import { isValidPlate } from '../utils/plate.js';

/** Validates a Brazilian plate in legacy (ABC1234) or Mercosul (ABC1D23) format. */
export function IsPlate(options?: ValidationOptions): PropertyDecorator {
  return (target, propertyName) =>
    registerDecorator({
      name: 'isPlate',
      target: target.constructor,
      propertyName: propertyName as string,
      options: { message: '$property must be a valid Brazilian plate', ...options },
      validator: { validate: (value: unknown) => typeof value === 'string' && isValidPlate(value) },
    });
}
