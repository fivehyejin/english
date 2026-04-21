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

/** 호환용 별칭 */
export type DifficultExample = DifficultFlag;

// ============================================
// 연습 유형 · 질문 (v2.1 + v2.2)
// ============================================

export type PracticeKind =
  | 'fill-in'
  | 'pattern-choice'
  | 'sort-transitivity'
  | 'collocation'
  | 'minimal-pairs'
  | 'composition';

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

export type PracticeScope = 'all' | 'd1-3' | 'd4-5';

export interface GlobalPracticeConfig {
  scope: PracticeScope;
  kinds: PracticeKind[];
  length: 5 | 10 | 20 | 'difficult-only';
}

export interface PracticeSessionResult {
  total: number;
  correct: number;
  wrong: PracticeQuestion[];
  newlyDifficult: string[];
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
