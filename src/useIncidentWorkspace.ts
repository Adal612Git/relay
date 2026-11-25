import { useMemo, useRef, useState } from 'react';
import { analyzeOnDevice, generateHandoff } from './lib/ai';
import { IncidentSession, type ApprovedCopy } from './lib/session';
import { getFirebaseRuntime } from './lib/firebase';
import {
  buildSafeDraft,
  emptyHandoff,
  handoffAsText,
  handoffErrorMessage,
  hasExcludedValue,
  validateOriginal,
  validateSharingCopy,
} from './lib/relay';
import type { ExcludedItem, Handoff, InferenceSource } from './lib/types';

export function useIncidentWorkspace() {
  const runtime = useMemo(() => getFirebaseRuntime(), []);
  const copyAttempt = useRef<symbol | null>(null);
  const session = useRef(new IncidentSession());
  const approval = useRef<ApprovedCopy | null>(null);
  const [original, setOriginal] = useState('');
  const [sharingCopy, setSharingCopy] = useState('');
  const [copyPrepared, setCopyPrepared] = useState(false);
  const [approvalRevoked, setApprovalRevoked] = useState(false);
  const [analysisOutcome, setAnalysisOutcome] = useState<
    'idle' | 'complete' | 'unavailable'
  >('idle');
  const [lastInference, setLastInference] = useState<InferenceSource | null>(
    null,
  );
  const [generated, setGenerated] = useState(false);
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
  const handoffFieldsComplete = Object.values(handoff).every((value) =>
    Boolean(value.trim()),
  );
  const isApproved = approvedText !== null && approvedText === sharingCopy;
  const canGenerate = isApproved && !busy && runtime.appCheckReady;

  function invalidateSharing() {
    session.current.invalidate();
    if (approval.current) setApprovalRevoked(true);
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
    setGenerated(false);
  }

  function editOriginal(value: string) {
    const hadWork =
      copyPrepared || handoffEdited || generated || busy || isApproved;
    setOriginal(value);
    setCopyPrepared(false);
    setAnalysisOutcome('idle');
    setLastInference(null);
    setSharingCopy('');
    setExcluded([]);
    setFindings([]);
    invalidateSharing();
    setStatus(
      hadWork
        ? 'Original notes changed. Previous analysis and approval were invalidated.'
        : 'Original notes updated in this browser session.',
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
      setAnalysisOutcome('complete');
      setLastInference(result.source);
      setCopyPrepared(true);
      setStatus(
        'On-device analysis complete. Inspect every line before approving the sharing copy.',
      );
      return true;
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
      setAnalysisOutcome('unavailable');
      setCopyPrepared(true);
      return true;
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
    setCopyPrepared(true);
    setExcluded(safe.excluded);
    setFindings([]);
    invalidateSharing();
    setError('');
    setStatus(
      'Manual sharing copy prepared. Review the text and excluded items before approving.',
    );
    return true;
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
    setApprovalRevoked(false);
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
      setLastInference(result.source);
      setGenerated(true);
      setHandoffEdited(false);
      setReviewComplete(false);
      setStatus(
        'Handoff candidate ready. Verify each statement against the approved notes.',
      );
      return true;
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
    if (approval.current) setApprovalRevoked(true);
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
    setCopyPrepared(false);
    setApprovalRevoked(false);
    setAnalysisOutcome('idle');
    setLastInference(null);
    setSharingCopy('');
    setExcluded([]);
    setFindings([]);
    setStatus('Incident cleared from the current browser session.');
  }

  function confirmReview(checked: boolean) {
    copyAttempt.current = null;
    setShowCopyFallback(false);
    setReviewComplete(checked);
    setStatus(
      checked
        ? 'Handoff reviewed. Ready to copy.'
        : 'Review the four fields before copying.',
    );
  }

  return {
    runtime,
    original,
    sharingCopy,
    excluded,
    findings,
    handoff,
    source,
    operation,
    progress,
    reviewComplete,
    showCopyFallback,
    handoffEdited,
    status,
    error,
    originalError,
    sharingError,
    showOriginalError,
    showSharingError,
    busy,
    handoffFieldsComplete,
    isApproved,
    canGenerate,
    copyPrepared,
    approvalRevoked,
    analysisOutcome,
    lastInference,
    generated,
    editOriginal,
    editSharing,
    analyze,
    prepareManually,
    approve,
    generate,
    editHandoff,
    copyHandoff,
    clearIncident,
    confirmReview,
  };
}

export type IncidentWorkspace = ReturnType<typeof useIncidentWorkspace>;
