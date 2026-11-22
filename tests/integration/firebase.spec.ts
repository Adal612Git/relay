import { expect, test } from '@playwright/test';

// No mocks, intercepted responses, debug token, or test-only app code.
// Requires localhost registered for the real reCAPTCHA Enterprise provider.
test('real Firebase hybrid A1 with genuine App Check and response source', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Try A1' }).click();
  await page.getByRole('button', { name: 'Prepare manually' }).click();
  await page.getByRole('button', { name: 'Approve this text' }).click();
  await page.getByRole('button', { name: 'Generate handoff' }).click();
  await expect(page.getByRole('status')).toContainText(
    'Handoff candidate ready.',
    { timeout: 110_000 },
  );
  // SDK metadata must be present. Either real source is acceptable, recorded explicitly.
  const source = page.locator('.source-tag');
  await expect(source).toHaveText(/Generated (on this device|in the cloud)/);
  for (const name of [
    'Observed impact',
    'Actions and results',
    'Open questions',
    'Next step',
  ]) {
    await expect(
      page.getByRole('textbox', { name, exact: true }),
    ).not.toHaveValue('');
  }
  // Only source and success are reported; no private response or token is logged.
  console.log(`REAL_FIREBASE_SOURCE: ${await source.textContent()}`);
});
