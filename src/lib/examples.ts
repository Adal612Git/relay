import a1 from '../../examples/a1.json' with { type: 'json' };
import a2 from '../../examples/a2.json' with { type: 'json' };
import a3 from '../../examples/a3.json' with { type: 'json' };

export const EXAMPLES = [a1, a2, a3] as const;
export const A1_ORIGINAL = a1.originalNotes.join('\n');
export const A2_ORIGINAL = a2.originalNotes.join('\n');
export const A3_ORIGINAL = a3.originalNotes.join('\n');
export const A1_EXPECTED = a1.expectedHandoff;
