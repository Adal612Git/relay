import { describe, expect, it } from 'vitest';
import a1 from '../../examples/a1.json';
import a2 from '../../examples/a2.json';
import a3 from '../../examples/a3.json';
import { buildSafeDraft, handoffAsText, validateSharingCopy } from './relay';

const fixtures = [a1, a2, a3] as const;
const fields = ['observedImpact', 'actionsAndResults', 'openQuestions', 'nextStep'] as const;

describe('Synthetic incident fidelity fixtures A1–A3', () => {
  for (const fixture of fixtures) {
    it(`${fixture.id}: retains the original and excludes marked identifiers`, () => {
      const original = fixture.originalNotes.join('\n');
      const draft = buildSafeDraft(original);
      expect(fixture.synthetic).toBe(true);
      expect(fixture.originalNotes.join('\n')).toBe(original);
      for (const marker of fixture.expectedExclusions) {
        expect(original).toContain(marker);
        expect(draft.text).not.toContain(marker);
        expect(draft.excluded.some((item) => item.value === marker)).toBe(true);
      }
      expect(validateSharingCopy(draft.text)).toBeNull();
    });

    it(`${fixture.id}: expected handoff has four nonempty fields and no excluded markers`, () => {
      for (const field of fields) {
        expect(fixture.expectedHandoff[field].trim()).not.toBe('');
      }
      const output = handoffAsText(fixture.expectedHandoff);
      for (const marker of fixture.expectedExclusions) {
        expect(output).not.toContain(marker);
      }
    });
  }

  it('A1–A3: expected outputs preserve every recorded clock time and forbid unsupported claims', () => {
    for (const fixture of fixtures) {
      const source = fixture.originalNotes.join('\n');
      const output = handoffAsText(fixture.expectedHandoff);
      const sourceTimes = new Set(source.match(/\b\d{1,2}:\d{2}\b/g) ?? []);
      const outputTimes = new Set(output.match(/\b\d{1,2}:\d{2}\b/g) ?? []);
      expect(outputTimes, fixture.id).toEqual(sourceTimes);
      if ('forbiddenClaims' in fixture) {
        for (const claim of fixture.forbiddenClaims) {
          expect(output.toLowerCase(), fixture.id).not.toContain(claim.toLowerCase());
        }
      }
    }
  });

  it('A2: contradictory observations remain explicitly unresolved', () => {
    expect(a2.expectedHandoff.observedImpact).toMatch(/conflict/i);
    expect(a2.expectedHandoff.openQuestions).toMatch(/unconfirmed/i);
    expect(a2.expectedHandoff.actionsAndResults).toMatch(/not sustained/i);
  });

  it('A3: provider status and HTTP 202 are not treated as confirmed delivery', () => {
    expect(a3.expectedHandoff.actionsAndResults).toMatch(/does not confirm/i);
    expect(a3.expectedHandoff.openQuestions).toMatch(/unconfirmed/i);
    expect(a3.expectedHandoff.nextStep).toMatch(/avoid duplicates/i);
  });
});
