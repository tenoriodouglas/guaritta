import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

// Applies pending SQL migrations from ./drizzle.
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
await migrate(drizzle({ client: pool }), { migrationsFolder: './drizzle' });
await pool.end();
console.log('Migrations applied');
