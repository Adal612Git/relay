import { useMemo, useRef, useState } from 'react';
import { analyzeOnDevice, generateHandoff } from './lib/ai';
import { IncidentSession, type ApprovedCopy } from './lib/session';
import { EXAMPLES } from './lib/examples';
import { getFirebaseRuntime } from './lib/firebase';
import {
  buildSafeDraft,
  emptyHandoff,
  handoffAsText,
  handoffErrorMessage,
  hasExcludedValue,
  MAX_ORIGINAL_LENGTH,
  MAX_SHARING_LENGTH,
  validateOriginal,
  validateSharingCopy,
} from './lib/relay';
import type { ExcludedItem, Handoff, InferenceSource } from './lib/types';

const FIELD_LABELS: Array<{ key: keyof Handoff; label: string; hint: string }> =
  [
    {
      key: 'observedImpact',
      label: 'Observed impact',
      hint: 'What changed for users or systems?',
    },
    {
      key: 'actionsAndResults',
      label: 'Actions and results',
      hint: 'What was tried, and what happened?',
    },
    {
      key: 'openQuestions',
      label: 'Open questions',
      hint: 'What is still uncertain?',
    },
    {
      key: 'nextStep',
      label: 'Next step',
      hint: 'What should the incoming shift do?',
    },
  ];

function sourceLabel(source: InferenceSource): string {
  if (source === 'on_device') return 'Generated on this device';
  if (source === 'in_cloud') return 'Generated in the cloud';
  return 'Source unavailable';
}

