import { defineConfig, devices } from '@playwright/test';

const staging = process.env.RELAY_INTEGRATION_BASE_URL;

export default defineConfig({
  testDir: './tests/integration',
  retries: 0,
  workers: 1,
  timeout: 360_000,
  reporter: 'list',
  use: {
    baseURL: staging ?? 'http://localhost:4175',
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
          ignoreDefaultArgs: ['--disable-component-update'],
        },
      },
    },
  ],
  webServer: staging
    ? undefined
    : {
        command: 'npm run dev -- --host localhost --port 4175 --strictPort',
        url: 'http://localhost:4175',
        reuseExistingServer: false,
      },
});
