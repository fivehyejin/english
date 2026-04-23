# Data Schema

`curriculum-m2.json`의 구조를 TypeScript로 옮긴 것. `src/types.ts`로 그대로 복사해서 사용하면 됩니다.

## 변경 이력
- **v3 (현재)**: `SessionRecord`, `WrongEntry` 추가 (히스토리·오답 보관함·대시보드용)
- v2.2: `PracticeKind`에 3개 추가 (`collocation`, `minimal-pairs`, `composition`), 작문 채점 유틸, `CROSS_DAY_SISTERS` 매핑
- v2.1: 연습 모드 타입 추가 (`PracticeState`, `PracticeKind`, `PracticeQuestion`, `SISTER_GROUPS`)
- v2: Day 요약(`daySummaries`) 추가, 복습 관련 타입 전체 제거
- v1: 복습 관리 앱 버전 (사용 안 함)

---

## 전체 타입 정의

```typescript
// ============================================
// 커리큘럼 데이터 (읽기 전용, JSON으로 제공)
// ============================================

export type Level = 'beginner' | 'intermediate';

export interface CurriculumData {
  /** 월 번호 (1~10) */
  month: number;
  /** 난이도 레벨 */
  level: Level;
  /** 해당 월의 대주제 */
  topic: string;
  /** 주제 세부 안내 (선택) */
  topicNote?: string;
  /** Day별 핵심 요약. key는 day number (1,2,3,...) */
  daySummaries: Record<number, DaySummary>;
  /** 패턴 그룹 배열 */
  groups: PatternGroup[];
}

export interface DaySummary {
  /** Day의 큰 제목, e.g. "HAVE · GET · KEEP" */
  dayTitle: string;
  /** "이 날의 핵심" 한 문장 (홈 목차의 카드에도 노출) */
  headline: string;
  /** 핵심 포인트 불릿 리스트. markdown 강조 문법 허용 (`**굵게**`, `*기울임*`, `` `code` ``) */
  keyPoints: string[];
  /** 꼭 기억할 것 (선택). 있으면 📌 아이콘과 함께 강조 배경으로 표시 */
  mustRemember?: string[];
}

export interface PatternGroup {
  /** 고유 ID. 형식: "m{month}d{day}-{topic}", e.g. "m2d1-leave" */
  id: string;
  /** Day 번호 (1부터 시작) */
  day: number;
  /** 해당 Day의 주제 (같은 day의 모든 그룹이 동일) */
  dayTopic: string;
  /** 그룹 제목 */
  title: string;
  /** 패턴 구조 설명 (선택) */
  pattern?: string;
  /** 그룹 의미 한 줄 설명 (선택) */
  meaning?: string;
  /** 예문 배열. 수업노트 전용 그룹은 빈 배열일 수 있음 */
  examples: Example[];
  /** 있으면 "수업노트 전용" 그룹 (예문이 없거나 적고 notes 중심) */
  kind?: 'class-note';
  /** 그룹 레벨 필기 메모 (멀티라인, 각 원소가 한 줄) */
  notes?: string[];
  /** 필기 출처 표시용, e.g. "✏️ 개인 필기 (이미지 11)" 또는 "✏️ 수업노트 · 04/14" */
  noteSource?: string;
}

export interface Example {
  /** 영어 원문 */
  en: string;
  /** 한국어 뜻 */
  ko: string;
  /** 이 예문에 붙은 필기 메모 (선택). 예문 아래 ✏️ 아이콘과 함께 표시 */
  note?: string;
}


// ============================================
// 사용자 상태 (localStorage에 저장) — 최소화
// ============================================

export interface AppState {
  /** 마지막으로 본 Day (홈 "📍 최근 학습" 표시용) */
  lastViewedDay: { month: number; day: number } | null;
  /** 테마 (next-themes가 관리하지만 명시용) */
  theme?: 'light' | 'dark' | 'system';
  /** 연습 모드 상태 (v2.1 추가, v2.2에서도 동일 스키마 공유) */
  practice?: PracticeState;
}

// ============================================
// 연습 모드 영구 상태 (v2.1 추가, v2.2 공유)
// ============================================

/**
 * 연습 모드 영구 상태.
 *
 * v3: 어려움 플래그 외에 세션 히스토리 + 오답 보관함 추가.
 * 대시보드, 오답 보관함 재풀이 기능의 데이터 소스.
 */
export interface PracticeState {
  /**
   * 어려움 플래그가 켜진 예문들.
   * key 형식: `${groupId}:${exampleIdx}` (e.g. "m2d3-have:5")
   * 노트 페이지에 조용한 점으로 표시되는 용도.
   */
  difficultExamples: Record<string, DifficultFlag>;

  /**
   * 세션 기록. 대시보드 · 정답률 추이 계산용.
   * 최근 100회만 유지 (오래된 건 자동 삭제).
   */
  sessionHistory: SessionRecord[];

  /**
   * 오답 보관함. 세션에서 틀린 예문을 체계적으로 쌓아두고
   * /practice/wrong 에서 다시 풀 수 있게 함.
   */
  wrongBank: Record<string, WrongEntry>;
}

export interface DifficultFlag {
  /** 최초로 어려움 표시된 날짜 (ISO) */
  markedAt: string;
  /** 이 플래그가 유지된 세션 수 (표시용, 의사결정에 쓰지 않음) */
  sessionsStruggled: number;
}

/**
 * 한 세션의 기록 (v3 추가).
 * 세션이 끝날 때마다 append, 100개 초과 시 앞에서 pop.
 */
export interface SessionRecord {
  /** ISO timestamp 기반 고유 ID */
  id: string;
  /** 세션 시작 시각 (ISO) */
  startedAt: string;
  /** 세션 종료 시각 (ISO) */
  endedAt: string;
  /** 어디서 시작한 세션인지 */
  source: 'day' | 'global' | 'wrong-bank';
  /** day 세션일 때만 */
  day?: number;
  /** global 세션일 때만 */
  scope?: PracticeScope;
  /** 이 세션에서 사용한 유형들 */
  kinds: PracticeKind[];
  /** 총 문제 수 */
  total: number;
  /** 정답 수 */
  correct: number;
  /** 틀린 문제 key 목록 (`groupId:idx`) */
  wrongKeys: string[];
}

/**
 * 오답 보관함 엔트리 (v3 추가).
 * key = `${groupId}:${exampleIdx}`
 */
export interface WrongEntry {
  /** 최초로 틀린 시각 (ISO) */
  firstWrongAt: string;
  /** 가장 최근에 틀린 시각 (ISO) */
  lastWrongAt: string;
  /** 총 틀린 횟수 */
  wrongCount: number;
}

// ============================================
// 연습 유형 · 질문 (v2.1 + v2.2 확장)
// ============================================

/** 연습 유형 */
export type PracticeKind =
  // v2.1 (Day별 연습)
  | 'fill-in'            // 빈칸 채우기 (같은 Day 자매 그룹 동사 고르기)
  | 'pattern-choice'     // 한국어 → 패턴 이름 고르기
  | 'sort-transitivity'  // 자·타동사 분류 (Day 1 전용)

  // v2.2 (전체 연습)
  | 'collocation'        // 동사 + 짝꿍 목적어/전치사 (Day 경계 없음)
  | 'minimal-pairs'      // 비슷한 동사 구분 (자매 그룹 크로스-Day)
  | 'composition';       // 한국어 → 영어 타이핑

/** 한 문제 */
export interface PracticeQuestion {
  kind: PracticeKind;
  groupId: string;
  exampleIdx: number;

  /** 한국어 프롬프트 */
  prompt: string;
  /** 영어 정답 원문 (정답 공개 시 보여줌) */
  fullEn: string;
  /** 정답 (빈칸에 들어갈 단어, 또는 패턴 이름, 또는 작문 정답 전문) */
  answer: string;

  // ── fill-in / minimal-pairs / collocation ──
  choices?: string[];
  /** 빈칸이 하나일 때 시작 위치 (fullEn 기준) */
  blankStart?: number;
  blankLength?: number;

  // ── collocation 전용 (v2.2) ──
  /** 빈칸이 2개일 때 (동사+전치사 세트 고르기 등) */
  blanks?: Array<{ start: number; length: number; answer: string }>;
  /** 그룹의 pattern 문자열 (힌트용) — e.g. "invest money in 투자처" */
  groupPattern?: string;
  /** 서브 유형 */
  subKind?: 'fill-preposition' | 'fill-verb-and-prep' | 'detect-transitivity-error';

  // ── minimal-pairs 전용 (v2.2) ──
  /** 정답 그룹의 title (e.g. "KEEP") */
  correctGroupTitle?: string;
  /** 정답 그룹의 meaning */
  correctGroupMeaning?: string;
  /** 오답 선택지별 간단 설명 { [choice]: "HAVE · 정적 소유" } */
  wrongGroupBrief?: Record<string, string>;

  // ── composition 전용 (v2.2) ──
  /** 힌트 (그룹 pattern 또는 title) */
  hint?: string;
  /** 한국어 원문 (prompt과 동일. 명시성 위해 별도 필드) */
  ko?: string;
}

// ============================================
// 세션 설정 & 결과
// ============================================

/** Day별 연습 세션 설정 (v2.1) */
export interface PracticeSessionConfig {
  day: number;
  kinds: PracticeKind[];  // 복수 선택 가능
  length: 5 | 10 | 'all' | 'difficult-only';
}

/** 전체 연습 범위 (v2.2) */
export type PracticeScope = 'all' | 'd1-3' | 'd4-5';

/** 전체 연습 세션 설정 (v2.2) */
export interface GlobalPracticeConfig {
  scope: PracticeScope;
  kinds: PracticeKind[];  // ['collocation', 'minimal-pairs', 'composition']에서 복수 선택
  length: 5 | 10 | 20 | 'difficult-only';
}

/** 세션 결과 (세션 종료 화면용, 영구 저장 X) */
export interface PracticeSessionResult {
  total: number;
  correct: number;
  wrong: PracticeQuestion[];  // 틀린 문제 목록
  newlyDifficult: string[];   // 이번 세션에 어려움 표시된 key들
}

/** 작문 채점 결과 (v2.2) */
export type CompositionVerdict =
  | 'exact'     // 정확히 일치
  | 'reorder'   // 단어는 맞는데 순서 다름
  | 'partial'   // 핵심 단어 일부 일치 (≥70%)
  | 'mismatch'; // 다름

export interface CompositionResult {
  verdict: CompositionVerdict;
  /** 내 답 단어 배열 (정규화 후) */
  userWords: string[];
  /** 정답 단어 배열 (정규화 후) */
  answerWords: string[];
  /** 매칭된 단어 비율 (0~1) */
  matchRatio: number;
}

/** localStorage 키 (AppState 하나로 합침) */
export const STORAGE_KEY = 'english-notebook-state';


// ============================================
// 상수 · 유틸
// ============================================

export const TOTAL_MONTHS = 10;
export const BEGINNER_MONTHS = 4;

export function getLevel(month: number): Level {
  return month <= BEGINNER_MONTHS ? 'beginner' : 'intermediate';
}

export function getLevelLabel(level: Level): string {
  return level === 'beginner' ? '초급' : '중급';
}

/** 특정 Day의 모든 그룹 가져오기 (dayTopic과 day 기준) */
export function getGroupsByDay(curriculum: CurriculumData, day: number): PatternGroup[] {
  return curriculum.groups.filter(g => g.day === day);
}

/** 특정 Day의 수업노트 그룹만 가져오기 */
export function getClassNotesByDay(curriculum: CurriculumData, day: number): PatternGroup[] {
  return curriculum.groups.filter(g => g.day === day && g.kind === 'class-note');
}

/** 특정 Day의 일반(예문 중심) 그룹만 가져오기 */
export function getRegularGroupsByDay(curriculum: CurriculumData, day: number): PatternGroup[] {
  return curriculum.groups.filter(g => g.day === day && g.kind !== 'class-note');
}

/** 모든 Day 번호 (오름차순) */
export function getAllDays(curriculum: CurriculumData): number[] {
  const days = new Set(curriculum.groups.map(g => g.day));
  return Array.from(days).sort((a, b) => a - b);
}


// ============================================
// Day별 연습 유틸 (v2.1)
// ============================================

/**
 * 같은 Day 내의 "자매 그룹" 찾기.
 * Day별 연습의 빈칸 채우기·동사 고르기에서 선택지 생성용.
 *
 * 예: Day 3 "have" 그룹의 자매는 "get", "keep"
 *     Day 4 "try-N"의 자매는 "try-ing", "try-to-V"
 *     Day 2 "can-could-might"의 자매는 "will", "should" 등
 *
 * v2.2의 CROSS_DAY_SISTERS와 별개. 이건 Day 경계 내부.
 */
const SISTER_GROUPS: Record<string, string[]> = {
  // Day 3: HAVE · GET · KEEP
  'm2d3-have':  ['m2d3-get', 'm2d3-keep'],
  'm2d3-get':   ['m2d3-have', 'm2d3-keep'],
  'm2d3-keep':  ['m2d3-have', 'm2d3-get'],

  // Day 4: TRY 3형제
  'm2d4-try-N':    ['m2d4-try-ing', 'm2d4-try-to-V'],
  'm2d4-try-ing':  ['m2d4-try-N',   'm2d4-try-to-V'],
  'm2d4-try-to-V': ['m2d4-try-N',   'm2d4-try-ing'],

  // Day 2: 조동사 상호 비교
  'm2d2-will':             ['m2d2-should', 'm2d2-can-could-might', 'm2d2-haveto'],
  'm2d2-should':           ['m2d2-will',   'm2d2-haveto'],
  'm2d2-can-could-might':  ['m2d2-will',   'm2d2-should'],
  'm2d2-haveto':           ['m2d2-should', 'm2d2-will'],
};

export function getSisterGroupIds(groupId: string): string[] {
  return SISTER_GROUPS[groupId] ?? [];
}

/** 어려움 플래그 key 생성 */
export function difficultKey(groupId: string, exampleIdx: number): string {
  return `${groupId}:${exampleIdx}`;
}

/** 특정 예문이 어려움 표시됐는지 */
export function isDifficult(practice: PracticeState | undefined, groupId: string, exampleIdx: number): boolean {
  if (!practice) return false;
  return difficultKey(groupId, exampleIdx) in practice.difficultExamples;
}

/** 특정 Day에서 어려움 표시된 예문 개수 */
export function countDifficultInDay(practice: PracticeState | undefined, curriculum: CurriculumData, day: number): number {
  if (!practice) return 0;
  const dayGroupIds = new Set(curriculum.groups.filter(g => g.day === day).map(g => g.id));
  return Object.keys(practice.difficultExamples).filter(k => {
    const [gid] = k.split(':');
    return dayGroupIds.has(gid);
  }).length;
}

/** 전체 어려움 개수 (v2.2 홈 배너용) */
export function countAllDifficult(practice: PracticeState | undefined): number {
  if (!practice) return 0;
  return Object.keys(practice.difficultExamples).length;
}


// ============================================
// 전체 연습 유틸 (v2.2)
// ============================================

/**
 * 크로스-Day 자매 그룹 묶음.
 * 전체 연습의 minimal-pairs 문제에서 선택지를 만들 때 참조.
 */
export const CROSS_DAY_SISTERS: Record<string, string[]> = {
  // 소유 4동사 — D3, D4 크로스
  'm2d3-have':       ['m2d3-get', 'm2d3-keep', 'm2d4-take-basic'],
  'm2d3-get':        ['m2d3-have', 'm2d3-keep', 'm2d4-take-basic'],
  'm2d3-keep':       ['m2d3-have', 'm2d3-get', 'm2d4-take-basic'],
  'm2d4-take-basic': ['m2d3-have', 'm2d3-get', 'm2d3-keep'],

  // try 3형제 — D4
  'm2d4-try-N':     ['m2d4-try-ing', 'm2d4-try-to-V'],
  'm2d4-try-ing':   ['m2d4-try-N',   'm2d4-try-to-V'],
  'm2d4-try-to-V':  ['m2d4-try-N',   'm2d4-try-ing'],

  // 조동사 — D2
  'm2d2-will':             ['m2d2-should', 'm2d2-can-could-might', 'm2d2-haveto'],
  'm2d2-should':           ['m2d2-will',   'm2d2-can-could-might', 'm2d2-haveto'],
  'm2d2-can-could-might':  ['m2d2-will',   'm2d2-should',          'm2d2-haveto'],
  'm2d2-haveto':           ['m2d2-will',   'm2d2-should',          'm2d2-can-could-might'],

  // too vs enough (D5) — 구조별 쌍 (순환 ↔ 순환, 직선 ↔ 직선…)
  'm2d5-too-circular':    ['m2d5-enough-circular'],
  'm2d5-enough-circular': ['m2d5-too-circular'],
  'm2d5-too-straight':    ['m2d5-enough-straight'],
  'm2d5-enough-straight': ['m2d5-too-straight'],
  'm2d5-too-it-subject':    ['m2d5-enough-it-subject'],
  'm2d5-enough-it-subject': ['m2d5-too-it-subject'],
};

export function getCrossDaySisters(groupId: string): string[] {
  return CROSS_DAY_SISTERS[groupId] ?? [];
}

/** 범위에 해당하는 Day 번호들 */
export function daysInScope(scope: PracticeScope, allDays: number[]): number[] {
  if (scope === 'all')  return allDays;
  if (scope === 'd1-3') return allDays.filter(d => d >= 1 && d <= 3);
  if (scope === 'd4-5') return allDays.filter(d => d >= 4 && d <= 5);
  return allDays;
}

/** 특정 범위의 그룹들 */
export function groupsInScope(
  curriculum: CurriculumData,
  scope: PracticeScope
): PatternGroup[] {
  const days = daysInScope(scope, getAllDays(curriculum));
  return curriculum.groups.filter(g => days.includes(g.day));
}

/**
 * 그룹의 pattern 문자열에서 짝꿍 전치사를 추출 (collocation 문제 생성용).
 *
 * 예: "invest money in 투자처" → { verb: "invest", prep: "in" }
 *     "bet money on 돈을 거는 대상" → { verb: "bet", prep: "on" }
 *     "help someone with 일" → { verb: "help", prep: "with" }
 *     "leave 출발지 for 목적지" → { verb: "leave", prep: "for" }
 *
 * 알려진 전치사 집합 외의 단어는 무시. 추출 실패 시 null.
 */
const KNOWN_PREPS = new Set([
  'in', 'on', 'at', 'to', 'for', 'with', 'by',
  'from', 'into', 'onto', 'about', 'of', 'off'
]);

export function extractCollocation(pattern: string | undefined): { verb: string; prep: string } | null {
  if (!pattern) return null;
  const words = pattern.toLowerCase().split(/\s+/);
  if (words.length < 2) return null;
  const verb = words[0];
  const prep = words.find(w => KNOWN_PREPS.has(w));
  if (!prep) return null;
  return { verb, prep };
}

/**
 * "이 자동사 뒤엔 반드시 이 전치사" 목록.
 * detect-transitivity-error 서브 유형 문제 생성용.
 *
 * 데이터에서 자동 추출되지 않는 부분이므로 수동 관리.
 * 새 동사가 추가되면 여기 등록.
 */
export const INTRANSITIVE_PREP_RULES: Record<string, { required: string; meaning: string }> = {
  arrive:   { required: 'at/in',   meaning: '장소에 도착' },
  listen:   { required: 'to',      meaning: '~을 듣다 (귀 기울이다)' },
  talk:     { required: 'to/with', meaning: '~와 얘기하다' },
  wait:     { required: 'for',     meaning: '~을 기다리다' },
  look:     { required: 'at',      meaning: '~을 보다 (시선)' },
  go:       { required: 'to',      meaning: '~에 가다' },
  laugh:    { required: 'at',      meaning: '~을 비웃다' },
};


// ============================================
// 작문 채점 유틸 (v2.2)
// ============================================

/** 작문 비교용 정규화: 소문자, 괄호/구두점 제거, 공백 정돈 */
export function normalizeForGrading(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[()[\]{}]/g, ' ')        // 괄호 제거
    .replace(/[.,!?;:"']/g, ' ')       // 구두점 제거
    .replace(/\s+/g, ' ')              // 여백 정돈
    .trim()
    .split(' ')
    .filter(Boolean);
}

/** 작문 채점 — 단순 비교 기반 */
export function gradeComposition(user: string, answer: string): CompositionResult {
  const userWords = normalizeForGrading(user);
  const answerWords = normalizeForGrading(answer);

  // 1. 완전 일치
  if (userWords.join(' ') === answerWords.join(' ')) {
    return { verdict: 'exact', userWords, answerWords, matchRatio: 1 };
  }

  // 2. 순서만 다름 (정렬 후 일치)
  const sortedUser = [...userWords].sort().join(' ');
  const sortedAnswer = [...answerWords].sort().join(' ');
  if (sortedUser === sortedAnswer) {
    return { verdict: 'reorder', userWords, answerWords, matchRatio: 1 };
  }

  // 3. 매칭 비율
  const answerSet = new Set(answerWords);
  const matched = userWords.filter(w => answerSet.has(w)).length;
  const ratio = answerWords.length === 0 ? 0 : matched / answerWords.length;

  if (ratio >= 0.7) {
    return { verdict: 'partial', userWords, answerWords, matchRatio: ratio };
  }

  return { verdict: 'mismatch', userWords, answerWords, matchRatio: ratio };
}


// ============================================
// 세션 히스토리 · 오답 보관함 · 대시보드 유틸 (v3)
// ============================================

export const MAX_SESSION_HISTORY = 100;

/** 세션 히스토리에 추가. 오래된 건 자동 삭제. */
export function appendSessionHistory(
  state: PracticeState,
  record: SessionRecord
): PracticeState {
  const history = [...state.sessionHistory, record];
  if (history.length > MAX_SESSION_HISTORY) {
    history.splice(0, history.length - MAX_SESSION_HISTORY);
  }
  return { ...state, sessionHistory: history };
}

/** 오답 보관함에 추가/업데이트 */
export function addToWrongBank(
  state: PracticeState,
  key: string,
  now = new Date().toISOString()
): PracticeState {
  const existing = state.wrongBank[key];
  const entry: WrongEntry = existing
    ? { ...existing, lastWrongAt: now, wrongCount: existing.wrongCount + 1 }
    : { firstWrongAt: now, lastWrongAt: now, wrongCount: 1 };
  return {
    ...state,
    wrongBank: { ...state.wrongBank, [key]: entry },
  };
}

/** 오답 보관함에서 제거 (맞췄을 때) */
export function removeFromWrongBank(state: PracticeState, key: string): PracticeState {
  const { [key]: _, ...rest } = state.wrongBank;
  return { ...state, wrongBank: rest };
}

/** 오답 보관함 크기 */
export function countWrongBank(state: PracticeState | undefined): number {
  if (!state) return 0;
  return Object.keys(state.wrongBank).length;
}

// ── 대시보드 집계 ──────────────────────────────────

/** 회차별 정답률 추이 (최근 N개) */
export function getAccuracyTrend(state: PracticeState, lastN = 20): Array<{
  id: string;
  date: string;        // YYYY-MM-DD
  accuracy: number;    // 0~1
  total: number;
}> {
  return state.sessionHistory.slice(-lastN).map(s => ({
    id: s.id,
    date: s.startedAt.slice(0, 10),
    accuracy: s.total === 0 ? 0 : s.correct / s.total,
    total: s.total,
  }));
}

/** Day별 정답률 집계 */
export function getAccuracyByDay(state: PracticeState): Array<{
  day: number;
  attempted: number;
  correct: number;
  accuracy: number;
}> {
  const byDay: Record<number, { attempted: number; correct: number }> = {};
  for (const s of state.sessionHistory) {
    if (s.source === 'day' && s.day != null) {
      byDay[s.day] ??= { attempted: 0, correct: 0 };
      byDay[s.day].attempted += s.total;
      byDay[s.day].correct += s.correct;
    }
  }
  return Object.entries(byDay)
    .map(([day, v]) => ({
      day: Number(day),
      attempted: v.attempted,
      correct: v.correct,
      accuracy: v.attempted === 0 ? 0 : v.correct / v.attempted,
    }))
    .sort((a, b) => a.day - b.day);
}

/** 유형별 정답률 집계 */
export function getAccuracyByKind(state: PracticeState): Array<{
  kind: PracticeKind;
  attempted: number;
  correct: number;
  accuracy: number;
}> {
  // 세션별로 kinds가 복수일 수 있음.
  // 현재 구조에선 session.total을 kinds 개수로 균등 분배 (근사치).
  // 정확하려면 문제 단위 기록이 필요하지만 v3 단순 버전은 세션 레벨로 충분.
  const byKind: Record<string, { attempted: number; correct: number }> = {};
  for (const s of state.sessionHistory) {
    const per = s.kinds.length === 0 ? 1 : s.kinds.length;
    for (const k of s.kinds) {
      byKind[k] ??= { attempted: 0, correct: 0 };
      byKind[k].attempted += Math.round(s.total / per);
      byKind[k].correct += Math.round(s.correct / per);
    }
  }
  return Object.entries(byKind).map(([k, v]) => ({
    kind: k as PracticeKind,
    attempted: v.attempted,
    correct: v.correct,
    accuracy: v.attempted === 0 ? 0 : v.correct / v.attempted,
  }));
}

/**
 * 가장 많이 틀린 그룹 Top N.
 * wrongBank의 key(`groupId:idx`)를 groupId 기준으로 집계.
 */
export function getTopWrongGroups(
  state: PracticeState,
  topN = 5
): Array<{ groupId: string; wrongCount: number; uniqueExamples: number }> {
  const byGroup: Record<string, { count: number; examples: Set<string> }> = {};
  for (const [key, entry] of Object.entries(state.wrongBank)) {
    const [groupId, idx] = key.split(':');
    byGroup[groupId] ??= { count: 0, examples: new Set() };
    byGroup[groupId].count += entry.wrongCount;
    byGroup[groupId].examples.add(idx);
  }
  return Object.entries(byGroup)
    .map(([groupId, v]) => ({
      groupId,
      wrongCount: v.count,
      uniqueExamples: v.examples.size,
    }))
    .sort((a, b) => b.wrongCount - a.wrongCount)
    .slice(0, topN);
}

/** 전체 집계: 총 세션 수, 총 푼 문제 수, 총 정답 수, 전체 정답률 */
export function getOverallStats(state: PracticeState): {
  sessions: number;
  totalQuestions: number;
  totalCorrect: number;
  overallAccuracy: number;
} {
  const sessions = state.sessionHistory.length;
  const totalQuestions = state.sessionHistory.reduce((sum, s) => sum + s.total, 0);
  const totalCorrect = state.sessionHistory.reduce((sum, s) => sum + s.correct, 0);
  return {
    sessions,
    totalQuestions,
    totalCorrect,
    overallAccuracy: totalQuestions === 0 ? 0 : totalCorrect / totalQuestions,
  };
}

/** 빈 PracticeState */
export function emptyPracticeState(): PracticeState {
  return {
    difficultExamples: {},
    sessionHistory: [],
    wrongBank: {},
  };
}
```

