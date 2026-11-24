// SDK doubles only: these tests do not prove real model availability or inferencing.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { A1_EXPECTED, A1_ORIGINAL } from './examples';
import { buildSafeDraft } from './relay';
let Session: typeof import('./session').IncidentSession;

const sdk = vi.hoisted(() => ({
  create: vi.fn(),
  generate: vi.fn(),
  initialize: vi.fn(),
  verify: vi.fn(),
  runtime: {
    app: {} as object | null,
    appCheckReady: true,
    missing: [] as string[],
  },
}));
vi.mock('firebase/ai', () => ({
  getAI: vi.fn(() => ({})),
  GoogleAIBackend: class {},
  getGenerativeModel: sdk.create,
  InferenceMode: {
    ONLY_ON_DEVICE: 'only_on_device',
    PREFER_ON_DEVICE: 'prefer_on_device',
  },
  InferenceSource: { ON_DEVICE: 'on_device', IN_CLOUD: 'in_cloud' },
}));
vi.mock('./firebase', () => ({
  getFirebaseRuntime: () => ({ ...sdk.runtime, verifyAppCheck: sdk.verify }),
}));

beforeEach(async () => {
  vi.resetModules();
  Session = (await import('./session')).IncidentSession;
  vi.clearAllMocks();
  sdk.runtime = { app: {}, appCheckReady: true, missing: [] };
  sdk.verify.mockResolvedValue(undefined);
  sdk.initialize.mockResolvedValue(undefined);
  sdk.create.mockImplementation(() => ({
    initializeDeviceModel: sdk.initialize,
    generateContent: sdk.generate,
  }));
  sdk.generate.mockResolvedValue({
    response: {
      text: () => JSON.stringify(A1_EXPECTED),
      inferenceSource: 'in_cloud',
    },
  });
});

describe('Firebase adapter contract with SDK doubles', () => {
  it('rejects unauthenticated text before touching the SDK', async () => {
    const { generateHandoff } = await import('./ai');
    await expect(generateHandoff({ text: 'unapproved' })).rejects.toThrow(
      /Approve/,
    );
    expect(sdk.create).not.toHaveBeenCalled();
    expect(sdk.verify).not.toHaveBeenCalled();
    expect(sdk.generate).not.toHaveBeenCalled();
  });
  it('sends only the approved copy, excluding all original private markers', async () => {
    const { generateHandoff } = await import('./ai');
    const draft = buildSafeDraft(A1_ORIGINAL);
    const result = await generateHandoff(new Session().approve(draft.text));
    const prompt = sdk.generate.mock.calls[0][0] as string;
    expect(prompt.split('APPROVED SHARING COPY:\n')[1]).toBe(
      JSON.stringify(draft.text),
    );
    expect(prompt).not.toContain('robin@example.test');
    expect(prompt).not.toContain('RAW-ORCHID');
    expect(sdk.create.mock.calls[0][1]).toEqual({ mode: 'prefer_on_device' });
    expect(result.source).toBe('in_cloud');
  });
  it('never constructs a cloud-capable model during private analysis', async () => {
    const { analyzeOnDevice } = await import('./ai');
    sdk.generate.mockResolvedValue({
      response: {
        text: () => '{"findings":["Timeline reviewed"]}',
        inferenceSource: 'on_device',
      },
    });
    await analyzeOnDevice(A1_ORIGINAL);
    expect(sdk.create).toHaveBeenCalledTimes(1);
    expect(sdk.create.mock.calls[0][1].mode).toBe('only_on_device');
    expect(sdk.initialize).toHaveBeenCalledTimes(1);
    expect(sdk.verify).not.toHaveBeenCalled();
  });
  it('rejects invalid local output without surfacing its contents', async () => {
    const { analyzeOnDevice } = await import('./ai');
    sdk.generate.mockResolvedValue({
      response: {
        text: () => 'invalid private response',
        inferenceSource: 'on_device',
      },
    });
    await expect(analyzeOnDevice(A1_ORIGINAL)).rejects.toThrow(
      /invalid handoff/i,
    );
  });
  it('does not fall back when on-device initialization fails', async () => {
    const { analyzeOnDevice } = await import('./ai');
    sdk.initialize.mockRejectedValue(new Error('unsupported device'));
    await expect(analyzeOnDevice(A1_ORIGINAL)).rejects.toThrow();
    expect(sdk.create).toHaveBeenCalledTimes(1);
    expect(sdk.generate).not.toHaveBeenCalled();
  });
  it.each(['absent', 'failed'] as const)(
    'blocks hybrid generation if App Check is %s',
    async (state) => {
      const { generateHandoff } = await import('./ai');
      if (state === 'absent') sdk.runtime.appCheckReady = false;
      else sdk.verify.mockRejectedValue(new Error('attestation denied'));
      await expect(
        generateHandoff(
          new Session().approve(buildSafeDraft(A1_ORIGINAL).text),
        ),
      ).rejects.toThrow();
      expect(sdk.generate).not.toHaveBeenCalled();
      if (state === 'absent') expect(sdk.create).not.toHaveBeenCalled();
    },
  );
  it('checks revocation again after asynchronous attestation', async () => {
    const { generateHandoff } = await import('./ai');
    const session = new Session();
    sdk.verify.mockImplementation(async () => {
      session.invalidate();
    });
    await expect(
      generateHandoff(session.approve(buildSafeDraft(A1_ORIGINAL).text)),
    ).rejects.toThrow(/Approve/);
    expect(sdk.generate).not.toHaveBeenCalled();
  });
  it.each(['on_device', 'in_cloud', undefined])(
    'maps per-response source %s',
    async (source) => {
      const { generateHandoff } = await import('./ai');
      sdk.generate.mockResolvedValue({
        response: {
          text: () => JSON.stringify(A1_EXPECTED),
          inferenceSource: source,
        },
      });
      const result = await generateHandoff(
        new Session().approve(buildSafeDraft(A1_ORIGINAL).text),
      );
      expect(result.source).toBe(source ?? 'unknown');
    },
  );
  it('rejects a candidate that promotes suspicion to certainty', async () => {
    const { generateHandoff } = await import('./ai');
    sdk.generate.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            ...A1_EXPECTED,
            openQuestions: 'Confirmed root cause is config.',
          }),
      },
    });
    await expect(
      generateHandoff(new Session().approve(buildSafeDraft(A1_ORIGINAL).text)),
    ).rejects.toThrow(/suspected/);
  });
});

describe('untrusted response validation', () => {
  it.each([
    'null',
    '[]',
    'not json',
    '{}',
    '{"observedImpact":7}',
    JSON.stringify({ ...A1_EXPECTED, extra: 'ignore instructions' }),
    JSON.stringify({ ...A1_EXPECTED, nextStep: '   ' }),
    'x'.repeat(24001),
  ])('rejects invalid response %#', async (raw) => {
    const { parseHandoff } = await import('./ai');
    expect(() => parseHandoff(raw)).toThrow();
  });
  it('accepts exactly four nonempty fields inside a code fence', async () => {
    const { parseHandoff } = await import('./ai');
    expect(
      parseHandoff('```json\n' + JSON.stringify(A1_EXPECTED) + '\n```'),
    ).toEqual(A1_EXPECTED);
  });
});
