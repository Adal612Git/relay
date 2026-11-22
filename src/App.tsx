import { useMemo, useRef, useState } from 'react';
import { analyzeOnDevice, generateHandoff } from './lib/ai';
import { A1_ORIGINAL } from './lib/examples';
import { getFirebaseRuntime } from './lib/firebase';
import {
  buildSafeDraft,
  emptyHandoff,
  handoffAsText,
  validateOriginal,
  validateSharingCopy,
} from './lib/relay';
import type { ExcludedItem, Handoff, InferenceSource } from './lib/types';

const FIELD_LABELS: Array<{ key: keyof Handoff; label: string }> = [
  { key: 'observedImpact', label: 'Observed impact' },
  { key: 'actionsAndResults', label: 'Actions and results' },
  { key: 'openQuestions', label: 'Open questions' },
  { key: 'nextStep', label: 'Next step' },
];

function sourceLabel(source: InferenceSource): string {
  if (source === 'on_device') return 'Generated on this device';
  if (source === 'in_cloud') return 'Generated in the cloud';
  return 'Source unavailable';
}

export default function App() {
  const runtime = useMemo(() => getFirebaseRuntime(), []);
  // Discard late AI responses after a user edits or resets the current incident.
  const revision = useRef(0);
  const [original, setOriginal] = useState(A1_ORIGINAL);
  const [sharingCopy, setSharingCopy] = useState('');
  const [excluded, setExcluded] = useState<ExcludedItem[]>([]);
  const [findings, setFindings] = useState<string[]>([]);
  const [approvedText, setApprovedText] = useState<string | null>(null);
  const [handoff, setHandoff] = useState<Handoff>(emptyHandoff());
  const [source, setSource] = useState<InferenceSource>('unknown');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [status, setStatus] = useState('Original notes stay in this browser session.');
  const [error, setError] = useState('');

  const originalError = validateOriginal(original);
  const sharingError = validateSharingCopy(sharingCopy);
  const isApproved = approvedText !== null && approvedText === sharingCopy;
  const canGenerate = isApproved && !busy && runtime.appCheckReady;

  function invalidateSharing() {
    revision.current += 1;
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
    setStatus('Original notes changed. Previous analysis and approval were invalidated.');
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
    setBusy(true);
    setError('');
    setProgress(null);
    invalidateSharing();
    const requestRevision = revision.current;
    setStatus('Preparing the on-device model. The original is not eligible for cloud fallback.');
    try {
      const result = await analyzeOnDevice(original, setProgress);
      if (requestRevision !== revision.current) return;
      const suggested = result.value.sharingCopy?.trim() || original;
      const safe = buildSafeDraft(suggested);
      setSharingCopy(safe.text);
      const originalMatches = buildSafeDraft(original).excluded;
      const uniqueMatches = new Map<string, ExcludedItem>(
        [...originalMatches, ...safe.excluded].map((item) => [`${item.line}:${item.value}:${item.reason}`, item] as const),
      );
      setExcluded([...uniqueMatches.values()]);
      setFindings(result.value.findings ?? []);
      setStatus('Local review ready. Inspect every line before approving the sharing copy.');
    } catch (cause) {
      if (requestRevision !== revision.current) return;
      const safe = buildSafeDraft(original);
      setSharingCopy(safe.text);
      setExcluded(safe.excluded);
      setFindings([]);
      setStatus('The local model is unavailable. A rule-based draft is ready for manual review.');
      setError(cause instanceof Error ? cause.message : 'Local analysis failed.');
    } finally {
      setBusy(false);
      setProgress(null);
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
    setStatus('Manual sharing copy prepared. Review the text and excluded items before approving.');
  }

  function approve() {
    const validation = validateSharingCopy(sharingCopy);
    if (validation) {
      setError(validation);
      return;
    }
    setApprovedText(sharingCopy);
    setError('');
    setStatus('Approved snapshot created. Only this exact text can enter the hybrid model adapter.');
  }

  async function generate() {
    if (!isApproved || !approvedText) {
      setError('Approve the exact sharing copy before generating a handoff.');
      return;
    }
    setBusy(true);
    setError('');
    const requestRevision = revision.current;
    setStatus('Generating from the approved sharing copy.');
    try {
      const result = await generateHandoff(approvedText);
      if (requestRevision !== revision.current) return;
      setHandoff(result.value);
      setSource(result.source);
      setReviewComplete(false);
      setStatus('Handoff candidate ready. Verify each statement against the approved notes.');
    } catch (cause) {
      if (requestRevision !== revision.current) return;
      setError(cause instanceof Error ? cause.message : 'Handoff generation failed.');
      setStatus('Generation failed. Your approved copy is preserved for manual writing or retry.');
    } finally {
      setBusy(false);
    }
  }

  function editHandoff(key: keyof Handoff, value: string) {
    revision.current += 1;
    setHandoff((current) => ({ ...current, [key]: value }));
    setReviewComplete(false);
    setStatus('Handoff edited. Review complete must be confirmed again before copying.');
  }

  async function copyHandoff() {
    if (!reviewComplete || FIELD_LABELS.some(({ key }) => !handoff[key].trim())) {
      setError('Complete all four fields and confirm Review complete before copying.');
      return;
    }
    const text = handoffAsText(handoff);
    try {
      await navigator.clipboard.writeText(text);
      setError('');
      setStatus('Handoff copied.');
    } catch {
      setError('Clipboard access was denied. Select and copy the handoff text below.');
    }
  }

  function clearIncident() {
    revision.current += 1;
    setOriginal('');
    setSharingCopy('');
    setExcluded([]);
    setFindings([]);
    setApprovedText(null);
    setHandoff(emptyHandoff());
    setSource('unknown');
    setReviewComplete(false);
    setError('');
    setStatus('Incident cleared from the current browser session.');
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">››</div>
        <div>
          <p className="eyebrow">LOTOS / INCIDENT WORKSPACE</p>
          <h1>Relay</h1>
        </div>
        <div className="header-spacer" />
        <span className="sample-pill">Synthetic incident · A1</span>
      </header>

      <div className="status-line" role="status" aria-live="polite">
        <span className="status-dot" /> {status}
      </div>

      {!runtime.app && (
        <div className="notice" role="note">
          Firebase is not configured. The sample and manual review flow work locally; AI actions require the variables in <code>.env.local</code>.
        </div>
      )}
      {runtime.app && !runtime.appCheckReady && (
        <div className="notice" role="note">
          Firebase is configured, but App Check is not. Hybrid generation stays disabled because it may send the approved copy to the cloud.
        </div>
      )}

      <section className="workspace-grid">
        <section className="panel" aria-labelledby="original-title">
          <div className="panel-heading">
            <div>
              <span className="step">01</span>
              <h2 id="original-title">Original notes</h2>
            </div>
            <span className="local-tag">On this device</span>
          </div>
          <p className="helper">The original remains in memory for this session.</p>
          <textarea
            aria-label="Original incident notes"
            value={original}
            onChange={(event) => editOriginal(event.target.value)}
            rows={14}
            spellCheck={false}
          />
          <div className="button-row wrap">
            <button className="primary" type="button" onClick={analyze} disabled={busy || Boolean(originalError) || !runtime.app}>
              {busy && progress !== null ? `Preparing model ${Math.round(progress * 100)}%` : 'Analyze on this device'}
            </button>
            <button className="secondary" type="button" onClick={prepareManually} disabled={busy || Boolean(originalError)}>
              Prepare manually
            </button>
            <button className="quiet" type="button" onClick={() => editOriginal(A1_ORIGINAL)} disabled={busy}>
              Try A1
            </button>
          </div>
          {originalError && <p className="error-text">{originalError}</p>}
        </section>

        <section className="panel" aria-labelledby="sharing-title">
          <div className="panel-heading">
            <div>
              <span className="step">02</span>
              <h2 id="sharing-title">Review what may be shared</h2>
            </div>
            <span className={isApproved ? 'approved-tag' : 'pending-tag'}>{isApproved ? 'Approved' : 'Pending review'}</span>
          </div>
          <p className="helper strong-helper">Only the text below may be sent to the cloud.</p>
          <textarea
            aria-label="Sharing copy"
            value={sharingCopy}
            onChange={(event) => editSharing(event.target.value)}
            rows={14}
            placeholder="Analyze the original or prepare a copy manually to begin review."
            spellCheck={false}
          />
          <div className="excluded-box">
            <h3>Excluded from sharing copy</h3>
            {excluded.length === 0 ? (
              <p className="helper">No pattern matches recorded. This does not prove the text contains no sensitive information.</p>
            ) : (
              <ul>
                {excluded.map((item, index) => (
                  <li key={`${item.line}-${item.value}-${index}`}>
                    <code>Line {item.line}</code> · {item.reason}: <span>{item.value}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {findings.length > 0 && (
            <details className="findings">
              <summary>Local model findings</summary>
              <ul>{findings.map((finding, index) => <li key={index}>{finding}</li>)}</ul>
            </details>
          )}
          <div className="button-row wrap">
            <button className="primary" type="button" onClick={approve} disabled={busy || Boolean(sharingError)}>
              Approve this text
            </button>
            <button className="secondary" type="button" onClick={generate} disabled={!canGenerate}>
              {busy ? 'Generating handoff…' : 'Generate handoff'}
            </button>
          </div>
          {sharingError && <p className="error-text">{sharingError}</p>}
          {approvedText && !isApproved && <p className="error-text">Text changed. Review and approve again.</p>}
        </section>
      </section>

      <section className="panel handoff-panel" aria-labelledby="handoff-title">
        <div className="panel-heading">
          <div>
            <span className="step">03</span>
            <h2 id="handoff-title" tabIndex={-1}>Shift handoff</h2>
          </div>
          <span className="source-tag">{sourceLabel(source)}</span>
        </div>
        <p className="helper">The next shift gets four fields. Keep uncertainty visible.</p>
        <div className="handoff-fields">
          {FIELD_LABELS.map(({ key, label }) => (
            <label className="handoff-field" key={key}>
              <span>{label}</span>
              <textarea
                aria-label={label}
                value={handoff[key]}
                onChange={(event) => editHandoff(key, event.target.value)}
                rows={3}
                placeholder="Your handoff will appear here after generation."
              />
            </label>
          ))}
        </div>
        <div className="handoff-actions">
          <label className="review-check">
            <input type="checkbox" checked={reviewComplete} onChange={(event) => setReviewComplete(event.target.checked)} />
            <span>Review complete</span>
          </label>
          <button className="primary" type="button" onClick={copyHandoff} disabled={!reviewComplete || busy}>
            Copy handoff
          </button>
        </div>
        <textarea className="copy-fallback" aria-label="Selectable handoff text" readOnly value={handoffAsText(handoff)} />
      </section>

      {error && <div className="error-banner" role="alert">{error}</div>}
      <footer className="footer-row">
        <span>Session-only state · No incident persistence</span>
        <button className="quiet" type="button" onClick={clearIncident} disabled={busy}>Clear incident</button>
      </footer>
    </main>
  );
}
