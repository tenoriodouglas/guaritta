import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { DRIZZLE, type Database } from '../src/database/database.constants.js';
import { users } from '../src/database/schema/index.js';
import { hashPassword } from '../src/modules/auth/password.js';

export interface TestContext {
  app: NestExpressApplication;
  http: () => ReturnType<typeof request>;
  db: Database;
}

export async function createTestApp(): Promise<TestContext> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>();
  configureApp(app);
  await app.init();
  return { app, http: () => request(app.getHttpServer()), db: app.get<Database>(DRIZZLE) };
}

/** Inserts a user directly and returns its bearer token. */
export async function createUserAndLogin(
  ctx: TestContext,
  data: { email: string; role: 'ADMIN' | 'CONCIERGE' | 'RESIDENT'; residentId?: string },
): Promise<string> {
  const password = 'password-123';
  await ctx.db
    .insert(users)
    .values({ ...data, name: data.email, passwordHash: await hashPassword(password) });
  const response = await ctx.http().post('/api/auth/login').send({ email: data.email, password }).expect(200);
  return `Bearer ${response.body.accessToken}`;
}

/** Polls until the assertion passes; used for async event listeners. */
export async function eventually<T>(fn: () => Promise<T>, timeoutMs = 2_000): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try {
      return await fn();
    } catch (error) {
      if (Date.now() > deadline) throw error;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
}
