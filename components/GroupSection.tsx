'use client';

import { Volume2 } from 'lucide-react';
import { toast } from 'sonner';

import { difficultKey, type PatternGroup } from '@/types';
import { speak, speakSequence } from '@/lib/speech';

import { Button } from '@/components/ui/button';
import { ExampleRow } from '@/components/ExampleRow';

interface GroupSectionProps {
  group: PatternGroup;
  difficultKeys?: Set<string>;
  onToggleDifficult?: (groupId: string, exampleIdx: number) => void;
}

export function GroupSection({
  group,
  difficultKeys,
  onToggleDifficult,
}: GroupSectionProps) {
  const playGroup = () => {
    const texts = group.examples.slice(0, 3).map((e) => e.en);
    if (!texts.length) {
      toast.error('재생할 예문이 없습니다.');
      return;
    }
    const ok = speakSequence(texts);
    if (!ok) {
      toast.error('이 브라우저는 음성 재생을 지원하지 않습니다.');
    }
  };

  const playOne = (en: string) => {
    const ok = speak(en);
    if (!ok) {
      toast.error('이 브라우저는 음성 재생을 지원하지 않습니다.');
    }
  };

  return (
    <section className="space-y-4">
      <header className="border-l-4 border-l-primary pl-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            {group.title}
          </h3>
          {group.examples.length > 0 ? (
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={playGroup}
              aria-label="그룹 예문 처음 세 줄 듣기"
              className="shrink-0"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
        {group.pattern ? (
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {group.pattern}
          </p>
        ) : null}
        {group.meaning ? (
          <p className="mt-1 text-base text-muted-foreground">{group.meaning}</p>
        ) : null}
      </header>

      {group.notes && group.notes.length > 0 ? (
        <div className="space-y-1 rounded-md border border-[hsl(var(--note-border))] bg-[hsl(var(--note-bg))] border-l-4 border-l-[hsl(var(--note-accent))] px-4 py-3 text-sm leading-relaxed text-foreground">
          {group.noteSource ? (
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              {group.noteSource}
            </div>
          ) : null}
          {group.notes.map((line, i) =>
            line === '' ? (
              <div key={i} className="h-2" />
            ) : (
              <div key={i} className="whitespace-pre-wrap">
                {line}
              </div>
            )
          )}
        </div>
      ) : null}

      <ol className="space-y-3">
        {group.examples.map((ex, i) => (
          <ExampleRow
            key={i}
            example={ex}
            difficult={difficultKeys?.has(difficultKey(group.id, i))}
            onSpeak={() => playOne(ex.en)}
            onToggleDifficult={
              onToggleDifficult
                ? () => onToggleDifficult(group.id, i)
                : undefined
            }
          />
        ))}
      </ol>
    </section>
  );
}
