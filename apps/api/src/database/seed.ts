import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { hashPassword } from '../modules/auth/password.js';
import { users } from './schema/index.js';

// Creates the initial admin account if it does not exist yet.
const email = (process.env.ADMIN_EMAIL ?? 'admin@guaritta.local').toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!password) throw new Error('ADMIN_PASSWORD is required');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, casing: 'snake_case' });

const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
if (existing) {
  console.log(`Admin ${email} already exists`);
} else {
  await db
    .insert(users)
    .values({ name: 'Administrador', email, role: 'ADMIN', passwordHash: await hashPassword(password) });
  console.log(`Admin ${email} created`);
}
await pool.end();
