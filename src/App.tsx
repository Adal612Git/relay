import { useLayoutEffect, useRef, useState } from 'react';
import { Capture, Review } from './editorial/IncidentDocuments';
import { Handoff } from './editorial/Handoff';
import {
  PrivacyInspector,
  StageTitle,
  WorkspaceFrame,
  type Stage,
} from './editorial/WorkspaceFrame';
import { useIncidentWorkspace } from './useIncidentWorkspace';

const titleByStage = {
  capture: {
    title: 'Private notes.',
    summary:
      'Capture the incident timeline. Your original stays on this device.',
  },
  review: {
    title: 'Review the copy.',
    summary: 'Compare the two versions and decide what may leave this device.',
  },
  handoff: {
    title: 'Shift handoff.',
    summary: 'Review the facts and prepare a document for the incoming shift.',
  },
} as const;

export default function App() {
  const session = useIncidentWorkspace();
  const [stage, setStage] = useState<Stage>('capture');
  const currentStage = useRef<Stage>('capture');
  const nextFocus = useRef<'title' | 'original'>('title');
  const heading = useRef<HTMLHeadingElement>(null);
  const original = useRef<HTMLTextAreaElement>(null);
  const navigated = useRef(false);

  useLayoutEffect(() => {
    if (navigated.current) {
      const target =
        nextFocus.current === 'original' ? original.current : heading.current;
      target?.focus();
    }
  }, [stage]);

  function move(to: Stage, focus: 'title' | 'original' = 'title') {
    if (currentStage.current === to) {
      if (focus === 'original') original.current?.focus();
      return;
    }
    currentStage.current = to;
    nextFocus.current = focus;
    navigated.current = true;
    setStage(to);
  }

  async function analyze() {
    if ((await session.analyze()) && currentStage.current === 'capture')
      move('review');
  }

  async function generate() {
    if ((await session.generate()) && currentStage.current === 'handoff')
      heading.current?.focus();
  }

  return (
    <WorkspaceFrame
      stage={stage}
      move={move}
      status={session.status}
      clear={() => {
        session.clearIncident();
        move('capture', 'original');
      }}
      inspector={<PrivacyInspector session={session} />}
    >
      <StageTitle stage={stage} headingRef={heading} {...titleByStage[stage]} />
      {session.error && !session.showCopyFallback && (
        <p className="message-error" role="alert">
          {session.error}
        </p>
      )}
      {stage === 'capture' && (
        <Capture
          session={session}
          originalRef={original}
          analyze={analyze}
          prepare={() => {
            if (session.prepareManually()) move('review');
          }}
        />
      )}
      {stage === 'review' && (
        <Review session={session} openHandoff={() => move('handoff')} />
      )}
      {stage === 'handoff' && (
        <Handoff
          session={session}
          generate={generate}
          review={() => move('review')}
        />
      )}
    </WorkspaceFrame>
  );
}