## 제거된 타입 (v1에서 있던 것들)

참고용. v2 이후로는 **쓰지 않음**:

- ❌ `REVIEW_INTERVALS` (망각곡선 간격)
- ❌ `GroupProgress` (복습 스테이지·카운트·북마크)
- ❌ `ReviewStatus` (Due/Upcoming/Done)
- ❌ `ExamCard`, `ExamState` (플래시카드)
- ❌ `monthTopics` (월별 주제 편집)
- ❌ `customGroups` (커스텀 그룹 직접 추가)

이 타입들이 코드 어딘가에 남아있다면 모두 삭제할 것.

---

## 데이터 예시 (curriculum-m2.json 발췌)

```json
{
  "month": 2,
  "level": "beginner",
  "topic": "Catch up · 구문 학습 집중달",
  "topicNote": "동사암기 · 조동사 · have/get/keep · take · try · too~to · enough",
  "daySummaries": {
    "3": {
      "dayTitle": "HAVE · GET · KEEP",
      "headline": "상태를 뒤에 붙이는 3개 동사 — 태도가 다르다",
      "keyPoints": [
        "공통 구조: **S + [have/get/keep] + O + [상태]** (adv / adj / p+n / -ed / -ing)",
        "**HAVE** = 정적인 소유. 그 상태가 이미 확보되어 있음. `I have the door open` = 문이 열려있는 상태",
        "**GET** = 동작. 그 상태가 **되게 만듦**. `Get the door open` = 어떻게든 열리게 만들어",
        "**KEEP** = 유지·자제. 반대로 움직이려는 걸 막음. `Keep the door open` = 계속 열려있게 지켜"
      ],
      "mustRemember": [
        "같은 'door open' 상태라도 → have(이미) / get(만듦) / keep(유지)",
        "소유 4동사: have(정적) · get(동적+put) · keep(지킴) · take(공격적)"
      ]
    }
  },
  "groups": [
    {
      "id": "m2d3-have",
      "day": 3,
      "dayTopic": "HAVE · GET · KEEP",
      "title": "HAVE",
      "pattern": "확보되어 있는 상태 — 정적인 소유",
      "meaning": "~한 상태로 가지고 있다 (상태 유지)",
      "examples": [
        { "en": "We have the tent up now.", "ko": "우린 텐트 다 세워놨어." },
        { "en": "I had 3 days off (work).", "ko": "나 3일 쉬었었어.", "note": "✏️ off (work) = 일에서 떨어져 있는 상태" }
      ]
    },
    {
      "id": "m2d3-possession-verbs-overview",
      "day": 3,
      "dayTopic": "HAVE · GET · KEEP",
      "title": "소유 4동사 개요",
      "kind": "class-note",
      "noteSource": "✏️ 개인 필기 (이미지 8, 10)",
      "notes": [
        "소유 4동사 비교:",
        "  • HAVE = 정적인 소유",
        "  • GET  = 동적인 소유 + put",
        "  • KEEP = 지켜내는 소유",
        "  • TAKE = 공격적 소유"
      ],
      "examples": []
    }
  ]
}
```

