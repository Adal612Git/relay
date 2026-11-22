import { defineConfig, devices } from '@playwright/test';

// Explicit opt-in, real service only. Never included in the deterministic CI suite.
export default defineConfig({
  testDir: './tests/integration',
  retries: 0,
  workers: 1,
  timeout: 120_000,
  reporter: 'list',
  // Do not attach request bodies, tokens, console logs or traces.
  use: {
    baseURL: 'http://localhost:4175',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  projects: [{ name: 'real-firebase', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev -- --host localhost --port 4175 --strictPort',
    url: 'http://localhost:4175',
    reuseExistingServer: false,
  },
});
