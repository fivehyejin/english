import type { PatternGroup } from '@/types';

export function ClassNoteBox({ group }: { group: PatternGroup }) {
  return (
    <section
      className="rounded-lg border border-[hsl(var(--note-border))] bg-[hsl(var(--note-bg))] border-l-4 border-l-[hsl(var(--note-accent))] p-5 md:p-6"
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <span>{group.noteSource ?? '✏️ 수업노트'}</span>
      </div>

      {group.title ? (
        <h3 className="mt-2 text-lg font-semibold text-foreground">{group.title}</h3>
      ) : null}

      <div className="mt-4 space-y-1 text-sm leading-relaxed text-foreground">
        {group.notes?.map((line, i) =>
          line === '' ? (
            <div key={i} className="h-2" />
          ) : (
            <div key={i} className="whitespace-pre-wrap">
              {line}
            </div>
          )
        )}
      </div>
    </section>
  );
}
