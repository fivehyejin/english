// ============================================
// 커리큘럼 데이터 (읽기 전용)
// ============================================

export type Level = 'beginner' | 'intermediate';

export interface CurriculumData {
  month: number;
  level: Level;
  topic: string;
  topicNote?: string;
  daySummaries: Record<number, DaySummary>;
  groups: PatternGroup[];
}

export interface DaySummary {
  dayTitle: string;
  headline: string;
  keyPoints: string[];
  mustRemember?: string[];
  diagram?: {
    svg: string;
    caption?: string;
  };
}

export interface PatternGroup {
  id: string;
  day: number;
  dayTopic: string;
  title: string;
  pattern?: string;
  meaning?: string;
  examples: Example[];
  kind?: 'class-note';
  notes?: string[];
  noteSource?: string;
}

export interface Example {
  en: string;
  ko: string;
  note?: string;
}

// ============================================
// 사용자 상태 (localStorage)
// ============================================

export interface PracticeState {
  difficultExamples: Record<string, DifficultFlag>;
  sessionHistory: SessionRecord[];
  wrongBank: Record<string, WrongEntry>;
  /** Speak Mode: 한국어만 보이는 시간(초). 미설정 시 UI 기본 5 */
  speakDelay?: SpeakDelaySeconds;
}

export interface AppState {
  lastViewedDay: { month: number; day: number } | null;
  theme?: 'light' | 'dark' | 'system';
  practice?: PracticeState;
  /** 레거시: 마이그레이션 후 제거됨 */
  difficultExamples?: Record<string, DifficultFlag>;
}

export interface DifficultFlag {
  markedAt: string;
  sessionsStruggled: number;
}

export type PracticeSource = 'day' | 'global' | 'wrong-bank';

export interface SessionRecord {
  id: string;
  startedAt: string;
  endedAt: string;
  source: PracticeSource;
  day?: number;
  scope?: PracticeScope;
  kinds: PracticeKind[];
  total: number;
  correct: number;
  wrongKeys: string[];
}

export interface WrongEntry {
  firstWrongAt: string;
  lastWrongAt: string;
  wrongCount: number;
}

/** 호환용 별칭 */
export type DifficultExample = DifficultFlag;

// ============================================
// 연습 유형 · 질문 (v2.1 + v2.2)
// ============================================

export type PracticeKind =
  | 'fill-in'
  | 'pattern-choice'
  | 'sort-transitivity'
  | 'speak'
  | 'collocation'
  | 'minimal-pairs'
  | 'composition';

/** Speak Mode · 한국어 노출 시간(초), localStorage `practice.speakDelay` */
export type SpeakDelaySeconds = 3 | 5 | 7;

export interface PracticeQuestion {
  id: string;
  kind: PracticeKind;
  groupId: string;
  exampleIdx: number;
  /** Day 연습 UI용 */
  groupTitle?: string;
  prompt: string;
  fullEn: string;
  answer: string;
  choices?: string[];
  ko?: string;
  blankStart?: number;
  blankLength?: number;
  blanks?: Array<{ start: number; length: number; answer: string }>;
  groupPattern?: string;
  subKind?: 'fill-preposition' | 'fill-verb-and-prep' | 'detect-transitivity-error';
  correctGroupTitle?: string;
  correctGroupMeaning?: string;
  wrongGroupBrief?: Record<string, string>;
  hint?: string;
  /** detect-transitivity-error: INTRANSITIVE_PREP_RULES 키 */
  ruleVerb?: string;
  /** minimal-pairs(TRY 등): fullEn에서 가릴 부분 문자열 */
  blankToken?: string;
  /** detect-transitivity-error: 문법적으로 맞는 원문 */
  expectedFullEn?: string;
}

/** Day별 연습 세션 설정 (v2.1) */
export interface PracticeSessionConfig {
  day: number;
  kinds: PracticeKind[];
  length: 5 | 10 | 'all' | 'difficult-only';
}

export type PracticeScope =
  | 'all'
  | 'd1-2'
  | 'd3-4'
  | 'd5-6'
  | 'd7-8';

export interface GlobalPracticeConfig {
  scope: PracticeScope;
  kinds: PracticeKind[];
  length: 5 | 10 | 20 | 'all' | 'difficult-only';
  retryWrongInSession?: boolean;
  source?: PracticeSource;
}

export interface PracticeSessionResult {
  total: number;
  correct: number;
  wrong: PracticeQuestion[];
  newlyDifficult: string[];
  retryTotal?: number;
  retryCorrect?: number;
}

export type CompositionVerdict =
  | 'exact'
  | 'reorder'
  | 'partial'
  | 'mismatch';

export interface CompositionResult {
  verdict: CompositionVerdict;
  userWords: string[];
  answerWords: string[];
  matchRatio: number;
}

export const STORAGE_KEY = 'english-notebook-state';
export const MAX_SESSION_HISTORY = 100;

export const TOTAL_MONTHS = 10;
export const BEGINNER_MONTHS = 4;

