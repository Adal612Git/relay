import { describe, expect, it } from 'vitest';
import { A1_ORIGINAL } from './examples';
import { buildSafeDraft, handoffAsText, validateOriginal, validateSharingCopy } from './relay';
import { A1_EXPECTED } from './examples';

describe('Relay privacy helpers', () => {
  it('keeps the original unchanged while identifying synthetic contact and scratch markers', () => {
    const result = buildSafeDraft(A1_ORIGINAL);
    expect(A1_ORIGINAL).toContain('robin@example.test');
    expect(result.text).not.toContain('robin@example.test');
    expect(result.text).not.toContain('RAW-ORCHID');
    expect(result.excluded.some((item) => item.reason === 'Email address')).toBe(true);
    expect(result.excluded.some((item) => item.reason === 'Synthetic scratch marker')).toBe(true);
    expect(result.text).toContain('10:18 Search timed out again.');
  });

  it('rejects empty and oversized inputs without truncating them', () => {
    expect(validateOriginal('   ')).toMatch(/Add incident notes/);
    expect(validateOriginal('x'.repeat(12_001))).toMatch(/Shorten the text/);
    expect(validateSharingCopy('')).toMatch(/empty/);
  });

  it('blocks approval when a sensitive pattern remains in the sharing copy', () => {
    expect(validateSharingCopy('Contact: robin@example.test')).toMatch(/sensitive patterns/);
    expect(validateSharingCopy('Token: abc123secret')).toMatch(/sensitive patterns/);
  });

  it('formats the four handoff fields in a stable order', () => {
    const result = handoffAsText(A1_EXPECTED);
    expect(result.indexOf('Observed impact')).toBeLessThan(result.indexOf('Actions and results'));
    expect(result).toContain('Open questions');
    expect(result).toContain('Next step');
  });
});
