import { useRef, type Ref } from 'react';
import { EXAMPLES } from '../lib/examples';
import { MAX_ORIGINAL_LENGTH, MAX_SHARING_LENGTH } from '../lib/relay';
import type { IncidentWorkspace } from '../useIncidentWorkspace';
import { approvalLabel } from './WorkspaceFrame';

function IncidentDocument({
  id,
  label,
  caption,
  value,
  limit,
  error,
  placeholder,
  editorRef,
  update,
}: {
  id: string;
  label: string;
  caption: string;
  value: string;
  limit: number;
  error?: string | null;
  placeholder: string;
  editorRef?: Ref<HTMLTextAreaElement>;
  update?: (value: string) => void;
}) {
  return (
    <div className="incident-document">
      <div className="document-heading">
        <label htmlFor={id}>{label}</label>
        <span className="meta">{caption}</span>
      </div>
      <textarea
        id={id}
        ref={editorRef}
        rows={9}
        readOnly={!update}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error ${id}-count` : `${id}-count`}
        value={value}
        onChange={update ? (event) => update(event.target.value) : undefined}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
      />
      <div className="document-caption">
        {error && (
          <p id={`${id}-error`} className="field-error">
            {error}
          </p>
        )}
        <span className="meta" id={`${id}-count`}>
          {value.length.toLocaleString('en-US')} /{' '}
          {limit.toLocaleString('en-US')}
        </span>
      </div>
    </div>
  );
}

export function Capture({
  session,
  originalRef,
  analyze,
  prepare,
}: {
  session: IncidentWorkspace;
  originalRef: Ref<HTMLTextAreaElement>;
  analyze: () => void;
  prepare: () => void;
}) {
  const analyzing = session.operation === 'analysis';
  const localStatus = !session.runtime.app
    ? 'Local model unavailable in this setup'
    : analyzing
      ? session.progress === null
        ? 'Working on this device…'
        : `Preparing model ${Math.round(session.progress * 100)}%`
      : {
          idle: 'Awaiting analysis',
          complete: 'On-device analysis complete',
          unavailable: 'Local model unavailable',
        }[session.analysisOutcome];

  return (
    <>
      <IncidentDocument
        id="original-notes"
        label="Original incident notes"
        caption="Private original"
        value={session.original}
        limit={MAX_ORIGINAL_LENGTH}
        error={session.showOriginalError ? session.originalError : null}
        placeholder="Paste the timeline, observations, and actions…"
        editorRef={originalRef}
        update={session.editOriginal}
      />
      <div className="capture-tools">
        <div
          className="fixture-controls"
          role="group"
          aria-label="Synthetic examples"
        >
          <span className="meta">Synthetic examples</span>
          <div className="fixtures">
            {EXAMPLES.map((example) => (
              <button
                type="button"
                className="sample"
                key={example.id}
                title={example.title}
                aria-label={`Try ${example.id}`}
                onClick={() =>
                  session.editOriginal(example.originalNotes.join('\n'))
                }
              >
                {example.id}
              </button>
            ))}
          </div>
        </div>
        <div className="local-model">
          <span className="meta">Local analysis</span>
          <span>{localStatus}</span>
        </div>
      </div>
      {analyzing && (
        <progress
          aria-label="Preparing the on-device model"
          max={1}
          value={session.progress ?? undefined}
        />
      )}
      <div className="action-row">
        <button
          type="button"
          className="primary"
          onClick={analyze}
          disabled={
            session.busy ||
            Boolean(session.originalError) ||
            !session.runtime.app
          }
        >
          Analyze locally
        </button>
        <button
          type="button"
          className="secondary"
          onClick={prepare}
          disabled={Boolean(session.originalError)}
        >
          Prepare manually
        </button>
      </div>
    </>
  );
}

export function Review({
  session,
  openHandoff,
}: {
  session: IncidentWorkspace;
  openHandoff: () => void;
}) {
  const originalRef = useRef<HTMLTextAreaElement>(null);
  const approval = approvalLabel(session);

  function selectLine(number: number) {
    const editor = originalRef.current;
    if (!editor) return;
    // A textarea normalizes CRLF to LF. Its selection uses those DOM offsets.
    const lines = editor.value.split('\n');
    const start = lines
      .slice(0, number - 1)
      .reduce((offset, line) => offset + line.length + 1, 0);
    editor.focus();
    editor.setSelectionRange(start, start + (lines[number - 1]?.length ?? 0));
  }

  return (
    <>
      <div className="comparison">
        <IncidentDocument
          id="private-original"
          label="Original incident notes"
          caption="Local device only"
          value={session.original}
          limit={MAX_ORIGINAL_LENGTH}
          placeholder="Add incident notes in Capture."
          editorRef={originalRef}
        />
        <IncidentDocument
          id="sharing-copy"
          label="Sharing copy"
          caption="Editable"
          value={session.sharingCopy}
          limit={MAX_SHARING_LENGTH}
          error={session.showSharingError ? session.sharingError : null}
          placeholder="Prepare a copy in Capture, or write a sharing copy here."
          update={session.editSharing}
        />
      </div>
      <section className="annotations" aria-labelledby="exclusions-title">
        <h2 id="exclusions-title">
          Excluded from sharing copy
          {session.excluded.length > 0 && (
            <span className="meta">{session.excluded.length}</span>
          )}
        </h2>
        {session.excluded.length ? (
          <ul>
            {session.excluded.map(({ line, value, reason }, index) => (
              <li key={`${line}-${index}`}>
                <button
                  className="line-reference"
                  type="button"
                  onClick={() => selectLine(line)}
                >
                  Line {line}
                </button>
                <span>
                  <strong>{reason}</strong>
                  <span className="excluded-value">{value}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            No exclusions listed. Check the copy for other sensitive details.
          </p>
        )}
        {session.findings.length > 0 && (
          <details className="findings">
            <summary>Local model findings</summary>
            <ul>
              {session.findings.map((finding, index) => (
                <li key={index}>{finding}</li>
              ))}
            </ul>
          </details>
        )}
      </section>
      <div className="review-action">
        <div>
          <p
            className="approval-state meta"
            data-approval={approval.toLowerCase()}
          >
            {approval === 'Approved'
              ? 'Copy approved'
              : `Approval ${approval.toLowerCase()}`}
          </p>
          <p>
            Only the exact text you approve may be sent to the cloud. Editing
            revokes approval.
          </p>
        </div>
        <div className="action-row">
          <button
            type="button"
            className={session.isApproved ? 'secondary' : 'primary'}
            onClick={session.approve}
            disabled={
              session.busy ||
              Boolean(session.sharingError) ||
              session.isApproved
            }
          >
            Approve this text
          </button>
          {session.isApproved && (
            <button type="button" className="primary" onClick={openHandoff}>
              Open handoff <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
