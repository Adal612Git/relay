import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const [
  url = 'http://localhost:4184/',
  directory = 'docs/design/editorial/after',
  ...requested
] = process.argv.slice(2);
const widths = requested.length
  ? requested.map(Number)
  : [320, 390, 768, 1024, 1366, 1440, 1920];
const { expectedHandoff } = JSON.parse(
  await readFile('examples/a1.json', 'utf8'),
);
const labels = [
  'Observed impact',
  'Actions and results',
  'Open questions',
  'Next step',
];
const browser = await chromium.launch();

try {
  for (const width of widths) {
    const context = await browser.newContext({
      viewport: {
        width,
        height: width === 1366 ? 768 : width <= 390 ? 844 : 900,
      },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const button = (name) => page.getByRole('button', { name, exact: true });
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.name));

    async function checkScreen(stage) {
      await page.locator(`main[data-stage="${stage}"]`).waitFor();
      await page.evaluate(async () => {
        await document.fonts.ready;
        window.scrollTo(0, 0);
      });
      const { scroll, viewport, fonts } = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
        fonts: [...document.fonts].filter(({ status }) => status === 'loaded')
          .length,
      }));
      assert.ok(
        scroll <= viewport,
        `${stage} at ${width}: ${scroll} exceeds ${viewport}`,
      );
      assert.equal(fonts, 2, 'The packaged sans and mono fonts must load');
      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      assert.deepEqual(
        axe.violations.map(({ id, nodes }) => [
          id,
          nodes.map(({ target }) => target),
        ]),
        [],
      );
      await page.screenshot({
        path: `${directory}/${width}-${stage}.png`,
        fullPage: true,
        animations: 'disabled',
      });
      if (width === 1366)
        await page.screenshot({
          path: `${directory}/${width}-${stage}-viewport.png`,
          animations: 'disabled',
        });
    }

    const response = await page.goto(url);
    assert.equal(response?.status(), 200);
    await button('Try A1').click();
    await checkScreen('capture');
    await button('Prepare manually').click();
    await checkScreen('review');
    await button('Line 6').click();
    assert.equal(
      await page
        .getByRole('textbox', { name: 'Original incident notes' })
        .evaluate(
          (editor) =>
            editor === document.activeElement &&
            editor.selectionEnd > editor.selectionStart,
        ),
      true,
    );
    await button('Approve this text').click();
    await button('Open handoff').click();
    for (const [index, value] of Object.values(expectedHandoff).entries()) {
      await page
        .getByRole('textbox', { name: labels[index], exact: true })
        .fill(value);
    }
    await page.getByRole('checkbox', { name: 'Review complete' }).check();
    await checkScreen('handoff');
    assert.deepEqual(pageErrors, []);
    await context.close();
    console.log(
      `${width} px, three stages, both local fonts, no overflow, zero axe violations`,
    );
  }
} finally {
  await browser.close();
}
