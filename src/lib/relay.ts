import type { ExcludedItem, Handoff, SafeDraft } from './types';

export const MAX_ORIGINAL_LENGTH = 12_000;
export const MAX_SHARING_LENGTH = 6_000;

const SENSITIVE_PATTERNS: Array<{ reason: string; pattern: RegExp }> = [
  {
    reason: 'Email address',
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  },
  {
    reason: 'Credential-like value',
    pattern: /\b(?:api[_-]?key|token|secret|password)\s*[:=]\s*[^\s,;]+/gi,
  },
  {
    reason: 'Synthetic scratch marker',
    pattern: /\b(?:RAW|CASE)-[A-Z0-9-]+\b/gi,
  },
  {
    reason: 'Phone number',
    pattern: /(?<![\d:])(?:\+?\d[ .()-]*){9,15}(?![\d:])/g,
  },
  {
    reason: 'IPv4 address',
    pattern:
      /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g,
  },
];

function lineMatches(line: string): Array<{ value: string; reason: string }> {
  const matches: Array<{ value: string; reason: string }> = [];
  for (const item of SENSITIVE_PATTERNS) {
    const pattern = new RegExp(item.pattern.source, item.pattern.flags);
    for (const match of line.matchAll(pattern)) {
      if (match[0]) matches.push({ value: match[0], reason: item.reason });
    }
  }
  return matches;
}

export function buildSafeDraft(original: string): SafeDraft {
  const lines = original.split(/\r\n|\r|\n/);
  const excluded: ExcludedItem[] = [];
  const kept: string[] = [];

  lines.forEach((line, index) => {
    const matches = lineMatches(line);
    const privateLine = /keep this out of the handoff:/i.test(line);
    if (privateLine) {
      for (const match of line.matchAll(/"([^"\n]+)"/g)) {
        matches.push({ value: match[1], reason: 'Explicit exclusion' });
      }
    }
    matches.forEach((match) =>
      excluded.push({
        line: index + 1,
        value: match.value,
        reason: match.reason,
      }),
    );
    if (privateLine) return;
    // Replace identifiers in place so facts on the same line are retained.
    let safeLine = line;
    for (const { value } of matches)
      safeLine = safeLine.replaceAll(value, '[removed]');
    kept.push(safeLine);
  });

  return { text: kept.join('\n').trim(), excluded };
}

export function validateOriginal(notes: string): string | null {
  if (!notes.trim()) return 'Add incident notes before analyzing.';
  if (notes.length > MAX_ORIGINAL_LENGTH)
    return `Notes exceed ${MAX_ORIGINAL_LENGTH.toLocaleString()} characters. Shorten the text without losing the timeline.`;
  return null;
}

export function findSensitiveItems(text: string): ExcludedItem[] {
  return text.split(/\r\n|\r|\n/).flatMap((line, index) =>
    lineMatches(line).map((match) => ({
      line: index + 1,
      value: match.value,
      reason: match.reason,
    })),
  );
}

export function validateSharingCopy(copy: string): string | null {
  if (!copy.trim()) return 'The sharing copy is empty.';
  if (copy.length > MAX_SHARING_LENGTH)
    return `The sharing copy exceeds ${MAX_SHARING_LENGTH.toLocaleString()} characters.`;
  if (findSensitiveItems(copy).length > 0)
    return 'Potentially sensitive patterns remain in the sharing copy. Remove or rewrite them before approval.';
  return null;
}

export function handoffAsText(handoff: Handoff): string {
  return [
    `Observed impact\n${handoff.observedImpact}`,
    `Actions and results\n${handoff.actionsAndResults}`,
    `Open questions\n${handoff.openQuestions}`,
    `Next step\n${handoff.nextStep}`,
  ].join('\n\n');
}

export function emptyHandoff(): Handoff {
  return {
    observedImpact: '',
    actionsAndResults: '',
    openQuestions: '',
    nextStep: '',
  };
}

// Conservative structural checks, not a proof of semantic correctness. Human review is required.
export function validateHandoffFidelity(
  handoff: Handoff,
  approvedText: string,
): void {
  const output = Object.values(handoff).join('\n');
  if (findSensitiveItems(output).length)
    throw new Error('The handoff contains sensitive patterns.');
  const sourceTimes = new Set(approvedText.match(/\b\d{1,2}:\d{2}\b/g) ?? []);
  const resultTimes = new Set(output.match(/\b\d{1,2}:\d{2}\b/g) ?? []);
  if (
    [...sourceTimes].some((time) => !resultTimes.has(time)) ||
    [...resultTimes].some((time) => !sourceTimes.has(time))
  ) {
    throw new Error('The handoff changed or omitted recorded timestamps.');
  }
  if (
    /suspect|maybe|could be/i.test(approvedText) &&
    /(?<!not )(?<!not yet )\bconfirmed\b|\b(?:definitive cause|was caused by|fully resolved)\b|\broot cause is (?!unknown|unconfirmed|not\b)/i.test(
      output,
    )
  ) {
    throw new Error('A suspected cause must not be presented as confirmed.');
  }
  if (
    /no (?:follow-up action|next step) (?:was )?recorded/i.test(approvedText) &&
    !/^No next step recorded\.$/i.test(handoff.nextStep.trim())
  ) {
    throw new Error('No next step is recorded in the approved notes.');
  }
}
