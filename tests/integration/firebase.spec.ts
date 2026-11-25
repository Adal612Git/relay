import { chromium, expect, test as base } from '@playwright/test';
import { EXAMPLES } from '../../src/lib/examples';
import { validateHandoffFidelity, handoffAsText } from '../../src/lib/relay';

const endpoint =
  /^https:\/\/firebasevertexai\.googleapis\.com\/.*:generateContent(?:\?|$)/;
const profile = process.env.RELAY_CHROME_TEST_PROFILE;
const test = profile
  ? base.extend({
      page: async ({ baseURL }, use, testInfo) => {
        const context = await chromium.launchPersistentContext(profile, {
          channel: 'chrome',
          headless: false,
          baseURL,
          ...testInfo.project.use.launchOptions,
        });
        try {
          await use(context.pages()[0] ?? (await context.newPage()));
        } finally {
          await context.close();
        }
      },
    })
  : base;
const heading = {
  observedImpact: 'Observed impact',
  actionsAndResults: 'Actions and results',
  openQuestions: 'Open questions',
  nextStep: 'Next step',
} as const;

for (const fixture of EXAMPLES) {
  test(`${fixture.id}: real cloud fallback, approved payload and response fidelity`, async ({
    page,
  }) => {
    const incidentMarkers = [
      ...fixture.expectedExclusions,
      fixture.originalNotes[0],
    ];
    let incidentLogged = false;
    page.on('console', (message) => {
      if (
        incidentMarkers.some((marker) =>
          message.text().toLowerCase().includes(marker.toLowerCase()),
        )
      )
        incidentLogged = true;
    });
    await page.goto('/');
    expect(await page.evaluate(() => 'LanguageModel' in globalThis)).toBe(
      false,
    );
    await page.getByRole('button', { name: `Try ${fixture.id}` }).click();
    await page.getByRole('button', { name: 'Prepare manually' }).click();
    const approved = await page
      .getByRole('textbox', { name: 'Sharing copy', exact: true })
      .inputValue();
    await page.getByRole('button', { name: 'Approve this text' }).click();

    const cloud = page.waitForResponse(
      (response) =>
        endpoint.test(response.url()) && response.request().method() === 'POST',
      { timeout: 100_000 },
    );
    const alert = page.getByRole('alert');
    const failure = alert.waitFor({ timeout: 100_000 }).then(async () => {
      throw new Error((await alert.textContent()) ?? 'Live inference failed');
    });
    await page.getByRole('button', { name: 'Generate handoff' }).click();
    const response = await Promise.race([cloud, failure]);
    expect(response.status()).toBe(200);
    expect(new URL(response.url()).pathname).toMatch(
      /\/models\/gemini-3\.5-flash-lite:generateContent$/,
    );
    const request = response.request();
    const headers = await request.allHeaders();
    expect(Boolean(headers['x-firebase-appcheck'])).toBe(true);
    const body = request.postDataJSON() as {
      contents: { parts: { text?: string }[] }[];
    };
    const parts = body.contents.flatMap((content) => content.parts);
    expect(parts).toHaveLength(1);
    const prompt = parts[0].text ?? '';
    expect(
      prompt.split('APPROVED SHARING COPY:\n')[1] === JSON.stringify(approved),
    ).toBe(true);
    for (const marker of fixture.expectedExclusions)
      expect(prompt.toLowerCase().includes(marker.toLowerCase())).toBe(false);
    expect(prompt.includes('NUMBERED INCIDENT NOTES:')).toBe(false);

    await expect(page.locator('.source-tag')).toHaveText(
      'Generated in the cloud',
      { timeout: 100_000 },
    );
    async function field(name: string) {
      const text = await page
        .getByRole('textbox', { name, exact: true })
        .inputValue();
      expect(Boolean(text.trim())).toBe(true);
      return text;
    }
    const handoff = {
      observedImpact: await field(heading.observedImpact),
      actionsAndResults: await field(heading.actionsAndResults),
      openQuestions: await field(heading.openQuestions),
      nextStep: await field(heading.nextStep),
    };
    expect(() => validateHandoffFidelity(handoff, approved)).not.toThrow();
    const text = handoffAsText(handoff).toLowerCase();
    for (const claim of fixture.forbiddenClaims)
      expect(
        text.includes(claim.toLowerCase()),
        `Unsupported claim in ${fixture.id}: ${claim}`,
      ).toBe(false);
    for (const marker of fixture.expectedExclusions)
      expect(text.includes(marker.toLowerCase())).toBe(false);

    const persistedIncident = await page.evaluate(async (markers) => {
      function contains(value: unknown) {
        const serialized = JSON.stringify(value)?.toLowerCase() ?? '';
        return markers.some((marker) =>
          serialized.includes(marker.toLowerCase()),
        );
      }
      if (contains(location.href)) return true;
      for (const storage of [localStorage, sessionStorage]) {
        for (let index = 0; index < storage.length; index++) {
          const key = storage.key(index);
          if (key !== null && (contains(key) || contains(storage.getItem(key))))
            return true;
        }
      }
      for (const { name } of await indexedDB.databases()) {
        if (!name) continue;
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open(name);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        try {
          for (const store of db.objectStoreNames) {
            const persisted = await new Promise<boolean>((resolve, reject) => {
              const request = db.transaction(store).objectStore(store).getAll();
              request.onsuccess = () => resolve(contains(request.result));
              request.onerror = () => reject(request.error);
            });
            if (persisted) return true;
          }
        } finally {
          db.close();
        }
      }
      return false;
    }, incidentMarkers);
    expect(persistedIncident).toBe(false);
    expect(incidentLogged).toBe(false);

    if (fixture.id === 'A1') {
      // Same synthetic request and app identifiers with the attestation header omitted.
      // The server must reject the request. Never print headers or payloads.
      const publicHeaders = Object.fromEntries(
        Object.entries(headers).filter(([name]) =>
          [
            'content-type',
            'origin',
            'referer',
            'x-firebase-appid',
            'x-goog-api-key',
            'x-goog-api-client',
          ].includes(name),
        ),
      );
      const withoutAttestation = await page.request.post(request.url(), {
        data: body,
        headers: publicHeaders,
        maxRedirects: 0,
      });
      expect([401, 403]).toContain(withoutAttestation.status());
    }
  });
}
