import { expect, test, chromium } from '@playwright/test';
import { join } from 'node:path';
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
  const page = persistent
    ? (persistent.pages()[0] ?? (await persistent.newPage()))
    : defaultPage;
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
      name: 'Analyze locally',
    });
    const status = page.getByRole('status');
    await loadCase.click();
    await analyze.click();
    const evidence = process.env.RELAY_EDITORIAL_EVIDENCE_DIR;
    if (evidence) {
      await expect(
        page.getByRole('progressbar', {
          name: 'Preparing the on-device model',
        }),
      ).toBeVisible();
      await page.screenshot({
        path: join(evidence, 'real-device-loading.png'),
        fullPage: true,
      });
    }
    await expect(status).toContainText('On-device analysis complete.', {
      timeout: 220_000,
    });

    await context.setOffline(true);
    await page.getByRole('button', { name: 'Capture', exact: true }).click();
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
    if (evidence)
      await page.screenshot({
        path: join(evidence, 'real-device-offline.png'),
        fullPage: true,
      });

    await context.setOffline(false);
    await page.getByRole('button', { name: 'Approve this text' }).click();
    await page
      .getByRole('button', { name: 'Open handoff', exact: true })
      .click();
    await page.getByRole('button', { name: 'Generate handoff' }).click();
    const result = page.locator('.source-tag').filter({ hasText: /Generated/ });
    const alert = page.getByRole('alert');
    await expect(result.or(alert)).toBeVisible({ timeout: 90_000 });
    if (await alert.isVisible())
      throw new Error((await alert.textContent()) ?? 'Live inference failed');
    await expect(result).toHaveText('Generated on this device');
    expect(cloudRequests).toBe(0);
    expect(externalRequestsWithPrivateNotes).toBe(0);
    if (evidence)
      await page.screenshot({
        path: join(evidence, 'real-device-handoff.png'),
        fullPage: true,
      });
  } finally {
    await persistent?.close();
  }
});
