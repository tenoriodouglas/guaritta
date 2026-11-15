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
  },
});
