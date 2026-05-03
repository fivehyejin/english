import Link from 'next/link';

interface DayNavProps {
  prevDay: number | null;
  nextDay: number | null;
}

export function DayNav({ prevDay, nextDay }: DayNavProps) {
  return (
    <nav className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-6">
      {prevDay != null ? (
        <Link
          href={`/day/${prevDay}/`}
          className="flex flex-col text-left text-sm text-foreground no-underline transition-colors hover:text-primary"
        >
          <span className="text-xs text-muted-foreground">← 이전</span>
          <span className="font-semibold tabular-nums">Day {prevDay}</span>
        </Link>
      ) : (
        <span />
      )}

      {nextDay != null ? (
        <Link
          href={`/day/${nextDay}/`}
          className="ml-auto flex flex-col text-right text-sm text-foreground no-underline transition-colors hover:text-primary"
        >
          <span className="text-xs text-muted-foreground">다음 →</span>
          <span className="font-semibold tabular-nums">Day {nextDay}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
