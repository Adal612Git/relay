export type InferenceSource = 'on_device' | 'in_cloud' | 'unknown';

export interface Handoff {
  observedImpact: string;
  actionsAndResults: string;
  openQuestions: string;
  nextStep: string;
}

export interface ExcludedItem {
  line: number;
  value: string;
  reason: string;
}

export interface SafeDraft {
  text: string;
  excluded: ExcludedItem[];
}

export interface LocalReview {
  sharingCopy?: string;
  findings?: string[];
}

export interface AiResult<T> {
  value: T;
  source: InferenceSource;
}
