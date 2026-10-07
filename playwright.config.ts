import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for end-to-end / visual tests.
 *
 * Tests live in `e2e/` (kept separate from the Vitest unit tests in `tests/`).
 * Each run owns a private dev server on an automatically allocated port.
 *
 * https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  // Use a distinct suffix so these never collide with the Vitest unit tests.
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  reporter: 'list',

  use: {
    // Capture a trace on first retry to aid debugging failures.
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
    },
  ],

  // Capture Vite's actual URL into Playwright's default baseURL fixture.
  webServer: {
    command: 'pnpm dev --port 0 --host 127.0.0.1',
    wait: { stdout: /Local:\s+(?<playwright_test_base_url>http:\/\/127\.0\.0\.1:\d+\/)/ },
    stdout: 'pipe',
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
    timeout: 60_000,
  },
});
