import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    globalSetup: ['./test/global-setup.ts'],
    // E2E suites share one database, so they must not run concurrently.
    fileParallelism: false,
    hookTimeout: 30_000,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ?? 'postgresql://guaritta:guaritta@localhost:5432/guaritta_test',
      JWT_SECRET: 'test-secret-test-secret-test-secret-123',
      ACCESS_REQUEST_TTL_SECONDS: '60',
    },
  },
});
