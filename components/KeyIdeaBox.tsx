import type { DaySummary } from '@/types';

import { InlineMarkdown } from './InlineMarkdown';

export function KeyIdeaBox({ summary }: { summary: DaySummary }) {
  return (
    <section
      className="relative rounded-lg border border-border bg-muted/30 p-5 md:p-6 border-l-4 border-l-accent"
    >
      <h3 className="text-xs font-semibold uppercase tracking-wide text-accent">
        💡 이 날의 핵심
      </h3>

      <p className="mt-3 text-lg font-semibold leading-snug md:text-xl">
        {summary.headline}
      </p>

      <ul className="mt-5 space-y-2 text-sm leading-relaxed md:text-base">
        {summary.keyPoints.map((point, i) => (
          <li key={i} className="flex gap-2">
            <span className="select-none text-muted-foreground">•</span>
            <span>
              <InlineMarkdown text={point} />
            </span>
          </li>
        ))}
      </ul>

      {summary.mustRemember && summary.mustRemember.length > 0 ? (
        <div
          className="mt-5 rounded-md border border-[hsl(var(--highlight-border))] bg-[hsl(var(--highlight-bg))] px-4 py-3"
        >
          <h4 className="text-xs font-semibold uppercase tracking-wide text-accent">
            📌 꼭 기억할 것
          </h4>
          <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
            {summary.mustRemember.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="select-none text-accent">→</span>
                <span>
                  <InlineMarkdown text={item} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
