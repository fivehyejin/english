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

export interface AppState {
  lastViewedDay: { month: number; day: number } | null;
  theme?: 'light' | 'dark' | 'system';
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
