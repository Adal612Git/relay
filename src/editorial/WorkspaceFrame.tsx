import type { ReactNode, Ref } from 'react';
import type { InferenceSource } from '../lib/types';
import type { IncidentWorkspace } from '../useIncidentWorkspace';

export const stages = [
  { id: 'capture', label: 'Capture', number: '01' },
  { id: 'review', label: 'Review', number: '02' },
  { id: 'handoff', label: 'Handoff', number: '03' },
] as const;

export type Stage = (typeof stages)[number]['id'];

export function WorkspaceFrame({
  stage,
  move,
  clear,
  status,
  inspector,
  children,
}: {
  stage: Stage;
  move: (next: Stage) => void;
  clear: () => void;
  status: string;
  inspector: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="workspace">
      <a className="skip-link" href="#workspace-title">
        Skip to workspace
      </a>
      <header className="masthead">
        <div className="signature">
          <span className="wordmark">
            relay<span>.</span>
          </span>
          <span className="imprint meta">By LOTOS</span>
        </div>
        <span className="system-name meta">Incident handoff system</span>
      </header>
      <div className="workspace-grid">
        <nav className="stage-index" aria-label="Incident stages">
          <ol>
            {stages.map(({ id, label, number }) => (
              <li key={id}>
                <button
                  type="button"
                  aria-current={id === stage ? 'step' : undefined}
                  onClick={() => move(id)}
                >
                  <span className="stage-index-number" aria-hidden="true">
                    {number}
                  </span>
                  {label}
                </button>
              </li>
            ))}
          </ol>
          <p className="principle">
            Private processing.
            <br />
            Human judgment.
          </p>
        </nav>
        <main
          className="stage"
          data-stage={stage}
          aria-labelledby="workspace-title"
        >
          {children}
        </main>
        {inspector}
      </div>
      <footer className="workspace-footer">
        <div className="session-feedback">
          <div className="session-status" role="status" aria-live="polite">
            <span className="meta">Session</span>
            <span>{status}</span>
          </div>
        </div>
        <button
          type="button"
          className="text-action clear-action"
          onClick={clear}
        >
          Clear incident
        </button>
      </footer>
    </div>
  );
}

export function StageTitle({
  stage,
  title,
  summary,
  headingRef,
}: {
  stage: Stage;
  title: string;
  summary: string;
  headingRef: Ref<HTMLHeadingElement>;
}) {
  const entry = stages.find(({ id }) => id === stage)!;
  return (
    <header className="stage-title">
      <div>
        <p className="stage-label meta">{entry.label}</p>
        <h1 ref={headingRef} tabIndex={-1} id="workspace-title">
          {title}
        </h1>
        <p className="stage-summary">{summary}</p>
      </div>
      <span className="stage-number" aria-hidden="true">
        {entry.number}
      </span>
    </header>
  );
}

export function approvalLabel(session: IncidentWorkspace) {
  if (session.isApproved) return 'Approved';
  return session.approvalRevoked ? 'Revoked' : 'Pending';
}

function inferenceLabel(source: InferenceSource | null) {
  if (source === 'on_device') return 'ON_DEVICE';
  if (source === 'in_cloud') return 'IN_CLOUD';
  return source === null ? 'Awaiting inference' : 'Source unavailable';
}

export function PrivacyInspector({ session }: { session: IncidentWorkspace }) {
  const prepared = session.copyPrepared || Boolean(session.sharingCopy.trim());
  const eligible = session.isApproved && session.runtime.appCheckReady;

  return (
    <aside className="privacy-inspector" aria-labelledby="privacy-title">
      <h2 id="privacy-title" className="meta">
        <span aria-hidden="true" />
        Privacy inspector
      </h2>
      <dl>
        <div>
          <dt>Original</dt>
          <dd>Local device only</dd>
        </div>
        <div>
          <dt>Sharing copy</dt>
          <dd>{prepared ? 'Prepared' : 'Not prepared'}</dd>
        </div>
        <div>
          <dt>Human approval</dt>
          <dd data-approval={approvalLabel(session).toLowerCase()}>
            {approvalLabel(session)}
          </dd>
        </div>
        <div className="privacy-boundary">
          <dt>Device / cloud boundary</dt>
          <dd>
            {eligible
              ? 'Approved copy eligible'
              : 'Cloud inference not authorized'}
          </dd>
        </div>
        <div>
          <dt>Last inference</dt>
          <dd className="inference-value">
            {inferenceLabel(session.lastInference)}
          </dd>
        </div>
      </dl>
      <p>
        Cloud access requires App Check. Only the exact approved copy is
        eligible to leave this device.
      </p>
    </aside>
  );
}
