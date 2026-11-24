import { describe, expect, it } from 'vitest';
import { buildSafeDraft, validateSharingCopy } from './relay';

// All identifiers and credentials in these regressions are fictional.
describe('Privacy boundary adversarial cases (R04/R05)', () => {
  it.each([
    ['Bearer authorization', 'Authorization: Bearer synthetic-example-value'],
    ['IPv6 documentation address', 'Host 2001:db8::15 reported a timeout'],
    ['Unicode fullwidth email dot', 'Contact analyst@example．test'],
    ['internationalized email', 'Contact féi@例え。テスト'],
    ['IPv6 with embedded IPv4', 'Probe [::ffff:192.0.2.15]:443 responded'],
    ['IPv6 with zone', 'Probe fe80::e1%eth0 timed out'],
    ['uncompressed IPv6', 'Probe 2001:db8:0:1:2:3:4:5 timed out'],
    ['standalone Bearer', 'bearer synthetic.value-01'],
    ['quoted credential', 'Client secret = "synthetic with spaces"'],
    ['private tag variant', 'ＰＲＩＶＡＴＥ‑violet'],
    ['labeled account ID', 'customer_id=synthetic-violet'],
    ['standalone private directive', '[private] fictional violet pin'],
  ])('blocks %s from approval until reviewed/redacted', (_name, copy) => {
    expect(validateSharingCopy(copy)).toMatch(/sensitive patterns/);
  });

  it('does not include a plain-text credential in a sharing draft', () => {
    const draft = buildSafeDraft(
      '10:02 Timeout\ntoken: synthetic-example-value\n10:05 Restart',
    );
    expect(draft.text).not.toContain('synthetic-example-value');
    expect(draft.text).toContain('10:02 Timeout');
    expect(draft.text).toContain('10:05 Restart');
  });

  it('removes overlapping IP matches and preserves nearby facts', () => {
    const draft = buildSafeDraft(
      '10:05 [::ffff:192.0.2.15]:443 returned HTTP 503; Bearer fictional-credential.',
    );
    expect(draft.text).toContain('10:05 [');
    expect(draft.text).toContain('returned HTTP 503');
    expect(draft.text).not.toMatch(/ffff|192\.0|fictional-credential/);
    expect(validateSharingCopy(draft.text)).toBeNull();
  });

  it('removes explicit exclusions wherever they recur and leaves public facts', () => {
    const draft = buildSafeDraft(
      '10:05 Inspect violet pin; retry still pending.\nDo not share: violet pin\n[private] “orchid phrase”',
    );
    expect(draft.text).toBe('10:05 Inspect [removed]; retry still pending.');
    expect(draft.excluded).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: 'violet pin',
          reason: 'Explicit exclusion',
        }),
        expect.objectContaining({
          value: 'orchid phrase',
          reason: 'Explicit exclusion',
        }),
      ]),
    );
  });

  it('preserves exact original text when preparing a sharing draft', () => {
    const original = '10:02 Timeout\nContact analyst@example.test';
    buildSafeDraft(original);
    expect(original).toBe('10:02 Timeout\nContact analyst@example.test');
  });
});
