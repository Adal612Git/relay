import { describe, expect, it } from 'vitest';
import { A1_ORIGINAL } from './examples';
import {
  buildSafeDraft,
  handoffAsText,
  validateOriginal,
  validateSharingCopy,
} from './relay';
import { A1_EXPECTED } from './examples';

describe('Relay privacy helpers', () => {
  it('keeps the original unchanged while identifying synthetic contact and scratch markers', () => {
    const result = buildSafeDraft(A1_ORIGINAL);
    expect(A1_ORIGINAL).toContain('robin@example.test');
    expect(result.text).not.toContain('robin@example.test');
    expect(result.text).not.toContain('RAW-ORCHID');
    expect(
      result.excluded.some((item) => item.reason === 'Email address'),
    ).toBe(true);
    expect(
      result.excluded.some(
        (item) => item.reason === 'Synthetic scratch marker',
      ),
    ).toBe(true);
    expect(result.text).toContain('10:18 Search timed out again.');
  });

  it('rejects empty and oversized inputs without truncating them', () => {
    expect(validateOriginal('   ')).toMatch(/Add incident notes/);
    expect(validateOriginal('x'.repeat(12_001))).toMatch(/Shorten the text/);
    expect(validateSharingCopy('')).toMatch(/empty/);
  });

  it('blocks approval when a sensitive pattern remains in the sharing copy', () => {
    expect(validateSharingCopy('Contact: robin@example.test')).toMatch(
      /sensitive patterns/,
    );
    expect(validateSharingCopy('Token: abc123secret')).toMatch(
      /sensitive patterns/,
    );
  });

  it('formats the four handoff fields in a stable order', () => {
    const result = handoffAsText(A1_EXPECTED);
    expect(result.indexOf('Observed impact')).toBeLessThan(
      result.indexOf('Actions and results'),
    );
    expect(result).toContain('Open questions');
    expect(result).toContain('Next step');
  });
});

import { A2_ORIGINAL, A3_ORIGINAL } from './examples';
import { findSensitiveItems, validateHandoffFidelity } from './relay';

describe('synthetic case preservation (rules, not inference)', () => {
  it('preserves all A1 timestamps and the unchecked hypothesis', () => {
    const draft = buildSafeDraft(A1_ORIGINAL);
    for (const time of ['10:02', '10:05', '10:10', '10:18'])
      expect(draft.text).toContain(time);
    expect(draft.text).toContain('suspected; not checked');
    expect(() =>
      validateHandoffFidelity(A1_EXPECTED, draft.text),
    ).not.toThrow();
    expect(() =>
      validateHandoffFidelity(
        {
          ...A1_EXPECTED,
          openQuestions: 'The config change is the confirmed root cause.',
        },
        draft.text,
      ),
    ).toThrow(/suspected/);
  });
  it('retains A2 conflicting reports and adjacent probe facts', () => {
    const { text } = buildSafeDraft(A2_ORIGINAL);
    expect(text).toContain(
      '08:49 Support agent reported one ticket still waiting 110 seconds; dashboard and report conflict.',
    );
    expect(text).toContain('08:55 Queue wait exceeded 90 seconds again.');
    expect(text).not.toContain('192.0.2.18');
    expect(text).not.toContain('casey@example.test');
  });
  it('retains A3 uncertainty and excludes both private markers', () => {
    const { text, excluded } = buildSafeDraft(A3_ORIGINAL);
    expect(text).not.toContain('RAW-LOTOS-TEST');
    expect(text).not.toContain('silver teacup');
    expect(excluded.map((item) => item.value)).toContain('silver teacup');
    expect(text).toContain(
      'No confirmation that the 202 event was processed downstream.',
    );
  });
  it('requires an explicit missing-next-step statement when no action was recorded', () => {
    const text = 'No follow-up action was recorded before shift change.';
    const result = {
      ...A1_EXPECTED,
      observedImpact: 'Unknown.',
      actionsAndResults: 'None recorded.',
      openQuestions: 'Response unknown.',
      nextStep: 'No next step recorded.',
    };
    expect(() => validateHandoffFidelity(result, text)).not.toThrow();
    expect(() =>
      validateHandoffFidelity(
        { ...result, nextStep: 'Restart the service.' },
        text,
      ),
    ).toThrow(/next step/);
  });
  it('does not lose incident facts while removing contacts, credentials and phone numbers', () => {
    const result = buildSafeDraft(
      '10:02 failed; owner a@example.test; token=private\nCall +52 331 234 5678',
    );
    expect(result.text).toContain('10:02 failed');
    expect(findSensitiveItems(result.text)).toHaveLength(0);
    expect(result.text).not.toContain('private');
  });
  it('retains correct line numbers with CRLF and emoji', () => {
    const result = buildSafeDraft(
      '😀 observed\r\n10:02 failed a@example.test\r\n10:05 retried',
    );
    expect(result.excluded[0].line).toBe(2);
    expect(result.text).toContain('10:02 failed');
    expect(result.text).toContain('10:05 retried');
  });
  it('detects repeated identifiers without regex state leaking between requests', () => {
    expect(findSensitiveItems('a@example.test a@example.test')).toHaveLength(2);
    expect(findSensitiveItems('a@example.test')).toHaveLength(1);
  });
  it('rejects missing or invented timestamps', () => {
    expect(() =>
      validateHandoffFidelity(
        { ...A1_EXPECTED, actionsAndResults: 'Restarted.' },
        buildSafeDraft(A1_ORIGINAL).text,
      ),
    ).toThrow(/timestamps/);
    expect(() =>
      validateHandoffFidelity(
        { ...A1_EXPECTED, nextStep: 'Investigate at 10:30.' },
        buildSafeDraft(A1_ORIGINAL).text,
      ),
    ).toThrow(/timestamps/);
  });
});

it('does not reject explicitly unconfirmed or unknown causes', () => {
  for (const openQuestions of [
    'The suspected cause is not confirmed.',
    'The cause is not yet confirmed.',
    'The root cause is unknown.',
    'The cause remains unconfirmed.',
  ]) {
    expect(() =>
      validateHandoffFidelity(
        { ...A1_EXPECTED, openQuestions },
        buildSafeDraft(A1_ORIGINAL).text,
      ),
    ).not.toThrow();
  }
});
