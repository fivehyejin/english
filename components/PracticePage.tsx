'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { CURRENT_CURRICULUM } from '@/lib/curriculum';
import { speak } from '@/lib/speech';
import {
  generateFillInQuestions,
  generatePatternChoiceQuestions,
  generateSortQuestions,
  uniqueByExample,
} from '@/lib/practice';
import { difficultKey, useDifficultExamples } from '@/hooks/useDifficultExamples';
import { getRegularGroupsByDay, type PracticeQuestion, type PracticeType } from '@/types';

type Phase = 'setup' | 'running' | 'result';

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function PracticePage({ day }: { day: number }) {
  const { items, mark, unmark } = useDifficultExamples();
  const regularGroups = getRegularGroupsByDay(CURRENT_CURRICULUM, day);

  const [phase, setPhase] = useState<Phase>('setup');
  const [type, setType] = useState<PracticeType>('fill-in');
  const [count, setCount] = useState(10);
  const [onlyDifficult, setOnlyDifficult] = useState(false);

  const [pool, setPool] = useState<PracticeQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [markedManually, setMarkedManually] = useState(false);
  const [wrongIds, setWrongIds] = useState<string[]>([]);

  const current = pool[idx];
  const isCorrect = selected != null && current ? selected === current.answer : null;

  const generated = useMemo(() => {
    let questions: PracticeQuestion[] = [];
    if (type === 'fill-in') {
      questions = regularGroups.flatMap((g) => generateFillInQuestions(g, regularGroups));
    } else if (type === 'pattern-choice') {
      questions = generatePatternChoiceQuestions(regularGroups);
    } else {
      questions = generateSortQuestions(regularGroups);
    }
    questions = uniqueByExample(questions);
    if (onlyDifficult) {
      const keys = new Set(Object.keys(items));
      questions = questions.filter((q) => keys.has(difficultKey(q.groupId, q.exampleIdx)));
    }
    return questions;
  }, [type, regularGroups, onlyDifficult, items]);

  const start = () => {
    if (!generated.length) {
      toast.error('선택한 조건에 문제가 없습니다.');
      return;
    }
    const sampled = shuffle(generated).slice(0, Math.min(count, generated.length));
    setPool(sampled);
    setIdx(0);
    setSelected(null);
    setWrongIds([]);
    setMarkedManually(false);
    setPhase('running');
  };

  const next = () => {
    if (idx >= pool.length - 1) {
      setPhase('result');
      return;
    }
    setIdx((v) => v + 1);
    setSelected(null);
    setMarkedManually(false);
  };

  const onPick = (choice: string) => {
    if (!current || selected != null) return;
    setSelected(choice);
    const correct = choice === current.answer;
    speak(current.fullEn);

    const key = difficultKey(current.groupId, current.exampleIdx);
    const wasFlagged = !!items[key];
    if (correct && !markedManually) {
      if (wasFlagged) unmark(key);
    } else {
      mark(key, {
        markedAt: items[key]?.markedAt ?? new Date().toISOString().slice(0, 10),
        sessionsStruggled: (items[key]?.sessionsStruggled ?? 0) + 1,
      });
    }

    if (correct) {
      window.setTimeout(() => next(), 800);
    } else {
      setWrongIds((prev) => [...prev, current.id]);
    }
  };

  const toggleManualDifficult = () => {
    if (!current) return;
    const key = difficultKey(current.groupId, current.exampleIdx);
    const nextMarked = !markedManually;
    setMarkedManually(nextMarked);
    if (nextMarked) {
      mark(key, { sessionsStruggled: (items[key]?.sessionsStruggled ?? 0) + 1 });
    } else if (!selected || selected === current.answer) {
      unmark(key);
    }
  };

  const wrongQuestions = pool.filter((q) => wrongIds.includes(q.id));
  const correctCount = pool.length - wrongIds.length;

  return (
    <article className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          href={`/day/${day}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Day {day}로
        </Link>
      </div>

      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">DAY {day} 연습 모드</h1>

      {phase === 'setup' ? (
        <section className="mt-8 space-y-6 rounded-lg border border-border bg-card p-5 md:p-6">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">유형</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                ['fill-in', '빈칸 채우기'],
                ['pattern-choice', '동사/패턴 고르기'],
                ['sort', '자·타동사 분류'],
              ].map(([id, label]) => (
                <Button key={id} type="button" variant={type === id ? 'default' : 'outline'} onClick={() => setType(id as PracticeType)}>
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">길이</h2>
            <div className="mt-3 flex gap-2">
              {[5, 10, 15].map((n) => (
                <Button key={n} type="button" variant={count === n ? 'default' : 'outline'} onClick={() => setCount(n)}>
                  {n}문제
                </Button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={onlyDifficult} onChange={(e) => setOnlyDifficult(e.target.checked)} />
            어려움 표시된 것만 풀기
          </label>

          <p className="text-sm text-muted-foreground">생성 가능 문제: {generated.length}</p>
          <Button type="button" onClick={start}>시작</Button>
        </section>
      ) : null}

      {phase === 'running' && current ? (
        <section className="mt-8 rounded-lg border border-border bg-card p-5 md:p-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{idx + 1} / {pool.length}</p>
          <h2 className="mt-3 text-lg font-semibold leading-snug">{current.prompt}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{current.ko}</p>

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {current.choices.map((c) => {
              const active = selected === c;
              const isAns = current.answer === c;
              const className =
                selected == null
                  ? 'border-border'
                  : active && isCorrect
                    ? 'border-green-600 bg-green-50 dark:bg-green-950/30'
                    : active && isCorrect === false
                      ? 'border-red-600 bg-red-50 dark:bg-red-950/30'
                      : isAns
                        ? 'border-green-600 bg-green-50 dark:bg-green-950/30'
                        : 'border-border opacity-80';
              return (
                <button
                  key={c}
                  type="button"
                  disabled={selected != null}
                  onClick={() => onPick(c)}
                  className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${className}`}
                >
                  {c}
                </button>
              );
            })}
          </div>

          {selected != null ? (
            <div className="mt-4 rounded-md border border-[hsl(var(--note-border))] bg-[hsl(var(--note-bg))] px-3 py-3 text-sm">
              <p className="font-medium">{current.fullEn}</p>
              <p className="mt-1 text-muted-foreground">{current.ko}</p>
            </div>
          ) : null}

          <div className="mt-4 flex items-center justify-between gap-2">
            <button type="button" onClick={toggleManualDifficult} className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              {markedManually ? '어려움 표시 해제' : '이 문제 어려움 표시'}
            </button>
            {selected != null && isCorrect === false ? (
              <Button type="button" onClick={next}>다음</Button>
            ) : null}
          </div>
        </section>
      ) : null}

      {phase === 'result' ? (
        <section className="mt-8 space-y-4 rounded-lg border border-border bg-card p-5 md:p-6">
          <h2 className="text-xl font-semibold">세션 완료</h2>
          <p className="text-sm text-muted-foreground">
            정답률: {correctCount} / {pool.length} ({pool.length ? Math.round((correctCount / pool.length) * 100) : 0}%)
          </p>
          {wrongQuestions.length ? (
            <div>
              <h3 className="text-sm font-semibold">틀린 예문</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {wrongQuestions.map((q) => (
                  <li key={q.id} className="rounded border border-border p-2">
                    <p className="font-medium">{q.fullEn}</p>
                    <p className="text-muted-foreground">{q.ko}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="flex gap-2">
            <Button type="button" onClick={() => setPhase('setup')}>다시 풀기</Button>
            <Button asChild variant="outline"><Link href={`/day/${day}`}>Day로 돌아가기</Link></Button>
          </div>
        </section>
      ) : null}
    </article>
  );
}
