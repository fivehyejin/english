'use client';

import { cn } from '@/lib/utils';
interface Props {
  title: string;
  description: string;
  count: number;
  selected: boolean;
  onToggle: () => void;
}

export function KindCard({
  title,
  description,
  count,
  selected,
  onToggle,
}: Props) {
  const disabled = count === 0;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        'mb-3 flex w-full rounded-lg border p-4 text-left transition-colors',
        disabled && 'cursor-not-allowed opacity-50',
        !disabled && selected && 'border-primary bg-primary/5',
        !disabled && !selected && 'hover:bg-muted'
      )}
    >
      <span
        className={cn(
          'mt-0.5 mr-3 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border',
          selected && 'border-primary bg-primary',
          !selected && 'border-muted-foreground/40'
        )}
        aria-hidden
      >
        {selected ? (
          <span className="text-[10px] text-primary-foreground">✓</span>
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="font-medium">{title}</span>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {count}문제
          </span>
        </span>
        <span className="mt-1 block text-sm text-muted-foreground">
          {description}
        </span>
      </span>
    </button>
  );
}
