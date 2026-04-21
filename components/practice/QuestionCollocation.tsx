'use client';

import { INTRANSITIVE_PREP_RULES } from '@/lib/practice-global';
import { cn } from '@/lib/utils';
import type { PracticeQuestion } from '@/types';

import { renderBlanksFromQuestion } from './renderBlanks';

interface Props {
  q: PracticeQuestion;
  revealed: boolean;
  picked: string | null;
  onPick: (choice: string) => void;
}

export function QuestionCollocation({
  q,
  revealed,
  picked,
  onPick,
}: Props) {
  if (q.subKind === 'detect-transitivity-error') {
    return (
      <div>
        <p className="mb-2 text-sm text-muted-foreground">{q.prompt}</p>
        <p className="mb-6 text-lg font-medium leading-relaxed md:text-xl">
          {q.fullEn.split('/')[0]?.trim()}
        </p>
        <div className="grid grid-cols-2 gap-3">
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
        {revealed && q.expectedFullEn ? (
          <div className="mt-6 space-y-3 text-sm">
            <div className="rounded-md border-l-4 border-l-destructive bg-red-50 px-4 py-3 dark:bg-red-950/30">
              <div className="mb-1 text-xs text-muted-foreground">틀린 문장</div>
              <div className="line-through opacity-70">{q.fullEn.split('/')[0]?.trim()}</div>
            </div>
            <div className="rounded-md border-l-4 border-l-green-500 bg-green-50 px-4 py-3 dark:bg-green-950/30">
              <div className="mb-1 text-xs text-muted-foreground">올바른 문장</div>
              <div className="font-medium">{q.expectedFullEn}</div>
            </div>
            {q.ruleVerb && INTRANSITIVE_PREP_RULES[q.ruleVerb] ? (
              <p className="text-xs text-muted-foreground">
                {INTRANSITIVE_PREP_RULES[q.ruleVerb].meaning}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">{q.prompt}</p>
      <p className="mb-6 text-lg font-medium leading-relaxed md:text-xl">
        {renderBlanksFromQuestion(q, { revealed, picked })}
      </p>
      <div className="grid grid-cols-2 gap-3">
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
            {choice.includes(' / ') ? (
              <div className="flex flex-col items-center gap-0.5">
                {choice.split(' / ').map((w, i) => (
                  <span
                    key={i}
                    className={
                      i === 0
                        ? 'font-semibold'
                        : 'text-xs text-muted-foreground'
                    }
                  >
                    {w}
                  </span>
                ))}
              </div>
            ) : (
              choice
            )}
          </button>
        ))}
      </div>
      {revealed ? (
        <div className="mt-6 space-y-2 rounded-md bg-muted/50 px-4 py-3 text-sm">
          {q.groupPattern ? (
            <div>
              <div className="mb-1 text-xs text-muted-foreground">패턴</div>
              <div className="font-medium">{q.groupPattern}</div>
            </div>
          ) : null}
          <div>
            <div className="mb-1 text-xs text-muted-foreground">원문</div>
            <div>{q.fullEn.split('/')[0]?.trim()}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
