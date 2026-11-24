import type { ExcludedItem, Handoff, SafeDraft } from './types';

export const MAX_ORIGINAL_LENGTH = 12_000;
export const MAX_SHARING_LENGTH = 6_000;

const SENSITIVE_PATTERNS: Array<{ reason: string; pattern: RegExp }> = [
  {
    reason: 'Email address',
    pattern:
      /[\p{L}\p{N}\p{M}._%+-]+@(?:[\p{L}\p{N}\p{M}-]+\.)+[\p{L}\p{N}\p{M}-]{2,}/gu,
  },
  {
    reason: 'Authorization credential',
    pattern:
      /\b(?:(?:proxy[- _]?)?authorization["']?\s*[:=]\s*["']?)?(?:bearer|basic)\s+[A-Z0-9._~+/%=-]+/gi,
  },
  {
    reason: 'Credential-like value',
    pattern:
      /\b(?:api[- _]?key|(?:access|refresh|auth|id|session)[- _]?token|client[- _]?secret|token|secret|password|passwd|pwd|credential)\b["']?\s*[:=]\s*(?:"[^"\n]+"|'[^'\n]+'|[^\s,;]+)/gi,
  },
  {
    reason: 'Token format',
    pattern:
      /\b(?:eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AIza[A-Za-z0-9_-]{35})\b/g,
  },
  {
    reason: 'Synthetic scratch marker',
    pattern: /\b(?:RAW|CASE|PRIVATE)\s*[-_]\s*[A-Z0-9]+(?:[-_][A-Z0-9]+)*/gi,
  },
  {
    reason: 'Labeled private identifier',
    pattern:
      /\b(?:account|customer|user|tenant|session|case|employee|device|client|incident)[- _]?id\b\s*[:=]\s*[\p{L}\p{N}_.-]+/giu,
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

const EXPLICIT =
  /\b(?:keep (?:this|it) out of (?:the )?handoff|(?:do not|don't|never) (?:share|include)|exclude(?: from (?:the )?handoff)?|private(?: only| note)?|internal only)\s*:\s*|\[(?:private|do not share|exclude)\]\s*:?\s*/i;
const IPV6_CANDIDATE =
  /(?<![\w:])(?:[a-f0-9]{0,4}:){2,}(?:\d{1,3}(?:\.\d{1,3}){3}|[a-f0-9]{0,4})(?:%[\w.-]+)?(?![\w:])/gi;

function normalized(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060\u2066-\u2069\uFEFF]/g, '')
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/\u3002/g, '.');
}

export function hasExcludedValue(
  text: string,
  values: readonly string[],
): boolean {
  const comparable = (value: string) =>
    normalized(value).toLowerCase().replace(/\s+/g, ' ');
  const copy = comparable(text);
  return values.some((value) => copy.includes(comparable(value)));
}

function isIPv6(candidate: string): boolean {
  const address = candidate.split('%', 1)[0];
  const parts = address.split('::');
  if (parts.length > 2) return false;
  const groups = parts.flatMap((part) => (part ? part.split(':') : []));
  const tail = groups.at(-1);
  if (tail?.includes('.')) {
    if (tail.split('.').some((octet) => Number(octet) > 255)) return false;
    groups.splice(-1, 1, '0', '0');
  }
  if (groups.some((group) => !/^[a-f0-9]{1,4}$/i.test(group))) return false;
  return parts.length === 2 ? groups.length < 8 : groups.length === 8;
}

type Match = { value: string; reason: string; start: number; end: number };

function lineMatches(line: string): Match[] {
  const matches: Match[] = [];
  for (const { reason, pattern } of [
    { reason: 'IPv6 address', pattern: IPV6_CANDIDATE },
    ...SENSITIVE_PATTERNS,
  ]) {
    for (const match of line.matchAll(pattern)) {
      if (pattern === IPV6_CANDIDATE && !isIPv6(match[0])) continue;
      matches.push({
        value: match[0],
        reason,
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }
  return matches.sort(
    (first, second) => first.start - second.start || second.end - first.end,
  );
}

function explicitValues(line: string, directive: RegExpMatchArray): string[] {
  const payload = line
    .slice((directive.index ?? 0) + directive[0].length)
    .trim();
  const quoted = [...payload.matchAll(/["“]([^"”]+)["”]/g)].map(
    (match) => match[1],
  );
  return [...new Set([...(payload ? [payload] : []), ...quoted])];
}

export function buildSafeDraft(original: string): SafeDraft {
  const excluded: ExcludedItem[] = [];
  const kept: string[] = [];

  original.split(/\r\n|\r|\n/).forEach((input, index) => {
    const line = normalized(input);
    const matches = lineMatches(line);
    const directive = line.match(EXPLICIT);
    for (const { value, reason } of matches)
      excluded.push({ line: index + 1, value, reason });
    if (directive) {
      for (const value of explicitValues(line, directive)) {
        excluded.push({ line: index + 1, value, reason: 'Explicit exclusion' });
      }
      return;
    }

    // Overlapping matches can occur in an IPv4-mapped IPv6 address.
    let end = 0;
    let safeLine = '';
    for (const match of matches) {
      if (match.start >= end)
        safeLine += line.slice(end, match.start) + '[removed]';
      end = Math.max(end, match.end);
    }
    kept.push(safeLine + line.slice(end));
  });

  const text = kept.join('\n').trim();
  // A quoted or unquoted exclusion may be repeated on another line.
  const values = excluded
    .filter((item) => item.reason === 'Explicit exclusion')
    .map((item) => item.value);
  let safeText = text;
  for (const value of values) {
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    safeText = safeText.replace(new RegExp(escaped, 'giu'), '[removed]');
  }
  return { text: safeText, excluded };
}

export function validateOriginal(notes: string): string | null {
  if (!notes.trim()) return 'Add incident notes before analyzing.';
  if (notes.length > MAX_ORIGINAL_LENGTH)
    return `Notes exceed ${MAX_ORIGINAL_LENGTH.toLocaleString()} characters. Shorten the text without losing the timeline.`;
  return null;
}

export function findSensitiveItems(text: string): ExcludedItem[] {
  return text.split(/\r\n|\r|\n/).flatMap((input, index) => {
    const line = normalized(input);
    const matches = lineMatches(line).map(({ value, reason }) => ({
      line: index + 1,
      value,
      reason,
    }));
    if (EXPLICIT.test(line))
      matches.push({
        line: index + 1,
        value: line,
        reason: 'Explicit exclusion',
      });
    return matches;
  });
}

export function validateSharingCopy(copy: string): string | null {
  if (!copy.trim()) return 'The sharing copy is empty.';
  if (copy.length > MAX_SHARING_LENGTH)
    return `The sharing copy exceeds ${MAX_SHARING_LENGTH.toLocaleString()} characters.`;
  if (findSensitiveItems(copy).length > 0)
    return 'Potentially sensitive patterns remain in the sharing copy. Remove or rewrite them before approval.';
  return null;
}

export function handoffErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const failure = error as Error & {
      code?: string;
      customData?: { status?: number };
    };
    const status = failure.customData?.status;
    if (failure.code === 'relay/app-check' || status === 401 || status === 403)
      return 'Firebase could not authorize this request. Check App Check or write the handoff manually.';
    if (status === 429)
      return 'The Firebase quota is temporarily exhausted. Wait and retry, or write the handoff manually.';
    if (failure.code === 'ai/fetch-error' || status === 503)
      return 'Firebase could not be reached. Check the connection and retry, or write the handoff manually.';
  }
  return 'Handoff generation failed. Review your draft and try again, or write the fields manually.';
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
    /suspect|maybe|could be|\bmay (?:be|have)\b|\bunconfirmed\b|\bno .{0,30} confirmed\b/i.test(
      approvedText,
    ) &&
    /\b(?:confirmed (?:root )?cause|confirmed that .{1,70} caused|definitive cause|was caused by|fully resolved)\b|\broot cause is (?!unknown|unconfirmed|not\b|unclear|undetermined|still\b)/i.test(
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
