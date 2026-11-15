import { boolean, index, integer, pgTable, text, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { baseColumns } from './columns.js';
import { userRole, vehicleStatus } from './enums.js';

export const units = pgTable(
  'units',
  {
    ...baseColumns,
    block: varchar({ length: 20 }).notNull().default(''),
    number: varchar({ length: 20 }).notNull(),
    floor: integer(),
    notes: text(),
  },
  (t) => [uniqueIndex('units_block_number_uq').on(t.block, t.number)],
);

export const residents = pgTable(
  'residents',
  {
    ...baseColumns,
    unitId: uuid()
      .notNull()
      .references(() => units.id, { onDelete: 'cascade' }),
    name: varchar({ length: 120 }).notNull(),
    document: varchar({ length: 20 }),
    phone: varchar({ length: 20 }),
    email: varchar({ length: 160 }),
    isOwner: boolean().notNull().default(false),
  },
  (t) => [index('residents_unit_idx').on(t.unitId)],
);

export const users = pgTable('users', {
  ...baseColumns,
  name: varchar({ length: 120 }).notNull(),
  email: varchar({ length: 160 }).notNull().unique(),
  passwordHash: text().notNull(),
  role: userRole().notNull(),
  residentId: uuid().references(() => residents.id, { onDelete: 'set null' }),
  active: boolean().notNull().default(true),
});

export const vehicles = pgTable(
  'vehicles',
  {
    ...baseColumns,
    unitId: uuid()
      .notNull()
      .references(() => units.id, { onDelete: 'cascade' }),
    residentId: uuid().references(() => residents.id, { onDelete: 'set null' }),
    plate: varchar({ length: 7 }).notNull(),
    // Mercosul-canonical plate used for matching legacy and converted plates.
    plateKey: varchar({ length: 7 }).notNull(),
    brand: varchar({ length: 40 }),
    model: varchar({ length: 60 }),
    color: varchar({ length: 30 }),
    status: vehicleStatus().notNull().default('ACTIVE'),
  },
  (t) => [uniqueIndex('vehicles_plate_key_uq').on(t.plateKey), index('vehicles_unit_idx').on(t.unitId)],
);
