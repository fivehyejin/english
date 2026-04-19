import { HomeContent } from '@/components/HomeContent';
import { CURRENT_CURRICULUM } from '@/lib/curriculum';

export default function HomePage() {
  const c = CURRENT_CURRICULUM;
  return (
    <>
      <section className="mb-10">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Month {c.month} · {c.level === 'beginner' ? '초급' : '중급'}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {c.topic}
        </h1>
        {c.topicNote ? (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {c.topicNote}
          </p>
        ) : null}
      </section>
      <HomeContent />
    </>
  );
}
