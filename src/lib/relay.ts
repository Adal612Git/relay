import type { ExcludedItem, Handoff, SafeDraft } from './types';

export const MAX_ORIGINAL_LENGTH = 12_000;
export const MAX_SHARING_LENGTH = 6_000;

const SENSITIVE_PATTERNS: Array<{ reason: string; pattern: RegExp }> = [
  { reason: 'Email address', pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  { reason: 'Credential-like value', pattern: /\b(?:api[_-]?key|token|secret|password)\s*[:=]\s*[^\s,;]+/gi },
  { reason: 'Synthetic scratch marker', pattern: /\bRAW-[A-Z0-9-]+\b/gi },
  { reason: 'IPv4 address', pattern: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g },
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
    if (matches.length > 0) {
      matches.forEach((match) => excluded.push({ line: index + 1, value: match.value, reason: match.reason }));
      // The original remains untouched; omit the matched line from the sharing copy.
      return;
    }
    kept.push(line);
  });

  return { text: kept.join('\n').trim(), excluded };
}

export function validateOriginal(notes: string): string | null {
  if (!notes.trim()) return 'Add incident notes before analyzing.';
  if (notes.length > MAX_ORIGINAL_LENGTH) return `Notes exceed ${MAX_ORIGINAL_LENGTH.toLocaleString()} characters. Shorten the text without losing the timeline.`;
  return null;
}

export function findSensitiveItems(text: string): ExcludedItem[] {
  return text.split(/\r\n|\r|\n/).flatMap((line, index) =>
    lineMatches(line).map((match) => ({ line: index + 1, value: match.value, reason: match.reason })),
  );
}

export function validateSharingCopy(copy: string): string | null {
  if (!copy.trim()) return 'The sharing copy is empty.';
  if (copy.length > MAX_SHARING_LENGTH) return `The sharing copy exceeds ${MAX_SHARING_LENGTH.toLocaleString()} characters.`;
  if (findSensitiveItems(copy).length > 0) return 'Potentially sensitive patterns remain in the sharing copy. Remove or rewrite them before approval.';
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
