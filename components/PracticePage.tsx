'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { SpeakQuestion } from '@/components/practice/SpeakQuestion';
import { CURRENT_CURRICULUM } from '@/lib/curriculum';
import {
  addSessionRecord,
  addToWrongBank,
  removeFromWrongBank,
  setSpeakDelay,
} from '@/lib/storage';
import { speak } from '@/lib/speech';
import {
  generateFillInQuestions,
  generatePatternChoiceQuestions,
  generateSortQuestions,
  generateSpeakQuestions,
  uniqueByExample,
} from '@/lib/practice';
import { difficultKey, useDifficultExamples } from '@/hooks/useDifficultExamples';
import { usePracticeState } from '@/hooks/usePracticeState';
import { cn } from '@/lib/utils';
import {
  getRegularGroupsByDay,
  type SessionRecord,
  type PracticeQuestion,
  type SpeakDelaySeconds,
} from '@/types';

type Phase = 'setup' | 'running' | 'retry' | 'result';

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type DayPracticeKind =
  | 'fill-in'
  | 'pattern-choice'
  | 'sort-transitivity'
  | 'speak';

const DAY_KIND_OPTS: Array<{ kind: DayPracticeKind; label: string; hint: string }> =
  [
    { kind: 'fill-in', label: '빈칸 채우기', hint: '' },
    { kind: 'pattern-choice', label: '동사/패턴 고르기', hint: '' },
    { kind: 'sort-transitivity', label: '자·타동사 분류', hint: '' },
    {
      kind: 'speak',
      label: '🆕 Speak Mode',
      hint: '회화 연습',
    },
  ];