export default function App() {
  const runtime = useMemo(() => getFirebaseRuntime(), []);
  // Discard late AI responses after a user edits or resets the current incident.
  const originalEditor = useRef<HTMLTextAreaElement>(null);
  const handoffHeading = useRef<HTMLHeadingElement>(null);
  const copyAttempt = useRef<symbol | null>(null);
  const session = useRef(new IncidentSession());
  const approval = useRef<ApprovedCopy | null>(null);
  const [original, setOriginal] = useState('');
  const [sharingCopy, setSharingCopy] = useState('');
  const [excluded, setExcluded] = useState<ExcludedItem[]>([]);
  const [findings, setFindings] = useState<string[]>([]);
  const [approvedText, setApprovedText] = useState<string | null>(null);
  const [handoff, setHandoff] = useState<Handoff>(emptyHandoff());
  const [source, setSource] = useState<InferenceSource>('unknown');
  const [operation, setOperation] = useState<'analysis' | 'generation' | null>(
    null,
  );
  const [progress, setProgress] = useState<number | null>(null);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [showCopyFallback, setShowCopyFallback] = useState(false);
  const [handoffEdited, setHandoffEdited] = useState(false);
  const [status, setStatus] = useState(
    'Original notes stay in this browser session.',
  );
  const [error, setError] = useState('');

  const originalError = validateOriginal(original);
  const sharingError =
    validateSharingCopy(sharingCopy) ||
    (hasExcludedValue(
      sharingCopy,
      excluded.map((item) => item.value),
    )
      ? 'An excluded identifier remains in the sharing copy.'
      : null);
  const showOriginalError = original.length > 0 && Boolean(originalError);
  const showSharingError = sharingCopy.length > 0 && Boolean(sharingError);
  const busy = operation !== null;
  const handoffFieldsComplete = FIELD_LABELS.every(({ key }) =>
    Boolean(handoff[key].trim()),
  );
  const isApproved = approvedText !== null && approvedText === sharingCopy;
  const canGenerate = isApproved && !busy && runtime.appCheckReady;

  function invalidateSharing() {
    session.current.invalidate();
    approval.current = null;
    copyAttempt.current = null;
    setShowCopyFallback(false);
    setHandoffEdited(false);
    setOperation(null);
    setProgress(null);
    setError('');
    setApprovedText(null);
    setHandoff(emptyHandoff());
    setReviewComplete(false);
    setSource('unknown');
  }

  function editOriginal(value: string) {
    setOriginal(value);
    setSharingCopy('');
    setExcluded([]);
    setFindings([]);
    invalidateSharing();
    setStatus(
      'Original notes changed. Previous analysis and approval were invalidated.',
    );
  }

  function editSharing(value: string) {
    setSharingCopy(value);
    invalidateSharing();
    setStatus('Text changed. Review and approve again.');
  }

  async function analyze() {
    const validation = validateOriginal(original);
    if (validation) {
      setError(validation);
      return;
    }
    if (busy || session.current.isBusy()) return;
    invalidateSharing();
    const request = session.current.begin();
    if (!request) return;
    setOperation('analysis');
    setError('');
    setProgress(null);
    setStatus(
      'Preparing the on-device model. The original is not eligible for cloud fallback.',
    );
    try {
      const result = await analyzeOnDevice(original, (value) => {
        if (session.current.isCurrent(request)) setProgress(value);
      });
      if (!session.current.isCurrent(request)) return;
      const safe = buildSafeDraft(original);
      setSharingCopy(safe.text);
      setExcluded(safe.excluded);
      setFindings(result.value.findings ?? []);
      setStatus(
        'On-device analysis complete. Inspect every line before approving the sharing copy.',
      );
    } catch {
      if (!session.current.isCurrent(request)) return;
      const safe = buildSafeDraft(original);
      setSharingCopy(safe.text);
      setExcluded(safe.excluded);
      setFindings([]);
      setStatus(
        'The local model is unavailable. A rule-based draft is ready for manual review.',
      );
      setError('Local analysis is unavailable. Continue with manual review.');
    } finally {
      if (session.current.finish(request)) {
        setOperation(null);
        setProgress(null);
      }
    }
  }

  function prepareManually() {
    const validation = validateOriginal(original);
    if (validation) {
      setError(validation);
      return;
    }
    const safe = buildSafeDraft(original);
    setSharingCopy(safe.text);
    setExcluded(safe.excluded);
    setFindings([]);
    invalidateSharing();
    setError('');
    setStatus(
      'Manual sharing copy prepared. Review the text and excluded items before approving.',
    );
  }

  function approve() {
    const validation = sharingError;
    if (validation) {
      setError(validation);
      return;
    }
    approval.current = session.current.approve(
      sharingCopy,
      excluded.map((item) => item.value),
    );
    setApprovedText(sharingCopy);
    setError('');
    setStatus(
      'Approved snapshot created. Only this exact text can enter the hybrid model adapter.',
    );
  }

  async function generate() {
    if (!isApproved || !approval.current) {
      setError('Approve the exact sharing copy before generating a handoff.');
      return;
    }
    const request = session.current.begin();
    if (!request) return;
    setOperation('generation');
    copyAttempt.current = null;
    setShowCopyFallback(false);
    setReviewComplete(false);
    setError('');
    setStatus('Generating from the approved sharing copy.');
    try {
      const result = await generateHandoff(approval.current);
      if (!session.current.isCurrent(request)) return;
      setHandoff(result.value);
      setSource(result.source);
      setHandoffEdited(false);
      setReviewComplete(false);
      handoffHeading.current?.focus();
      setStatus(
        'Handoff candidate ready. Verify each statement against the approved notes.',
      );
    } catch (failure) {
      if (!session.current.isCurrent(request)) return;
      setError(handoffErrorMessage(failure));
      setStatus(
        'Generation failed. Your approved copy is preserved for manual writing or retry.',
      );
    } finally {
      if (session.current.finish(request)) setOperation(null);
    }
  }

  function editHandoff(key: keyof Handoff, value: string) {
    setApprovedText(null);
    setHandoffEdited(true);
    copyAttempt.current = null;
    setShowCopyFallback(false);
    setError('');
    session.current.invalidate();
    approval.current = null;
    setOperation(null);
    setProgress(null);
    setHandoff((current) => ({ ...current, [key]: value }));
    setReviewComplete(false);
    setStatus(
      'Handoff edited. Review complete must be confirmed again before copying.',
    );
  }

  async function copyHandoff() {
    if (!reviewComplete || !handoffFieldsComplete || session.current.isBusy())
      return;
    const text = handoffAsText(handoff);
    const attempt = Symbol();
    copyAttempt.current = attempt;
    try {
      await navigator.clipboard.writeText(text);
      if (copyAttempt.current !== attempt) return;
      setError('');
      setShowCopyFallback(false);
      setStatus('Handoff copied.');
    } catch {
      if (copyAttempt.current !== attempt) return;
      setShowCopyFallback(true);
      setError(
        'Clipboard access was denied. Select and copy the handoff text below.',
      );
    }
  }

  function clearIncident() {
    invalidateSharing();
    setOriginal('');
    setSharingCopy('');
    setExcluded([]);
    setFindings([]);
    setStatus('Incident cleared from the current browser session.');
    originalEditor.current?.focus();
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true" />
        <div>
          <p className="eyebrow">Lotos Technologies</p>
          <h1>Relay</h1>
        </div>
        <span className="session-tag" title="Incidents are not saved">
          Session only
        </span>
      </header>

      <div className="status-line" role="status" aria-live="polite">
        <span className="status-dot" aria-hidden="true" /> {status}
      </div>

      {!runtime.app && (
        <div className="notice" role="note">
          AI is unavailable. You can prepare a sharing copy and write the four
          handoff fields manually on this device.
        </div>
      )}
      {runtime.app && !runtime.appCheckReady && (
        <div className="notice" role="note">
          Firebase is configured, but App Check is not. Hybrid generation stays
          disabled because it may send the approved copy to the cloud.
        </div>
      )}

      <section className="workspace-grid">
        <section
          className="panel editor-panel original-panel"
          aria-labelledby="original-title"
        >
          <div className="panel-heading">
            <div>
              <span className="step" aria-hidden="true">
                01
              </span>
              <h2 id="original-title">Original notes</h2>
            </div>
            <span className="local-tag">Private · on device</span>
          </div>
          <p className="helper">
            Paste the outgoing shift’s notes for on-device analysis.
          </p>
          <textarea
            ref={originalEditor}
            className="incident-editor"
            placeholder="Paste the timeline, observations, and actions…"
            aria-label="Original incident notes"
            aria-describedby={
              showOriginalError
                ? 'original-error original-count'
                : 'original-count'
            }
            value={original}
            onChange={(event) => editOriginal(event.target.value)}
            rows={9}
            spellCheck={false}
            autoComplete="off"
          />
          <div className="editor-caption">
            {showOriginalError && (
              <p className="error-text" id="original-error">
                {originalError}
              </p>
            )}
            <span className="character-count" id="original-count">
              {original.length.toLocaleString('en-US')} /{' '}
              {MAX_ORIGINAL_LENGTH.toLocaleString('en-US')}
            </span>
          </div>
          <div className="sample-bar">
            <h3>Synthetic examples</h3>
            <div className="sample-actions">
              {EXAMPLES.map((example) => (
                <button
                  key={example.id}
                  type="button"
                  title={example.title}
                  onClick={() => editOriginal(example.originalNotes.join('\n'))}
                >
                  Try {example.id}
                </button>
              ))}
            </div>
          </div>
          {operation === 'analysis' && (
            <progress
              aria-label="Preparing the on-device model"
              max={1}
              value={progress ?? undefined}
            />
          )}
          <div className="button-row">
            <button
              className="primary"
              type="button"
              onClick={analyze}
              disabled={busy || Boolean(originalError) || !runtime.app}
            >
              {operation === 'analysis'
                ? progress !== null
                  ? `Preparing model ${Math.round(progress * 100)}%`
                  : 'Working on this device…'
                : 'Analyze on this device'}
            </button>
            <button
              className="secondary"
              type="button"
              onClick={prepareManually}
              disabled={Boolean(originalError)}
            >
              Prepare manually
            </button>
          </div>
        </section>

        <section
          className="panel editor-panel sharing-panel"
          aria-labelledby="sharing-title"
        >
          <div className="panel-heading">
            <div>
              <span className="step" aria-hidden="true">
                02
              </span>
              <h2 id="sharing-title">Sharing copy</h2>
            </div>
            <span className={isApproved ? 'approved-tag' : 'pending-tag'}>
              {isApproved ? 'Approved' : 'Pending review'}
            </span>
          </div>
          <p className="helper">
            Only the copy you approve may be sent to the cloud.
          </p>
          <textarea
            className="incident-editor"
            aria-label="Sharing copy"
            aria-describedby={
              showSharingError ? 'sharing-error sharing-count' : 'sharing-count'
            }
            value={sharingCopy}
            onChange={(event) => editSharing(event.target.value)}
            rows={9}
            placeholder="Analyze the original or prepare a copy manually to begin review."
            spellCheck={false}
            autoComplete="off"
          />
          <div className="editor-caption">
            {showSharingError && (
              <p className="error-text" id="sharing-error">
                {sharingError}
              </p>
            )}
            <span className="character-count" id="sharing-count">
              {sharingCopy.length.toLocaleString('en-US')} /{' '}
              {MAX_SHARING_LENGTH.toLocaleString('en-US')}
            </span>
          </div>
          <div className="excluded-box">
            <div className="excluded-heading">
              <h3>Excluded from sharing copy</h3>
              {excluded.length > 0 && (
                <span className="excluded-count">{excluded.length}</span>
              )}
            </div>
            {excluded.length === 0 ? (
              <p className="helper">
                No exclusions listed. Check the copy for other sensitive
                details.
              </p>
            ) : (
              <ul>
                {excluded.map((item, index) => (
                  <li key={`${item.line}-${item.value}-${index}`}>
                    <button
                      type="button"
                      className="line-link"
                      onClick={() => {
                        const lines = original.split(/\r\n|\r|\n/);
                        const separators = original.match(/\r\n|\r|\n/g) ?? [];
                        const start = lines
                          .slice(0, item.line - 1)
                          .reduce(
                            (sum, line, i) =>
                              sum + line.length + (separators[i]?.length ?? 0),
                            0,
                          );
                        originalEditor.current?.focus();
                        originalEditor.current?.setSelectionRange(
                          start,
                          start + (lines[item.line - 1]?.length ?? 0),
                        );
                      }}
                    >
                      Line {item.line}
                    </button>
                    <span>
                      {item.reason} ·{' '}
                      <span className="excluded-value">{item.value}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {findings.length > 0 && (
            <details className="findings">
              <summary>Local model findings</summary>
              <ul>
                {findings.map((finding, index) => (
                  <li key={index}>{finding}</li>
                ))}
              </ul>
            </details>
          )}
          <div className="button-row">
            <button
              className={isApproved ? 'secondary' : 'primary'}
              type="button"
              onClick={approve}
              disabled={busy || Boolean(sharingError)}
            >
              Approve this text
            </button>
            <button
              className={isApproved ? 'primary' : 'secondary'}
              type="button"
              onClick={generate}
              disabled={!canGenerate}
            >
              {operation === 'generation'
                ? 'Generating handoff…'
                : 'Generate handoff'}
            </button>
          </div>
        </section>
      </section>

      <section className="panel handoff-panel" aria-labelledby="handoff-title">
        <div className="panel-heading">
          <div>
            <span className="step" aria-hidden="true">
              03
            </span>
            <h2 ref={handoffHeading} id="handoff-title" tabIndex={-1}>
              Shift handoff
            </h2>
          </div>
          <span className="source-tag" data-source={source}>
            {source === 'unknown' && !handoffFieldsComplete && !handoffEdited
              ? 'Awaiting handoff'
              : source === 'unknown' && handoffEdited
                ? 'Written manually'
                : sourceLabel(source)}
            {source !== 'unknown' && handoffEdited ? ' · edited' : ''}
          </span>
        </div>
        <p className="helper">
          Check each field against the incident notes before copying.
        </p>
        <div className="handoff-fields">
          {FIELD_LABELS.map(({ key, label, hint }) => (
            <label className="handoff-field" key={key}>
              <span>{label}</span>
              <textarea
                aria-label={label}
                value={handoff[key]}
                onChange={(event) => editHandoff(key, event.target.value)}
                rows={3}
                spellCheck={false}
                autoComplete="off"
                placeholder={hint}
              />
            </label>
          ))}
        </div>
        <div className="handoff-actions">
          <label className="review-check">
            <input
              type="checkbox"
              checked={reviewComplete}
              disabled={!handoffFieldsComplete || busy}
              onChange={(event) => {
                copyAttempt.current = null;
                setShowCopyFallback(false);
                setReviewComplete(event.target.checked);
              }}
            />
            <span>Review complete</span>
          </label>
          <button
            className="primary"
            type="button"
            onClick={copyHandoff}
            disabled={!reviewComplete || !handoffFieldsComplete || busy}
          >
            Copy handoff
          </button>
        </div>
        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}
        {showCopyFallback && reviewComplete && handoffFieldsComplete && (
          <textarea
            className="copy-fallback"
            aria-label="Selectable handoff text"
            readOnly
            value={handoffAsText(handoff)}
          />
        )}
      </section>

      <footer className="footer-row">
        <button className="quiet" type="button" onClick={clearIncident}>
          Clear incident
        </button>
      </footer>
    </main>
  );
}
