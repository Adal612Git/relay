import { validateSharingCopy } from './relay';

// Capabilities are deliberately not serializable approvals. Only this module issues them.
export interface ApprovedCopy {
  readonly text: string;
}
const approvals = new WeakMap<ApprovedCopy, () => boolean>();

export function requireApprovedCopy(copy: ApprovedCopy): string {
  if (!copy || !approvals.get(copy)?.()) {
    throw new Error(
      'Approve the exact sharing copy before generating a handoff.',
    );
  }
  const error = validateSharingCopy(copy.text);
  if (error) throw new Error(error);
  return copy.text;
}

export class IncidentSession {
  private revision = 0;
  private active: object | null = null;
  private approved: ApprovedCopy | null = null;

  invalidate(): void {
    this.revision += 1;
    this.active = null;
    this.approved = null;
  }

  approve(text: string, excludedValues: string[] = []): ApprovedCopy {
    const error = validateSharingCopy(text);
    if (error) throw new Error(error);
    if (
      excludedValues.some((value) =>
        text.toLowerCase().includes(value.toLowerCase()),
      )
    ) {
      throw new Error('An excluded identifier remains in the sharing copy.');
    }
    const revision = this.revision;
    const copy = Object.freeze({ text });
    this.approved = copy;
    approvals.set(
      copy,
      () => this.revision === revision && this.approved === copy,
    );
    return copy;
  }

  isBusy(): boolean {
    return this.active !== null;
  }

  begin(): object | null {
    if (this.active) return null;
    this.active = {};
    return this.active;
  }

  isCurrent(request: object): boolean {
    return this.active === request;
  }
  finish(request: object): boolean {
    if (!this.isCurrent(request)) return false;
    this.active = null;
    return true;
  }
}
