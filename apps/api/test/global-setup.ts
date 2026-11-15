import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

/** Recreates the test database schema from migrations before the e2e run. */
export default async function setup(): Promise<void> {
  const pool = new pg.Pool({
    connectionString:
      process.env.TEST_DATABASE_URL ?? 'postgresql://guaritta:guaritta@localhost:5432/guaritta_test',
  });
  await pool.query(
    'DROP SCHEMA IF EXISTS public CASCADE; DROP SCHEMA IF EXISTS drizzle CASCADE; CREATE SCHEMA public;',
  );
  await migrate(drizzle({ client: pool }), { migrationsFolder: './drizzle' });
  await pool.end();
}
