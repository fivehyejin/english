import Link from 'next/link';

import { CURRENT_CURRICULUM } from '@/lib/curriculum';

import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const c = CURRENT_CURRICULUM;
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        <Link href="/" className="flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            English Notebook
          </span>
          <span className="text-base font-bold tracking-tight text-foreground md:text-lg">
            {c.topic}
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
