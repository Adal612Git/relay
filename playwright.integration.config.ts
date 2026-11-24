import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/integration',
  retries: 0,
  workers: 1,
  timeout: 360_000,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4175',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    {
      name: 'real-cloud-fallback',
      testMatch: 'firebase.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'real-chrome-offline',
      testMatch: 'chrome.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: false,
        launchOptions: {
          args: ['--enable-features=PromptApiForGeminiNanoMultimodalInput'],
        },
      },
    },
  ],
  webServer: {
    command: 'npm run dev -- --host localhost --port 4175 --strictPort',
    url: 'http://localhost:4175',
    reuseExistingServer: false,
  },
});
