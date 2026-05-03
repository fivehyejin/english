'use client';

import { useId } from 'react';

interface Props {
  svg: string;
  caption?: string;
}

export function DiagramBlock({ svg, caption }: Props) {
  const captionId = useId();

  return (
    <figure className="my-6">
      <div className="overflow-x-auto">
        <div
          className="
            min-w-[320px] rounded-md border border-border bg-muted/30 p-4 text-foreground/90 md:p-6
            [&_svg]:h-auto [&_svg]:w-full [&_svg]:max-w-full
          "
          dangerouslySetInnerHTML={{ __html: svg }}
          aria-describedby={caption ? captionId : undefined}
        />
      </div>
      {caption ? (
        <figcaption
          id={captionId}
          className="mt-2 text-center text-xs text-muted-foreground"
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
