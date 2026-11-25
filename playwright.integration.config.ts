import { defineConfig } from '@playwright/test';

const staging = process.env.RELAY_INTEGRATION_BASE_URL;
const chromeFeatures = ['AIPromptAPIMultimodalInput'];
if (process.env.RELAY_CHROME_MODEL_V4 === '1') {
  chromeFeatures.push(
    'OptimizationGuideManifestBroker',
    'AIApiFoundationalModel:model_version/v4',
  );
}

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
      use: {
        channel: 'chrome',
        headless: false,
        // Use genuine App Check and make the browser's Prompt API unavailable.
        launchOptions: { args: ['--disable-blink-features=AIPromptAPI'] },
      },
    },
    {
      name: 'real-chrome-offline',
      testMatch: 'chrome.spec.ts',
      use: {
        channel: 'chrome',
        headless: false,
        launchOptions: {
          args: [`--enable-features=${chromeFeatures.join(',')}`],
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
