// Component tests with doubles. No Firebase requests are made.
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { A1_EXPECTED, A1_ORIGINAL, A2_ORIGINAL } from './lib/examples';
import { requireApprovedCopy } from './lib/session';
import type { AiResult, LocalReview } from './lib/types';

const ai = vi.hoisted(() => ({ analyze: vi.fn(), generate: vi.fn() }));
vi.mock('./lib/ai', () => ({
  analyzeOnDevice: ai.analyze,
  generateHandoff: ai.generate,
}));
vi.mock('./lib/firebase', () => ({
  getFirebaseRuntime: () => ({ app: {}, appCheckReady: true, missing: [] }),
}));
const button = (name: string) =>
  screen.getByRole('button', { name }) as HTMLButtonElement;
const field = (name: string) =>
  screen.getByRole('textbox', { name }) as HTMLTextAreaElement;
const change = (name: string, value: string) =>
  fireEvent.change(field(name), { target: { value } });
function prepare() {
  fireEvent.click(button('Try A1'));
  fireEvent.click(button('Prepare manually'));
}
function approve() {
  fireEvent.click(button('Approve this text'));
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
beforeEach(() => {
  vi.clearAllMocks();
  ai.generate.mockResolvedValue({ value: A1_EXPECTED, source: 'on_device' });
});
afterEach(cleanup);

describe('operator workflow and stale requests', () => {
  it('blocks generation without approval and invalidates permission on an edit', () => {
    render(<App />);
    prepare();
    expect(button('Generate handoff').disabled).toBe(true);
    fireEvent.click(button('Generate handoff'));
    expect(ai.generate).not.toHaveBeenCalled();
    approve();
    expect(button('Generate handoff').disabled).toBe(false);
    change('Sharing copy', field('Sharing copy').value + '\nReviewed again.');
    expect(button('Generate handoff').disabled).toBe(true);
  });
  it('manual preparation and manual output never call AI', async () => {
    render(<App />);
    prepare();
    for (const [label, value] of Object.entries({
      'Observed impact': 'One test failed.',
      'Actions and results': 'No action recorded.',
      'Open questions': 'Cause unknown.',
      'Next step': 'No next step recorded.',
    }))
      change(label, value);
    expect(button('Copy handoff').disabled).toBe(true);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Review complete' }));
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    await act(async () => {
      fireEvent.click(button('Copy handoff'));
    });
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('Observed impact\nOne test failed.'),
    );
    expect(ai.analyze).not.toHaveBeenCalled();
    expect(ai.generate).not.toHaveBeenCalled();
  });
  it('passes a valid approved capability, and preserves drafts after a Firebase failure', async () => {
    render(<App />);
    prepare();
    approve();
    const draft = field('Sharing copy').value;
    ai.generate.mockImplementation(async (copy) => {
      expect(requireApprovedCopy(copy)).toBe(draft);
      throw new Error('quota denied: private diagnostic');
    });
    change('Observed impact', 'My saved manual draft.');
    approve();
    await act(async () => {
      fireEvent.click(button('Generate handoff'));
    });
    expect(field('Sharing copy').value).toBe(draft);
    expect(field('Observed impact').value).toBe('My saved manual draft.');
    expect(screen.getByRole('alert').textContent).not.toContain(
      'private diagnostic',
    );
  });
  it('a response from the previous incident cannot overwrite a newer request or release its busy state', async () => {
    const old = deferred<AiResult<LocalReview>>();
    const current = deferred<AiResult<LocalReview>>();
    ai.analyze
      .mockReturnValueOnce(old.promise)
      .mockReturnValueOnce(current.promise);
    render(<App />);
    fireEvent.click(button('Try A1'));
    fireEvent.click(button('Analyze on this device'));
    fireEvent.click(button('Try A2'));
    fireEvent.click(button('Analyze on this device'));
    await act(async () =>
      old.resolve({
        value: { sharingCopy: 'STALE', findings: ['OLD RESPONSE'] },
        source: 'on_device',
      }),
    );
    expect(field('Sharing copy').value).toBe('');
    expect(button('Working on this device…').disabled).toBe(true);
    await act(async () =>
      current.resolve({
        value: { findings: ['NEW RESPONSE'] },
        source: 'on_device',
      }),
    );
    expect(field('Original incident notes').value).toBe(A2_ORIGINAL);
    expect(field('Sharing copy').value).toContain('24 waiting at 14:00');
    expect(screen.queryByText('OLD RESPONSE')).toBeNull();
    expect(screen.getByText('NEW RESPONSE')).toBeTruthy();
  });
  it('a late generation cannot overwrite manual edits or enable copying', async () => {
    const request = deferred<AiResult<typeof A1_EXPECTED>>();
    ai.generate.mockReturnValue(request.promise);
    render(<App />);
    prepare();
    approve();
    fireEvent.click(button('Generate handoff'));
    change('Observed impact', 'Current manual review.');
    await act(async () =>
      request.resolve({ value: A1_EXPECTED, source: 'in_cloud' }),
    );
    expect(field('Observed impact').value).toBe('Current manual review.');
    expect(button('Copy handoff').disabled).toBe(true);
  });
  it('manual preparation remains usable during download and ignores late results', async () => {
    const request = deferred<AiResult<LocalReview>>();
    ai.analyze.mockReturnValue(request.promise);
    render(<App />);
    fireEvent.click(button('Try A1'));
    fireEvent.click(button('Analyze on this device'));
    fireEvent.click(button('Prepare manually'));
    const draft = field('Sharing copy').value;
    await act(async () =>
      request.resolve({ value: { findings: ['STALE'] }, source: 'on_device' }),
    );
    expect(field('Sharing copy').value).toBe(draft);
    expect(screen.queryByText('STALE')).toBeNull();
  });
  it('clear removes incident data and prevents late failure from restoring it', async () => {
    const request = deferred<AiResult<LocalReview>>();
    ai.analyze.mockReturnValue(request.promise);
    render(<App />);
    fireEvent.click(button('Try A1'));
    fireEvent.click(button('Analyze on this device'));
    fireEvent.click(button('Clear incident'));
    await act(async () => request.reject(new Error('offline')));
    expect(field('Original incident notes').value).toBe('');
    expect(field('Sharing copy').value).toBe('');
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it('excluded-line navigation selects the correct original with CRLF and emoji', () => {
    render(<App />);
    change(
      'Original incident notes',
      '😀 observed\n10:02 owner a@example.test\n10:05 retried',
    );
    fireEvent.click(button('Prepare manually'));
    fireEvent.click(button('Line 2'));
    const original = field('Original incident notes');
    expect(
      original.value.slice(original.selectionStart, original.selectionEnd),
    ).toBe('10:02 owner a@example.test');
    expect(document.activeElement).toBe(original);
  });
  it('clipboard denial leaves a selectable, confirmed four-field fallback', async () => {
    render(<App />);
    prepare();
    approve();
    await act(async () => {
      fireEvent.click(button('Generate handoff'));
    });
    expect(field('Selectable handoff text').value).toBe('');
    fireEvent.click(screen.getByRole('checkbox', { name: 'Review complete' }));
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });
    await act(async () => {
      fireEvent.click(button('Copy handoff'));
    });
    expect(screen.getByRole('alert').textContent).toContain('Select and copy');
    expect(field('Selectable handoff text').value).toContain(
      A1_EXPECTED.actionsAndResults,
    );
    change('Next step', 'Compare the change record.');
    expect(field('Selectable handoff text').value).toBe('');
    expect(button('Copy handoff').disabled).toBe(true);
    expect(field('Original incident notes').value).toBe(A1_ORIGINAL);
  });
});
