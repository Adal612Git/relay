// Exercises the actual app with no Firebase configuration; handoffs are written by the test operator.
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const fields = {
  'Observed impact': 'Search timed out at 10:02 and again at 10:18.',
  'Actions and results':
    'Worker restarted at 10:05; success at 10:10. Recovery was temporary.',
  'Open questions': 'Morning config change suspected; not checked.',
  'Next step': 'Compare errors at 10:02 and 10:18 with the change record.',
};

test('A1 review, explicit approval, manual handoff and real clipboard', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const external: string[] = [];
  page.on('request', (request) => {
    if (!request.url().startsWith('http://127.0.0.1'))
      external.push(request.url());
  });
  await page.goto('/');
  await expect(
    page.getByRole('textbox', { name: 'Original incident notes' }),
  ).toHaveValue('');
  await page.getByRole('button', { name: 'Try A1' }).click();
  await expect(
    page.getByRole('button', { name: 'Generate handoff' }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Prepare manually' }).click();
  const copy = page.getByRole('textbox', { name: 'Sharing copy', exact: true });
  await expect(copy).not.toHaveValue(/robin@example.test|RAW-ORCHID/);
  await expect(copy).toHaveValue(/10:02[\s\S]*10:05[\s\S]*10:10[\s\S]*10:18/);
  await page.getByRole('button', { name: 'Approve this text' }).click();
  await expect(page.getByText('Approved', { exact: true })).toBeVisible();
  // Missing Firebase stays visibly blocked even after approval.
  await expect(
    page.getByRole('button', { name: 'Generate handoff' }),
  ).toBeDisabled();
  await copy.fill((await copy.inputValue()) + '\nOperator review.');
  await expect(page.getByText('Pending review', { exact: true })).toBeVisible();
  for (const [name, value] of Object.entries(fields))
    await page.getByRole('textbox', { name, exact: true }).fill(value);
  await expect(
    page.getByRole('button', { name: 'Copy handoff' }),
  ).toBeDisabled();
  await page.getByRole('checkbox', { name: 'Review complete' }).check();
  await page.getByRole('button', { name: 'Copy handoff' }).click();
  await expect(page.getByRole('status')).toContainText('Handoff copied.');
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toContain(
    'Actions and results\n' + fields['Actions and results'],
  );
  expect(external).toEqual([]);
  expect(
    await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
    })),
  ).toEqual({ local: 0, session: 0 });
  await page.reload();
  await expect(
    page.getByRole('textbox', { name: 'Sharing copy', exact: true }),
  ).toHaveValue('');
});

test('manual workflow works offline and offers a clipboard fallback', async ({
  page,
  context,
}) => {
  await page.goto('/');
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Try A3' }).click();
  await page.getByRole('button', { name: 'Prepare manually' }).click();
  await expect(
    page.getByRole('textbox', { name: 'Sharing copy', exact: true }),
  ).not.toHaveValue(/silver teacup|RAW-COBALT/);
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async () => {
          throw new Error('denied');
        },
      },
    });
  });
  for (const [name, value] of Object.entries(fields))
    await page.getByRole('textbox', { name, exact: true }).fill(value);
  await page.getByRole('checkbox', { name: 'Review complete' }).check();
  await page.getByRole('button', { name: 'Copy handoff' }).click();
  await expect(page.getByRole('alert')).toContainText('Select and copy');
  await expect(
    page.getByRole('textbox', { name: 'Selectable handoff text' }),
  ).toHaveValue(/Observed impact[\s\S]*Next step/);
  await page.getByRole('button', { name: 'Clear incident' }).click();
  await expect(
    page.getByRole('textbox', { name: 'Original incident notes' }),
  ).toHaveValue('');
});

test('keyboard navigation, accessible controls and no overflow at 320px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('textbox', { name: 'Original incident notes' }),
  ).toBeFocused();
  await page.keyboard.type('One test failed.');
  await page.getByRole('button', { name: 'Prepare manually' }).focus();
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('textbox', { name: 'Sharing copy', exact: true }),
  ).toHaveValue('One test failed.');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
