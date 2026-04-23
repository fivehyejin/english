'use client';

import Link from 'next/link';

import { useLastViewedDay } from '@/hooks/useLastViewedDay';
import { usePracticeState } from '@/hooks/usePracticeState';
import { CURRENT_CURRICULUM } from '@/lib/curriculum';
import { countWrongBank, getAllDays, getGroupsByDay } from '@/types';

import { DayCard } from './DayCard';

function statsForDay(day: number) {
  const groups = getGroupsByDay(CURRENT_CURRICULUM, day);
  let examples = 0;
  let classNotes = 0;
  for (const g of groups) {
    examples += g.examples.length;
    if (g.kind === 'class-note') classNotes += 1;
  }
  return {
    groupCount: groups.length,
    exampleCount: examples,
    classNoteCount: classNotes,
  };
}

export function HomeContent() {
  const last = useLastViewedDay();
  const { practice } = usePracticeState();
  const curriculum = CURRENT_CURRICULUM;
  const days = getAllDays(curriculum).sort((a, b) => b - a);
  const wrongCount = countWrongBank(practice);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {last ? (
          <Link
            href={`/day/${last.day}/`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            📍 최근 학습 · Day {last.day}
          </Link>
        ) : null}
        <Link
          href="/practice/"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          🎯 전체 연습
        </Link>
        <Link
          href="/dashboard/"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          📊 대시보드
        </Link>
        {wrongCount > 0 ? (
          <Link
            href="/practice/wrong/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            📝 오답 보관함 ({wrongCount})
          </Link>
        ) : null}
      </div>

      <div className="flex flex-col gap-4">
        {days.map((day) => {
          const summary = curriculum.daySummaries[day];
          if (!summary) return null;
          const s = statsForDay(day);
          const isRecent =
            last != null &&
            last.month === curriculum.month &&
            last.day === day;
          return (
            <DayCard
              key={day}
              day={day}
              dayTopic={summary.dayTitle}
              summary={summary}
              {...s}
              isRecent={isRecent}
            />
          );
        })}
      </div>
    </div>
  );
}
