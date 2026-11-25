import { describe, expect, it } from 'vitest';
import {
  MAX_ORIGINAL_LENGTH,
  MAX_SHARING_LENGTH,
  buildSafeDraft,
  findSensitiveItems,
  validateOriginal,
  validateSharingCopy,
} from './relay';

describe('Relay regression: input boundaries and sharing copy', () => {
  it('accepts exactly 12,000 original characters and rejects 12,001', () => {
    expect(validateOriginal('x'.repeat(MAX_ORIGINAL_LENGTH))).toBeNull();
    expect(validateOriginal('x'.repeat(MAX_ORIGINAL_LENGTH + 1))).toMatch(
      /exceed/,
    );
    expect(validateOriginal(' \n\t ')).toMatch(/Add incident notes/);
  });

  it('accepts exactly 6,000 sharing characters and rejects 6,001', () => {
    expect(validateSharingCopy('x'.repeat(MAX_SHARING_LENGTH))).toBeNull();
    expect(validateSharingCopy('x'.repeat(MAX_SHARING_LENGTH + 1))).toMatch(
      /exceeds/,
    );
    expect(validateSharingCopy('\n\t ')).toMatch(/empty/);
  });

  it('rejects common synthetic sensitive markers before approval', () => {
    for (const value of [
      'Contact robin@example.test',
      'token: synthetic123',
      'api_key=synthetic123',
      'password: synthetic123',
      'RAW-ORCHID',
      'IP 192.0.2.10',
    ]) {
      expect(validateSharingCopy(value), value).toMatch(/sensitive patterns/);
    }
  });

  it('does not mutate original notes and preserves incident facts on a redacted line', () => {
    const original = [
      '10:02 Search timed out.',
      'Contact robin@example.test; 10:05 worker restarted.',
      '10:10 Search succeeded.',
      'RAW-ORCHID',
      '10:18 Search timed out again.',
    ].join('\n');
    const before = original;
    const draft = buildSafeDraft(original);
    expect(original).toBe(before);
    expect(draft.text).toContain('10:02 Search timed out.');
    expect(draft.text).toContain('10:18 Search timed out again.');
    expect(draft.text).not.toContain('robin@example.test');
    expect(draft.text).not.toContain('RAW-ORCHID');
    expect(draft.text).toContain('10:05 worker restarted.');
    expect(draft.excluded).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ line: 2, reason: 'Email address' }),
        expect.objectContaining({
          line: 4,
          reason: 'Synthetic scratch marker',
        }),
      ]),
    );
  });

  it('reports no synthetic sensitive markers in the safe draft', () => {
    const draft = buildSafeDraft(
      '10:02 timeout\nIP 192.0.2.10\n10:18 timeout again',
    );
    expect(findSensitiveItems(draft.text)).toEqual([]);
  });
});
