import { describe, expect, it } from 'vitest';
import { IncidentSession, requireApprovedCopy } from './session';

describe('human approval boundary', () => {
  it('rejects strings and forged approval objects', () => {
    expect(() => requireApprovedCopy({ text: 'safe text' })).toThrow(/Approve/);
  });
  it('requires nonempty, bounded, identifier-free text', () => {
    const session = new IncidentSession();
    for (const text of [
      '',
      'x'.repeat(6001),
      'token: private',
      'Contact a@example.test',
    ]) {
      expect(() => session.approve(text)).toThrow();
    }
  });
  it('rejects reintroduced explicit exclusions', () => {
    expect(() =>
      new IncidentSession().approve('silver teacup', ['silver teacup']),
    ).toThrow(/excluded/);
  });
  it('issues an immutable snapshot and revokes it on any incident revision', () => {
    const session = new IncidentSession();
    const copy = session.approve('Reviewed text.');
    expect(Object.isFrozen(copy)).toBe(true);
    expect(requireApprovedCopy(copy)).toBe('Reviewed text.');
    session.invalidate();
    expect(() => requireApprovedCopy(copy)).toThrow(/Approve/);
  });
  it('reapproving the same text does not revive an old capability', () => {
    const session = new IncidentSession();
    const old = session.approve('Reviewed text.');
    const current = session.approve('Reviewed text.');
    expect(() => requireApprovedCopy(old)).toThrow();
    expect(requireApprovedCopy(current)).toBe('Reviewed text.');
  });
  it('allows only one request per revision and ignores stale completion', () => {
    const session = new IncidentSession();
    const old = session.begin()!;
    expect(session.begin()).toBeNull();
    session.invalidate();
    const current = session.begin()!;
    expect(session.isCurrent(old)).toBe(false);
    expect(session.finish(old)).toBe(false);
    expect(session.isCurrent(current)).toBe(true);
    expect(session.finish(current)).toBe(true);
    expect(session.begin()).not.toBeNull();
  });
});
