import {
  MAX_SESSION_HISTORY,
  STORAGE_KEY,
  type AppState,
  type DifficultFlag,
  type PracticeState,
  type SessionRecord,
  type WrongEntry,
  emptyPracticeState,
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
  const nested = raw.practice as Partial<PracticeState> | undefined;
  const nestedDiff = migrateDifficultKeys(nested?.difficultExamples);
  const nestedHistory = Array.isArray(nested?.sessionHistory)
    ? nested!.sessionHistory!
    : [];
  const nestedWrongRaw = (nested?.wrongBank ?? {}) as Record<string, WrongEntry>;
  const nestedWrongBank: Record<string, WrongEntry> = {};
  for (const [k, v] of Object.entries(nestedWrongRaw)) {
    const nk = k.includes('::') ? k.replace('::', ':') : k;
    nestedWrongBank[nk] = v;
  }

  const merged: Record<string, DifficultFlag> = {
    ...legacyFlat,
    ...nestedDiff,
  };

  const practice: PracticeState =
    Object.keys(merged).length > 0 ||
    nestedHistory.length > 0 ||
    Object.keys(nestedWrongBank).length > 0
      ? {
          difficultExamples: merged,
          sessionHistory: nestedHistory as SessionRecord[],
          wrongBank: nestedWrongBank,
        }
      : emptyPracticeState();

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
    const practice = next.practice ?? emptyPracticeState();
    toSave.practice = {
      difficultExamples: practice.difficultExamples,
      sessionHistory: practice.sessionHistory,
      wrongBank: practice.wrongBank,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // ignore quota
  }
}

export function getPracticeState(): PracticeState {
  const s = getState();
  return s.practice ?? emptyPracticeState();
}

export function getDifficultExamples(): Record<string, DifficultFlag> {
  return { ...getPracticeState().difficultExamples };
}

export function getSessionHistory(): SessionRecord[] {
  return [...getPracticeState().sessionHistory];
}

export function getWrongBank(): Record<string, WrongEntry> {
  return { ...getPracticeState().wrongBank };
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
  setPractice({ difficultExamples: all });
}

export function unmarkDifficult(key: string): void {
  const normalizedKey = key.includes('::') ? key.replace('::', ':') : key;
  const practice = getPracticeState();
  const all = { ...practice.difficultExamples };
  if (!all[normalizedKey]) return;
  delete all[normalizedKey];
  setPractice({ difficultExamples: all });
}

function setPractice(patch: Partial<PracticeState>): void {
  const prev = getPracticeState();
  setState({
    practice: {
      difficultExamples: prev.difficultExamples,
      sessionHistory: prev.sessionHistory,
      wrongBank: prev.wrongBank,
      ...patch,
    },
  });
}

export function addSessionRecord(record: SessionRecord): void {
  const prev = getPracticeState();
  const nextHistory = [...prev.sessionHistory, record];
  if (nextHistory.length > MAX_SESSION_HISTORY) {
    nextHistory.splice(0, nextHistory.length - MAX_SESSION_HISTORY);
  }
  setPractice({ sessionHistory: nextHistory });
}

export function addToWrongBank(key: string, now = new Date().toISOString()): void {
  const normalizedKey = key.includes('::') ? key.replace('::', ':') : key;
  const prev = getPracticeState();
  const existing = prev.wrongBank[normalizedKey];
  const entry: WrongEntry = existing
    ? {
        ...existing,
        lastWrongAt: now,
        wrongCount: existing.wrongCount + 1,
      }
    : {
        firstWrongAt: now,
        lastWrongAt: now,
        wrongCount: 1,
      };
  setPractice({
    wrongBank: {
      ...prev.wrongBank,
      [normalizedKey]: entry,
    },
  });
}

export function removeFromWrongBank(key: string): void {
  const normalizedKey = key.includes('::') ? key.replace('::', ':') : key;
  const prev = getPracticeState();
  if (!prev.wrongBank[normalizedKey]) return;
  const { [normalizedKey]: _drop, ...rest } = prev.wrongBank;
  setPractice({ wrongBank: rest });
}
