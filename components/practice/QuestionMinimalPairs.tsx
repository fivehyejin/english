'use client';

import { cn } from '@/lib/utils';
import type { PracticeQuestion } from '@/types';

import { renderBlanksFromQuestion } from './renderBlanks';

interface Props {
  q: PracticeQuestion;
  revealed: boolean;
  picked: string | null;
  onPick: (choice: string) => void;
}

export function QuestionMinimalPairs({
  q,
  revealed,
  picked,
  onPick,
}: Props) {
  const n = q.choices?.length ?? 0;
  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">{q.prompt}</p>
      <p className="mb-6 text-lg font-medium leading-relaxed md:text-xl">
        {renderBlanksFromQuestion(q, { revealed, picked })}
      </p>
      <div
        className={cn(
          'grid gap-3',
          n === 2 && 'grid-cols-2',
          n === 3 && 'grid-cols-3',
          n >= 4 && 'grid-cols-2 md:grid-cols-4'
        )}
      >
        {(q.choices ?? []).map((choice) => (
          <button
            key={choice}
            type="button"
            disabled={revealed}
            onClick={() => onPick(choice)}
            className={cn(
              'rounded-md border px-4 py-3 text-sm font-medium transition-colors',
              revealed &&
                choice === q.answer &&
                'border-green-500 bg-green-50 text-green-900 dark:bg-green-950/30 dark:text-green-100',
              revealed &&
                picked === choice &&
                choice !== q.answer &&
                'border-destructive bg-red-50 text-destructive dark:bg-red-950/30',
              !revealed && 'hover:bg-muted'
            )}
          >
            {choice}
          </button>
        ))}
      </div>
      {revealed ? (
        <div className="mt-6 space-y-3 text-sm">
          <div className="rounded-md border-l-4 border-l-green-500 bg-green-50 px-4 py-3 dark:bg-green-950/30">
            <div className="font-semibold">{q.correctGroupTitle}</div>
            {q.correctGroupMeaning ? (
              <div className="mt-0.5 text-muted-foreground">{q.correctGroupMeaning}</div>
            ) : null}
          </div>
          {picked && picked !== q.answer && q.wrongGroupBrief?.[picked] ? (
            <div className="rounded-md border px-4 py-3">
              <span className="text-muted-foreground">당신이 고른 {picked}는: </span>
              <span>{q.wrongGroupBrief[picked]}</span>
            </div>
          ) : null}
          <div className="rounded-md bg-muted/50 px-4 py-3">
            <div className="mb-1 text-xs text-muted-foreground">원문</div>
            <div>{q.fullEn.split('/')[0]?.trim()}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
