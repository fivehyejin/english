'use client';

import { Volume2 } from 'lucide-react';

import type { Example } from '@/types';
import { Button } from '@/components/ui/button';

interface ExampleRowProps {
  example: Example;
  difficult?: boolean;
  onSpeak: () => void;
  onToggleDifficult?: () => void;
}

export function ExampleRow({
  example,
  difficult,
  onSpeak,
  onToggleDifficult,
}: ExampleRowProps) {
  return (
    <li className="group">
      <div className="grid grid-cols-1 gap-x-4 gap-y-1 md:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <div className="flex items-start gap-2">
            {onToggleDifficult ? (
              <button
                type="button"
                aria-label={difficult ? '어려움 표시 해제' : '어려움 표시'}
                title={difficult ? '어려움 표시 해제' : '어려움 표시'}
                onClick={onToggleDifficult}
                className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full transition-colors ${
                  difficult ? 'bg-muted-foreground' : 'bg-transparent ring-1 ring-border'
                }`}
              />
            ) : null}
            <div className="min-w-0">
              <p className="break-words text-base font-semibold text-foreground md:text-lg">
                {example.en}
              </p>
              <p className="mt-0.5 break-words text-sm text-muted-foreground md:text-base">
                {example.ko}
              </p>
            </div>
          </div>
          {example.note ? (
            <div className="mt-2 inline-block max-w-full rounded border border-[hsl(var(--note-border))] bg-[hsl(var(--note-bg))] px-2 py-1 text-xs text-muted-foreground">
              {example.note}
            </div>
          ) : null}
        </div>

        <div className="flex items-start justify-end md:justify-start">
          <Button
            size="icon"
            variant="ghost"
            type="button"
            onClick={onSpeak}
            aria-label="영어 예문 듣기"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </li>
  );
}
