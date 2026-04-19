import { STORAGE_KEY, type AppState, type DifficultExample } from '@/types';

type Stored = Partial<AppState>;

export function getState(): Stored {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Stored;
  } catch {
    return {};
  }
}

export function setLastViewedDay(month: number, day: number): void {
  setState({ lastViewedDay: { month, day } });
}

export function setState(patch: Stored): void {
  if (typeof window === 'undefined') return;
  try {
    const state: Stored = { ...getState(), ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota
  }
}

export function getDifficultExamples(): Record<string, DifficultExample> {
  return getState().difficultExamples ?? {};
}

export function markDifficult(
  key: string,
  value?: Partial<DifficultExample>
): void {
  const all = getDifficultExamples();
  const prev = all[key];
  all[key] = {
    markedAt: prev?.markedAt ?? new Date().toISOString().slice(0, 10),
    sessionsStruggled: prev?.sessionsStruggled ?? 0,
    ...value,
  };
  setState({ difficultExamples: all });
}

export function unmarkDifficult(key: string): void {
  const all = getDifficultExamples();
  if (!all[key]) return;
  delete all[key];
  setState({ difficultExamples: all });
}
