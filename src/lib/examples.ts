import type { Handoff } from './types';

export const A1_ORIGINAL = [
  '10:02 Search timed out at the support desk.',
  '10:05 Worker restarted.',
  '10:10 First successful search.',
  '10:18 Search timed out again.',
  'Morning config change suspected; not checked.',
  'Contact: robin@example.test',
  'Scratch tag: RAW-ORCHID',
  'Next shift: compare worker errors at 10:02 and 10:18 with the change record.',
].join('\n');

export const A1_EXPECTED: Handoff = {
  observedImpact:
    'Search timed out at 10:02 and again at 10:18 at the support desk.',
  actionsAndResults:
    'Worker restarted at 10:05. First success at 10:10, five minutes later. Recovery was temporary.',
  openQuestions:
    'The morning config change is suspected. The change record has not been checked.',
  nextStep: 'Compare worker errors at 10:02 and 10:18 with the change record.',
};

export const A2_ORIGINAL = [
  'Queue dashboard: 24 waiting at 14:00. Probe address 192.0.2.18.',
  '14:03 agent call: “My screen shows zero waiting.” Scope on that screen unknown.',
  '14:06 refreshed the dashboard; still 24. No reconcile run logged.',
  'CASE-AMBER / contact queue.ops@example.test',
  'Could be a stale dashboard. We have not checked its update time.',
  'Next shift: compare both views for the same queue and timestamp.',
].join('\n');

export const A3_ORIGINAL = [
  '16:40 — One test receipt did not arrive in the test inbox.',
  '16:46 — Sent one new test receipt. The new one arrived at 16:48.',
  'Keep this out of the handoff: RAW-COBALT and "silver teacup".',
  'No trace for the first receipt. No wider delivery count was taken.',
  'No follow-up action was recorded before shift change.',
].join('\n');