export function PracticePage({ day }: { day: number }) {
  const { items, mark, unmark } = useDifficultExamples();
  const { practice: storedPractice, refresh } = usePracticeState();
  const regularGroups = getRegularGroupsByDay(CURRENT_CURRICULUM, day);

  const [phase, setPhase] = useState<Phase>('setup');
  const [kinds, setKinds] = useState<DayPracticeKind[]>(['fill-in']);
  const [speakDelay, setSpeakDelayState] = useState<SpeakDelaySeconds>(5);
  const [count, setCount] = useState(10);
  const [onlyDifficult, setOnlyDifficult] = useState(false);
  const [retryWrongInSession, setRetryWrongInSession] = useState(true);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const [pool, setPool] = useState<PracticeQuestion[]>([]);
  const [retryPool, setRetryPool] = useState<PracticeQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [retryIdx, setRetryIdx] = useState(0);
  const [retryCorrect, setRetryCorrect] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [markedManually, setMarkedManually] = useState(false);
  const [wrongIds, setWrongIds] = useState<string[]>([]);

  useEffect(() => {
    const d = storedPractice.speakDelay;
    setSpeakDelayState(d === 3 || d === 5 || d === 7 ? d : 5);
  }, [storedPractice.speakDelay]);

  const pickSpeakDelay = (sec: SpeakDelaySeconds) => {
    setSpeakDelayState(sec);
    setSpeakDelay(sec);
    refresh();
  };

  const speakCount = useMemo(
    () => generateSpeakQuestions(CURRENT_CURRICULUM, day).length,
    [day]
  );

  const kindCounts: Record<DayPracticeKind, number> = useMemo(
    () => ({
      'fill-in': uniqueByExample(
        regularGroups.flatMap((g) =>
          generateFillInQuestions(g, regularGroups)
        )
      ).length,
      'pattern-choice': generatePatternChoiceQuestions(regularGroups).length,
      'sort-transitivity': generateSortQuestions(regularGroups).length,
      speak: speakCount,
    }),
    [regularGroups, speakCount]
  );

  const toggleKind = (k: DayPracticeKind) => {
    setKinds((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );
  };

  const activePool = phase === 'retry' ? retryPool : pool;
  const activeIdx = phase === 'retry' ? retryIdx : idx;
  const current = activePool[activeIdx];
  const isCorrect = selected != null && current ? selected === current.answer : null;

  const generated = useMemo(() => {
    let questions: PracticeQuestion[] = [];
    for (const k of kinds) {
      if (k === 'fill-in') {
        questions = questions.concat(
          regularGroups.flatMap((g) => generateFillInQuestions(g, regularGroups))
        );
      } else if (k === 'pattern-choice') {
        questions = questions.concat(generatePatternChoiceQuestions(regularGroups));
      } else if (k === 'sort-transitivity') {
        questions = questions.concat(generateSortQuestions(regularGroups));
      } else if (k === 'speak') {
        questions = questions.concat(
          generateSpeakQuestions(CURRENT_CURRICULUM, day)
        );
      }
    }
    questions = uniqueByExample(questions);
    if (onlyDifficult) {
      const keys = new Set(Object.keys(items));
      questions = questions.filter((q) =>
        keys.has(difficultKey(q.groupId, q.exampleIdx))
      );
    }
    return questions;
  }, [kinds, regularGroups, onlyDifficult, items, day]);

  const start = () => {
    if (kinds.length === 0) {
      toast.error('연습 유형을 하나 이상 선택하세요.');
      return;
    }
    if (!generated.length) {
      toast.error('선택한 조건에 문제가 없습니다.');
      return;
    }
    const sampled = shuffle(generated).slice(0, Math.min(count, generated.length));
    setPool(sampled);
    setIdx(0);
    setSelected(null);
    setWrongIds([]);
    setRetryPool([]);
    setRetryIdx(0);
    setRetryCorrect(0);
    setMarkedManually(false);
    setStartedAt(new Date().toISOString());
    setPhase('running');
  };

  const finish = (retryTotal = 0, retryCorrectCount = 0) => {
    const wrongQuestions = pool.filter((q) => wrongIds.includes(q.id));
    const record: SessionRecord = {
      id: new Date().toISOString(),
      startedAt: startedAt ?? new Date().toISOString(),
      endedAt: new Date().toISOString(),
      source: 'day',
      day,
      kinds: [...kinds],
      total: pool.length,
      correct: pool.length - wrongIds.length,
      wrongKeys: wrongQuestions.map((q) => difficultKey(q.groupId, q.exampleIdx)),
    };
    addSessionRecord(record);
    setRetryCorrect(retryCorrectCount);
    void retryTotal;
    setPhase('result');
  };

  const next = () => {
    if (phase === 'running') {
      if (idx >= pool.length - 1) {
        const wrongQuestions = pool.filter((q) => wrongIds.includes(q.id));
        if (retryWrongInSession && wrongQuestions.length > 0) {
          setRetryPool(wrongQuestions);
          setRetryIdx(0);
          setSelected(null);
          setMarkedManually(false);
          setPhase('retry');
          return;
        }
        finish(0, 0);
        return;
      }
      setIdx((v) => v + 1);
      setSelected(null);
      setMarkedManually(false);
      return;
    }
    if (retryIdx >= retryPool.length - 1) {
      finish(retryPool.length, retryCorrect);
      return;
    }
    setRetryIdx((v) => v + 1);
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
      removeFromWrongBank(key);
    } else {
      mark(key, {
        markedAt: items[key]?.markedAt ?? new Date().toISOString().slice(0, 10),
        sessionsStruggled: (items[key]?.sessionsStruggled ?? 0) + 1,
      });
      addToWrongBank(key);
    }

    if (!correct && phase === 'running') {
      setWrongIds((prev) => (prev.includes(current.id) ? prev : [...prev, current.id]));
    } else if (correct && phase === 'retry') {
      setRetryCorrect((v) => v + 1);
    }
  };

  const onSpeakRated = (markedDifficult: boolean) => {
    if (!current || current.kind !== 'speak') return;
    const key = difficultKey(current.groupId, current.exampleIdx);

    if (markedDifficult) {
      mark(key, {
        markedAt: items[key]?.markedAt ?? new Date().toISOString().slice(0, 10),
        sessionsStruggled: (items[key]?.sessionsStruggled ?? 0) + 1,
      });
      addToWrongBank(key);
      if (phase === 'running') {
        setWrongIds((prev) =>
          prev.includes(current.id) ? prev : [...prev, current.id]
        );
      }
      return;
    }

    if (items[key]) unmark(key);
    removeFromWrongBank(key);
    if (phase === 'running') {
      setWrongIds((prev) => prev.filter((id) => id !== current.id));
    } else {
      setRetryCorrect((v) => v + 1);
    }
  };

  const toggleManualDifficult = () => {
    if (!current || current.kind === 'speak') return;
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
          href={`/day/${day}/`}
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
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              유형 (여러 개 선택 가능)
            </h2>
            <div className="mt-3 space-y-3">
              {DAY_KIND_OPTS.map((o) => (
                <label
                  key={o.kind}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors hover:border-primary/30',
                    kinds.includes(o.kind) && 'border-primary/40 bg-primary/5'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={kinds.includes(o.kind)}
                    onChange={() => toggleKind(o.kind)}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">
                      {o.label}{' '}
                      {o.hint ? (
                        <span className="ml-2 text-xs text-accent">{o.hint}</span>
                      ) : null}
                    </div>
                    <div className="mt-0.5 text-sm text-muted-foreground">
                      {o.kind === 'speak'
                        ? '한국어 보고 영어로 말해보기 → 정답 듣고 따라 말하기'
                        : null}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {kindCounts[o.kind]}문제
                  </span>
                </label>
              ))}
            </div>
          </div>

          {kinds.includes('speak') ? (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Speak Mode · 한국어 노출 시간
              </h2>
              <div className="flex gap-2">
                {([3, 5, 7] as const).map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => pickSpeakDelay(sec)}
                    className={cn(
                      'flex-1 rounded-md border px-4 py-3 text-sm font-medium transition-colors',
                      speakDelay === sec
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                  >
                    {sec}초
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                한국어만 보이는 시간. 익숙해지면 줄여서 난이도를 올릴 수 있어요.
              </p>
            </section>
          ) : null}

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

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={retryWrongInSession}
              onChange={(e) => setRetryWrongInSession(e.target.checked)}
            />
            세션 끝에 표시한 문제 다시 풀기
          </label>

          <p className="text-sm text-muted-foreground">생성 가능 문제: {generated.length}</p>
          <Button type="button" onClick={start}>시작</Button>
        </section>
      ) : null}

      {(phase === 'running' || phase === 'retry') && current ? (
        <section className="mt-8 rounded-lg border border-border bg-card p-5 md:p-6">
          {phase === 'retry' ? (
            <div className="mb-4 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1.5 text-sm text-muted-foreground">
                <RotateCcw className="h-3.5 w-3.5" />
                어려움 표시한 문제 다시 · {retryIdx + 1} / {retryPool.length}
              </div>
            </div>
          ) : null}
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{activeIdx + 1} / {activePool.length}</p>

          {current.kind === 'speak' ? (
            <SpeakQuestion
              key={current.id}
              q={current}
              speakDelay={speakDelay}
              onRated={onSpeakRated}
              onNext={next}
            />
          ) : (
            <>
              <h2 className="mt-3 text-lg font-semibold leading-snug">{current.prompt}</h2>
              {current.ko ? (
                <p className="mt-1 text-sm text-muted-foreground">{current.ko}</p>
              ) : null}

              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(current.choices ?? []).map((c) => {
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
                {selected != null ? (
                  <Button type="button" onClick={next}>
                    {phase === 'running' && idx + 1 === pool.length
                      ? retryWrongInSession && wrongIds.length > 0
                        ? '다시 풀기 →'
                        : '결과 보기'
                      : phase === 'retry' && retryIdx + 1 === retryPool.length
                        ? '결과 보기'
                        : '다음'}
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </section>
      ) : null}

      {phase === 'result' ? (
        <section className="mt-8 space-y-4 rounded-lg border border-border bg-card p-5 md:p-6">
          <h2 className="text-xl font-semibold">세션 완료</h2>
          <p className="text-sm tabular-nums text-muted-foreground">
            {correctCount} / {pool.length}
          </p>
          {retryPool.length > 0 ? (
            <p className="text-sm text-muted-foreground tabular-nums">
              재풀이: {retryCorrect} / {retryPool.length}
            </p>
          ) : null}
          {wrongQuestions.length ? (
            <div>
              <h3 className="text-sm font-semibold">
                어려움 표시한 문제 · {wrongQuestions.length}개
              </h3>
              <ul className="mt-2 space-y-2 text-sm">
                {wrongQuestions.map((q) => (
                  <li key={q.id} className="rounded border border-border p-2">
                    <p className="font-medium">{q.fullEn}</p>
                    <p className="text-muted-foreground">{q.ko ?? q.prompt}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="flex gap-2">
            <Button type="button" onClick={() => setPhase('setup')}>다시 풀기</Button>
            <Button asChild variant="outline"><Link href={`/day/${day}/`}>Day로 돌아가기</Link></Button>
            <Button asChild variant="outline"><Link href="/dashboard/">📊 대시보드</Link></Button>
          </div>
        </section>
      ) : null}
    </article>
  );
}
