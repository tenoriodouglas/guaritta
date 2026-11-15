import { index, pgTable, real, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { baseColumns } from './columns.js';
import { units, users, vehicles } from './condominium.js';
import {
  accessDirection,
  accessSource,
  accessStatus,
  accessSubject,
  accessSuggestion,
  deliveryStatus,
  gateDriver,
  gateKind,
  notificationType,
  visitStatus,
} from './enums.js';

export const visitors = pgTable(
  'visitors',
  {
    ...baseColumns,
    unitId: uuid()
      .notNull()
      .references(() => units.id, { onDelete: 'cascade' }),
    name: varchar({ length: 120 }).notNull(),
    document: varchar({ length: 20 }),
    plate: varchar({ length: 7 }),
    plateKey: varchar({ length: 7 }),
    status: visitStatus().notNull().default('AUTHORIZED'),
    validFrom: timestamp({ withTimezone: true }).notNull().defaultNow(),
    validUntil: timestamp({ withTimezone: true }).notNull(),
    authorizedById: uuid().references(() => users.id, { onDelete: 'set null' }),
    enteredAt: timestamp({ withTimezone: true }),
    leftAt: timestamp({ withTimezone: true }),
  },
  (t) => [index('visitors_unit_idx').on(t.unitId), index('visitors_plate_key_idx').on(t.plateKey)],
);

export const deliveries = pgTable(
  'deliveries',
  {
    ...baseColumns,
    unitId: uuid()
      .notNull()
      .references(() => units.id, { onDelete: 'cascade' }),
    carrier: varchar({ length: 60 }).notNull(),
    trackingCode: varchar({ length: 60 }),
    description: text(),
    status: deliveryStatus().notNull().default('RECEIVED'),
    receivedById: uuid().references(() => users.id, { onDelete: 'set null' }),
    pickedUpAt: timestamp({ withTimezone: true }),
    pickedUpBy: varchar({ length: 120 }),
  },
  (t) => [index('deliveries_unit_status_idx').on(t.unitId, t.status)],
);

export const gates = pgTable('gates', {
  ...baseColumns,
  name: varchar({ length: 60 }).notNull().unique(),
  kind: gateKind().notNull(),
  driver: gateDriver().notNull().default('SIMULATED'),
  // Relay endpoint called to open the gate (HTTP_RELAY driver).
  endpoint: text(),
  // SHA-256 of the API key used by this gate's camera to post plate reads.
  deviceKeyHash: text(),
});

export const accessRequests = pgTable(
  'access_requests',
  {
    ...baseColumns,
    gateId: uuid()
      .notNull()
      .references(() => gates.id, { onDelete: 'cascade' }),
    direction: accessDirection().notNull().default('IN'),
    source: accessSource().notNull(),
    plateRead: varchar({ length: 10 }),
    plateKey: varchar({ length: 7 }),
    confidence: real(),
    snapshotUrl: text(),
    subject: accessSubject().notNull(),
    suggestion: accessSuggestion().notNull(),
    reason: text().notNull(),
    unitId: uuid().references(() => units.id, { onDelete: 'set null' }),
    vehicleId: uuid().references(() => vehicles.id, { onDelete: 'set null' }),
    visitorId: uuid().references(() => visitors.id, { onDelete: 'set null' }),
    status: accessStatus().notNull().default('PENDING'),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    decidedById: uuid().references(() => users.id, { onDelete: 'set null' }),
    decidedAt: timestamp({ withTimezone: true }),
    decisionNote: text(),
  },
  (t) => [
    index('access_requests_status_idx').on(t.status, t.createdAt),
    index('access_requests_plate_key_idx').on(t.plateKey),
  ],
);

export const notifications = pgTable(
  'notifications',
  {
    ...baseColumns,
    unitId: uuid()
      .notNull()
      .references(() => units.id, { onDelete: 'cascade' }),
    type: notificationType().notNull(),
    title: varchar({ length: 120 }).notNull(),
    body: text().notNull(),
    readAt: timestamp({ withTimezone: true }),
  },
  (t) => [index('notifications_unit_idx').on(t.unitId, t.createdAt)],
);