---

## 렌더링 가이드

### `daySummary.keyPoints`와 `mustRemember`의 마크다운
각 원소는 짧은 마크다운. 처리해야 할 것:

- `**텍스트**` → `<strong>` (굵게)
- `*텍스트*` → `<em>` (기울임)
- `` `코드` `` → `<code>` (고정폭 폰트, 옅은 배경)

**간단한 구현 예시 (정규식):**
```tsx
function renderInlineMarkdown(text: string): React.ReactNode {
  // **bold** → <strong>
  // `code` → <code>
  // *italic* → <em>
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return tokens.map((t, i) => {
    if (t.startsWith('**') && t.endsWith('**')) return <strong key={i}>{t.slice(2, -2)}</strong>;
    if (t.startsWith('`') && t.endsWith('`')) return <code key={i} className="...">{t.slice(1, -1)}</code>;
    if (t.startsWith('*') && t.endsWith('*')) return <em key={i}>{t.slice(1, -1)}</em>;
    return <span key={i}>{t}</span>;
  });
}
```

완전한 마크다운 파서는 과하니 이 정도로 충분. `react-markdown` 같은 라이브러리 **사용하지 말 것** (번들 크기 낭비).

### `group.notes` 렌더링
각 원소가 한 줄. 빈 문자열이면 여백 처리. 들여쓰기(`  • `)는 그대로 표시 (pre-wrap 또는 monospace 폰트 고려).

```tsx
<div className="whitespace-pre-wrap font-sans">
  {group.notes.join('\n')}
</div>
```

들여쓰기 잘 보이게 하려면:
```tsx
{group.notes.map((line, i) =>
  line === '' ? <div key={i} className="h-2" /> :
  <div key={i} className="whitespace-pre">{line}</div>
)}
```

---

## 주의사항

- **`kind: 'class-note'`인 그룹은 예문이 없을 수 있다.** UI에서 분기 처리 필수. Day 페이지에서는 이 그룹들을 **따로 모아서 상단 수업노트 박스로** 렌더링하는 것이 맞음.
- **`noteSource`는 표시용 텍스트**. 링크나 구조화된 값 아님.
- **`example.note`와 `group.notes`는 다른 것**. 전자는 예문 한 줄 주석, 후자는 그룹 전체 필기.
- **ID 형식**: `m{month}d{day}-{topic-slug}`. 월/일로 정렬 쉽게 가능.
- **연습 모드 타입은 2가지 용도로 쓰임**: `SISTER_GROUPS` (Day 내, v2.1) / `CROSS_DAY_SISTERS` (Day 경계 없음, v2.2). 헷갈리지 말 것.
