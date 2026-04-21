import {
  STORAGE_KEY,
  type AppState,
  type DifficultFlag,
  type PracticeState,
} from '@/types';

type Stored = Partial<AppState>;

function migrateDifficultKeys(
  map: Record<string, DifficultFlag> | undefined
): Record<string, DifficultFlag> {
  if (!map) return {};
  const out: Record<string, DifficultFlag> = {};
  for (const [k, v] of Object.entries(map)) {
    const nk = k.includes('::') ? k.replace('::', ':') : k;
    out[nk] = v;
  }
  return out;
}

function readRaw(): Record<string, unknown> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Record<
      string,
      unknown
    >;
  } catch {
    return {};
  }
}

/** 로컬스토리지 전체 상태 (마이그레이션 적용) */
export function getState(): Stored {
  const raw = readRaw();
  const legacyFlat = migrateDifficultKeys(
    raw.difficultExamples as Record<string, DifficultFlag> | undefined
  );
  const nested = raw.practice as PracticeState | undefined;
  const nestedDiff = migrateDifficultKeys(nested?.difficultExamples);

  const merged: Record<string, DifficultFlag> = {
    ...legacyFlat,
    ...nestedDiff,
  };

  const practice: PracticeState | undefined =
    Object.keys(merged).length > 0
      ? { difficultExamples: merged }
      : nested?.difficultExamples
        ? { difficultExamples: nestedDiff }
        : undefined;

  return {
    lastViewedDay: raw.lastViewedDay as AppState['lastViewedDay'],
    theme: raw.theme as AppState['theme'],
    practice,
    // 레거시 필드는 getDifficultExamples에서만 병합; 여기선 practice만 반환
  };
}

export function setLastViewedDay(month: number, day: number): void {
  setState({ lastViewedDay: { month, day } });
}

export function setState(patch: Stored): void {
  if (typeof window === 'undefined') return;
  try {
    const prev = getState();
    const next: Stored = { ...prev, ...patch };
    const toSave: Record<string, unknown> = {
      lastViewedDay: next.lastViewedDay ?? null,
      theme: next.theme,
    };
    if (next.practice?.difficultExamples) {
      toSave.practice = { difficultExamples: next.practice.difficultExamples };
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // ignore quota
  }
}

export function getPracticeState(): PracticeState {
  const s = getState();
  return s.practice ?? { difficultExamples: {} };
}

export function getDifficultExamples(): Record<string, DifficultFlag> {
  return { ...getPracticeState().difficultExamples };
}

export function markDifficult(
  key: string,
  value?: Partial<DifficultFlag>
): void {
  const normalizedKey = key.includes('::') ? key.replace('::', ':') : key;
  const practice = getPracticeState();
  const all = { ...practice.difficultExamples };
  const prev = all[normalizedKey];
  all[normalizedKey] = {
    markedAt: prev?.markedAt ?? new Date().toISOString().slice(0, 10),
    sessionsStruggled: prev?.sessionsStruggled ?? 0,
    ...value,
  };
  setState({ practice: { difficultExamples: all } });
}

export function unmarkDifficult(key: string): void {
  const normalizedKey = key.includes('::') ? key.replace('::', ':') : key;
  const practice = getPracticeState();
  const all = { ...practice.difficultExamples };
  if (!all[normalizedKey]) return;
  delete all[normalizedKey];
  setState({ practice: { difficultExamples: all } });
}
