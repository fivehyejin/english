'use client';

import { CURRENT_CURRICULUM } from '@/lib/curriculum';
import { getAllDays, getGroupsByDay } from '@/types';
import { useLastViewedDay } from '@/hooks/useLastViewedDay';

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
  const curriculum = CURRENT_CURRICULUM;
  const days = getAllDays(curriculum).sort((a, b) => b - a);

  return (
    <div>
      {last ? (
        <p className="mb-6 text-sm text-muted-foreground">
          <span className="text-accent">📍</span> 최근 학습:{' '}
          <span className="font-medium tabular-nums text-foreground">
            Day {last.day}
          </span>
        </p>
      ) : null}

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
