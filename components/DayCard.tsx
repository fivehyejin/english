import Link from 'next/link';

import type { DaySummary } from '@/types';

interface DayCardProps {
  day: number;
  dayTopic: string;
  summary: DaySummary;
  groupCount: number;
  exampleCount: number;
  classNoteCount: number;
  isRecent: boolean;
}

export function DayCard({
  day,
  dayTopic,
  summary,
  groupCount,
  exampleCount,
  classNoteCount,
  isRecent,
}: DayCardProps) {
  return (
    <Link
      href={`/day/${day}/`}
      className="block rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:p-6"
    >
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span className="tabular-nums">Day {day}</span>
        <span>·</span>
        <span className="truncate">{dayTopic}</span>
        {isRecent ? (
          <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-accent">
            📍 최근 학습
          </span>
        ) : null}
      </div>

      <h2 className="mt-3 text-lg font-semibold leading-snug md:text-xl">
        💡 {summary.headline}
      </h2>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs tabular-nums text-muted-foreground">
        <span>{groupCount} 그룹</span>
        <span>·</span>
        <span>{exampleCount} 예문</span>
        {classNoteCount > 0 ? (
          <>
            <span>·</span>
            <span>✏️ 수업노트 {classNoteCount}</span>
          </>
        ) : null}
      </div>
    </Link>
  );
}