export function getLevel(month: number): Level {
  return month <= BEGINNER_MONTHS ? 'beginner' : 'intermediate';
}

export function getLevelLabel(level: Level): string {
  return level === 'beginner' ? '초급' : '중급';
}

export function getGroupsByDay(
  curriculum: CurriculumData,
  day: number
): PatternGroup[] {
  return curriculum.groups.filter((g) => g.day === day);
}

export function getClassNotesByDay(
  curriculum: CurriculumData,
  day: number
): PatternGroup[] {
  return curriculum.groups.filter(
    (g) => g.day === day && g.kind === 'class-note'
  );
}

export function getRegularGroupsByDay(
  curriculum: CurriculumData,
  day: number
): PatternGroup[] {
  return curriculum.groups.filter(
    (g) => g.day === day && g.kind !== 'class-note'
  );
}

export function getAllDays(curriculum: CurriculumData): number[] {
  const days = new Set(curriculum.groups.map((g) => g.day));
  return Array.from(days).sort((a, b) => a - b);
}

export function difficultKey(groupId: string, exampleIdx: number): string {
  return `${groupId}:${exampleIdx}`;
}

export function parseDifficultKey(key: string): { groupId: string; exampleIdx: number } | null {
  const i = key.lastIndexOf(':');
  if (i <= 0) return null;
  const groupId = key.slice(0, i);
  const exampleIdx = Number(key.slice(i + 1));
  if (!Number.isFinite(exampleIdx)) return null;
  return { groupId, exampleIdx };
}

export function countAllDifficult(
  practice: PracticeState | undefined
): number {
  if (!practice?.difficultExamples) return 0;
  return Object.keys(practice.difficultExamples).length;
}

export function countWrongBank(practice: PracticeState | undefined): number {
  if (!practice) return 0;
  return Object.keys(practice.wrongBank).length;
}

export function emptyPracticeState(): PracticeState {
  return {
    difficultExamples: {},
    sessionHistory: [],
    wrongBank: {},
  };
}

export function getAccuracyTrend(
  practice: PracticeState,
  lastN = 20
): Array<{ id: string; date: string; accuracy: number; total: number }> {
  return practice.sessionHistory.slice(-lastN).map((s) => ({
    id: s.id,
    date: s.startedAt.slice(0, 10),
    accuracy: s.total === 0 ? 0 : s.correct / s.total,
    total: s.total,
  }));
}

export function getAccuracyByDay(
  practice: PracticeState
): Array<{ day: number; attempted: number; correct: number; accuracy: number }> {
  const byDay: Record<number, { attempted: number; correct: number }> = {};
  for (const s of practice.sessionHistory) {
    if (s.source !== 'day' || s.day == null) continue;
    byDay[s.day] ??= { attempted: 0, correct: 0 };
    byDay[s.day].attempted += s.total;
    byDay[s.day].correct += s.correct;
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

export function getAccuracyByKind(
  practice: PracticeState
): Array<{
  kind: PracticeKind;
  attempted: number;
  correct: number;
  accuracy: number;
}> {
  const byKind: Record<string, { attempted: number; correct: number }> = {};
  for (const s of practice.sessionHistory) {
    const per = s.kinds.length === 0 ? 1 : s.kinds.length;
    for (const kind of s.kinds) {
      byKind[kind] ??= { attempted: 0, correct: 0 };
      byKind[kind].attempted += Math.round(s.total / per);
      byKind[kind].correct += Math.round(s.correct / per);
    }
  }

  return Object.entries(byKind).map(([kind, v]) => ({
    kind: kind as PracticeKind,
    attempted: v.attempted,
    correct: v.correct,
    accuracy: v.attempted === 0 ? 0 : v.correct / v.attempted,
  }));
}

export function getTopWrongGroups(
  practice: PracticeState,
  topN = 5
): Array<{ groupId: string; wrongCount: number; uniqueExamples: number }> {
  const byGroup: Record<string, { count: number; examples: Set<string> }> = {};
  for (const [key, entry] of Object.entries(practice.wrongBank)) {
    const parsed = parseDifficultKey(key);
    if (!parsed) continue;
    byGroup[parsed.groupId] ??= { count: 0, examples: new Set() };
    byGroup[parsed.groupId].count += entry.wrongCount;
    byGroup[parsed.groupId].examples.add(String(parsed.exampleIdx));
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

export function getOverallStats(practice: PracticeState): {
  sessions: number;
  totalQuestions: number;
  totalCorrect: number;
  overallAccuracy: number;
} {
  const sessions = practice.sessionHistory.length;
  const totalQuestions = practice.sessionHistory.reduce(
    (sum, s) => sum + s.total,
    0
  );
  const totalCorrect = practice.sessionHistory.reduce(
    (sum, s) => sum + s.correct,
    0
  );
  return {
    sessions,
    totalQuestions,
    totalCorrect,
    overallAccuracy: totalQuestions === 0 ? 0 : totalCorrect / totalQuestions,
  };
}
