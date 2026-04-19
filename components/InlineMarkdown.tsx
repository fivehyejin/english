'use client';

import { Fragment } from 'react';

/**
 * `**굵게**`, `` `코드` ``, `*기울임*` 만 처리 (DATA_SCHEMA 가이드).
 */
export function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((t, i) => {
        if (t.startsWith('**') && t.endsWith('**')) {
          return <strong key={i}>{t.slice(2, -2)}</strong>;
        }
        if (t.startsWith('`') && t.endsWith('`')) {
          return (
            <code
              key={i}
              className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em] text-foreground"
            >
              {t.slice(1, -1)}
            </code>
          );
        }
        if (
          t.startsWith('*') &&
          t.endsWith('*') &&
          !t.startsWith('**') &&
          t.length >= 2
        ) {
          return <em key={i}>{t.slice(1, -1)}</em>;
        }
        return <Fragment key={i}>{t}</Fragment>;
      })}
    </>
  );
}
