import { describe, expect, it } from 'vitest';
import { buildSafeDraft, validateSharingCopy } from './relay';

/**
 * Adversarial, entirely fictional input. These are RED regression tests:
 * current sensitive-pattern matching misses some formats.
 * Do not mark these as passing until CI executes them.
 */
describe('Privacy boundary adversarial cases (R04/R05)', () => {
  it.each([
    ['Bearer authorization', 'Authorization: Bearer synthetic-example-value'],
    ['IPv6 documentation address', 'Host 2001:db8::15 reported a timeout'],
    ['Unicode fullwidth email dot', 'Contact analyst@example．test'],
  ])('blocks %s from approval until reviewed/redacted', (_name, copy) => {
    expect(validateSharingCopy(copy)).toMatch(/sensitive patterns/);
  });

  it('does not include a plain-text credential in a sharing draft', () => {
    const draft = buildSafeDraft('10:02 Timeout\ntoken: synthetic-example-value\n10:05 Restart');
    expect(draft.text).not.toContain('synthetic-example-value');
    expect(draft.text).toContain('10:02 Timeout');
    expect(draft.text).toContain('10:05 Restart');
  });

  it('preserves exact original text when preparing a sharing draft', () => {
    const original = '10:02 Timeout\nContact analyst@example.test';
    buildSafeDraft(original);
    expect(original).toBe('10:02 Timeout\nContact analyst@example.test');
  });
});
