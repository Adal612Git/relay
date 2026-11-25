import { expect, test, chromium } from '@playwright/test';
import { A1_ORIGINAL } from '../../src/lib/examples';

test('Firebase keeps private analysis offline and prefers Chrome for the approved handoff', async ({
  page: defaultPage,
  baseURL,
}, testInfo) => {
  const profile = process.env.RELAY_CHROME_TEST_PROFILE;
  const persistent = profile
    ? await chromium.launchPersistentContext(profile, {
        channel: 'chrome',
        headless: false,
        baseURL,
        ...testInfo.project.use.launchOptions,
      })
    : null;
  const page = persistent ? await persistent.newPage() : defaultPage;
  try {
    const context = page.context();
    let cloudRequests = 0;
    let externalRequestsWithPrivateNotes = 0;
    page.on('request', (request) => {
      if (request.url().startsWith('https://firebasevertexai.googleapis.com/'))
        cloudRequests++;
      if (
        request.url().startsWith('https://') &&
        /RAW-ORCHID|robin(?:%40|@)example\.test/.test(
          request.url() + (request.postData() ?? ''),
        )
      )
        externalRequestsWithPrivateNotes++;
    });
    await page.goto('/');
    const loadCase = page.getByRole('button', { name: 'Try A1' });
    const analyze = page.getByRole('button', {
      name: 'Analyze on this device',
    });
    const status = page.getByRole('status');
    await loadCase.click();
    await analyze.click();
    await expect(status).toContainText('On-device analysis complete.', {
      timeout: 220_000,
    });

    await context.setOffline(true);
    await loadCase.click();
    await analyze.click();
    await expect(status).toContainText('On-device analysis complete.', {
      timeout: 100_000,
    });
    await expect(
      page.getByRole('textbox', { name: 'Original incident notes' }),
    ).toHaveValue(A1_ORIGINAL);
    await expect(
      page.getByRole('textbox', { name: 'Sharing copy', exact: true }),
    ).not.toHaveValue(/RAW-ORCHID|robin@example\.test/);
    expect(cloudRequests).toBe(0);
    expect(externalRequestsWithPrivateNotes).toBe(0);

    await context.setOffline(false);
    await page.getByRole('button', { name: 'Approve this text' }).click();
    await page.getByRole('button', { name: 'Generate handoff' }).click();
    await expect(page.locator('.source-tag')).toHaveText(
      'Generated on this device',
      { timeout: 90_000 },
    );
    expect(cloudRequests).toBe(0);
    expect(externalRequestsWithPrivateNotes).toBe(0);
  } finally {
    await persistent?.close();
  }
});
