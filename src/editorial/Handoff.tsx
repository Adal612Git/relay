import { handoffAsText } from '../lib/relay';
import type { Handoff as HandoffFields } from '../lib/types';
import type { IncidentWorkspace } from '../useIncidentWorkspace';

const sections: Array<{
  key: keyof HandoffFields;
  name: string;
  hint: string;
}> = [
  {
    key: 'observedImpact',
    name: 'Observed impact',
    hint: 'What changed for users or systems?',
  },
  {
    key: 'actionsAndResults',
    name: 'Actions and results',
    hint: 'What was tried, and what happened?',
  },
  {
    key: 'openQuestions',
    name: 'Open questions',
    hint: 'What is still uncertain?',
  },
  {
    key: 'nextStep',
    name: 'Next step',
    hint: 'What should the incoming shift do?',
  },
];

function handoffOrigin({ source, generated }: IncidentWorkspace) {
  if (source === 'on_device') return 'Generated on this device';
  if (source === 'in_cloud') return 'Generated in the cloud';
  return generated ? 'Source unavailable' : 'Manual entry';
}

export function Handoff({
  session,
  generate,
  review,
}: {
  session: IncidentWorkspace;
  generate: () => void;
  review: () => void;
}) {
  const generating = session.operation === 'generation';
  const origin =
    session.generated || session.handoffEdited
      ? handoffOrigin(session)
      : 'Awaiting handoff';
  const reviewState = session.reviewComplete
    ? 'Reviewed'
    : session.handoffEdited
      ? 'Edited draft'
      : session.generated
        ? 'Generated draft'
        : 'Draft';

  return (
    <>
      <div className="generation-bar">
        <div className="action-row">
          <button
            type="button"
            className="primary"
            disabled={!session.canGenerate}
            onClick={generate}
          >
            {generating ? 'Generating handoff…' : 'Generate handoff'}
          </button>
          {!session.isApproved && (
            <button type="button" className="text-action" onClick={review}>
              Review sharing copy <span aria-hidden="true">↗</span>
            </button>
          )}
        </div>
        {generating ? (
          <progress aria-label="Generating handoff" />
        ) : (
          <p>
            {!session.runtime.appCheckReady
              ? 'Continue with manual writing. Firebase App Check is required for hybrid generation.'
              : 'Generate from the approved copy or write the document by hand.'}
          </p>
        )}
      </div>
      <article className="handoff-document" aria-labelledby="document-title">
        <header>
          <div>
            <p className="meta">Relay / Shift handoff</p>
            <h2 id="document-title">Incident handoff</h2>
          </div>
          <div className="document-state">
            <p
              className="review-state meta"
              data-reviewed={session.reviewComplete}
            >
              {reviewState}
            </p>
            <p className="source-tag" data-source={session.source}>
              {origin}
            </p>
          </div>
        </header>
        {sections.map(({ key, name, hint }, index) => (
          <div className="handoff-section" key={key}>
            <span className="section-number meta" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <label htmlFor={key}>{name}</label>
            <textarea
              id={key}
              value={session.handoff[key]}
              onChange={(event) => session.editHandoff(key, event.target.value)}
              rows={2}
              placeholder={hint}
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        ))}
        <footer className="document-actions">
          <label className="review-check">
            <input
              type="checkbox"
              checked={session.reviewComplete}
              disabled={!session.handoffFieldsComplete || session.busy}
              onChange={(event) => session.confirmReview(event.target.checked)}
            />
            Review complete
          </label>
          <button
            className="primary"
            type="button"
            onClick={session.copyHandoff}
            disabled={
              !session.reviewComplete ||
              !session.handoffFieldsComplete ||
              session.busy
            }
          >
            Copy handoff
          </button>
        </footer>
        {session.showCopyFallback &&
          session.reviewComplete &&
          session.handoffFieldsComplete && (
            <div className="copy-fallback">
              {session.error && (
                <p className="message-error" role="alert">
                  {session.error}
                </p>
              )}
              <textarea
                aria-label="Selectable handoff text"
                rows={7}
                readOnly
                value={handoffAsText(session.handoff)}
              />
            </div>
          )}
      </article>
    </>
  );
}
