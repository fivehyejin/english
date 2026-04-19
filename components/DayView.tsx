'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import type { DaySummary } from '@/types';
import {
  getAllDays,
  getClassNotesByDay,
  getRegularGroupsByDay,
} from '@/types';
import { CURRENT_CURRICULUM } from '@/lib/curriculum';
import { setLastViewedDay } from '@/lib/storage';

import { ClassNoteBox } from './ClassNoteBox';
import { DayNav } from './DayNav';
import { GroupSection } from './GroupSection';
import { KeyIdeaBox } from './KeyIdeaBox';

export function DayView({ day }: { day: number }) {
  const curriculum = CURRENT_CURRICULUM;
  const summary = curriculum.daySummaries[day] as DaySummary | undefined;

  useEffect(() => {
    setLastViewedDay(curriculum.month, day);
  }, [curriculum.month, day]);

  const classNotes = getClassNotesByDay(curriculum, day);
  const regular = getRegularGroupsByDay(curriculum, day);
  const allDays = getAllDays(curriculum);
  const idx = allDays.indexOf(day);
  const prevDay = idx > 0 ? allDays[idx - 1]! : null;
  const nextDay =
    idx >= 0 && idx < allDays.length - 1 ? allDays[idx + 1]! : null;

  if (!summary) {
    return null;
  }

  return (
    <article className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          목차로
        </Link>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground tabular-nums md:text-4xl">
        DAY {day}
      </h1>
      <h2 className="mt-2 text-xl font-semibold text-foreground md:text-2xl">
        {summary.dayTitle}
      </h2>

      <div className="mt-10 space-y-10 md:space-y-14">
        <KeyIdeaBox summary={summary} />

        {classNotes.map((g) => (
          <ClassNoteBox key={g.id} group={g} />
        ))}

        {regular.map((g) => (
          <GroupSection key={g.id} group={g} />
        ))}
      </div>

      <DayNav prevDay={prevDay} nextDay={nextDay} />
    </article>
  );
}
