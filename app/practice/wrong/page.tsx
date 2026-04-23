'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { usePracticeState } from '@/hooks/usePracticeState';
import { CURRENT_CURRICULUM } from '@/lib/curriculum';
import { parseDifficultKey, type GlobalPracticeConfig } from '@/types';

const CONFIG_KEY = 'english-global-practice-config';
const DIFF_KEYS = 'english-global-practice-difficult-keys';

type SortMode = 'recent' | 'frequent' | 'day';

function dayFromKey(key: string): number | null {
  const parsed = parseDifficultKey(key);
  if (!parsed) return null;
  const group = CURRENT_CURRICULUM.groups.find((g) => g.id === parsed.groupId);
  return group?.day ?? null;
}

function exampleLabelFromKey(key: string): string {
  const parsed = parseDifficultKey(key);
  if (!parsed) return key;
  const group = CURRENT_CURRICULUM.groups.find((g) => g.id === parsed.groupId);
  const ex = group?.examples[parsed.exampleIdx];
  return ex?.en.split('/')[0]?.trim() ?? key;
}

export default function WrongPracticeSetupPage() {
  const router = useRouter();
  const { practice } = usePracticeState();
  const [sort, setSort] = useState<SortMode>('recent');
  const [length, setLength] = useState<5 | 10 | 'all'>(10);
  const [retryWrongInSession, setRetryWrongInSession] = useState(true);

  const entries = useMemo(
    () => Object.entries(practice.wrongBank),
    [practice.wrongBank]
  );

  const sortedKeys = useMemo(() => {
    const arr = [...entries];
    if (sort === 'recent') {
      arr.sort((a, b) => (a[1].lastWrongAt < b[1].lastWrongAt ? 1 : -1));
    } else if (sort === 'frequent') {
      arr.sort((a, b) => {
        if (b[1].wrongCount !== a[1].wrongCount) {
          return b[1].wrongCount - a[1].wrongCount;
        }
        return a[1].lastWrongAt < b[1].lastWrongAt ? 1 : -1;
      });
    } else {
      arr.sort((a, b) => {
        const dayA = dayFromKey(a[0]) ?? 999;
        const dayB = dayFromKey(b[0]) ?? 999;
        if (dayA !== dayB) return dayA - dayB;
        return a[0].localeCompare(b[0]);
      });
    }
    return arr.map(([key]) => key);
  }, [entries, sort]);

  const wrongCount = sortedKeys.length;

  const byDay = useMemo(() => {
    const map: Record<number, number> = {};
    for (const k of sortedKeys) {
      const day = dayFromKey(k);
      if (day == null) continue;
      map[day] = (map[day] ?? 0) + 1;
    }
    return Object.entries(map)
      .map(([day, count]) => ({ day: Number(day), count }))
      .sort((a, b) => a.day - b.day);
  }, [sortedKeys]);

  const mostWrong = useMemo(() => {
    if (entries.length === 0) return null;
    const [key, entry] = [...entries].sort(
      (a, b) => b[1].wrongCount - a[1].wrongCount
    )[0];
    return {
      label: exampleLabelFromKey(key),
      count: entry.wrongCount,
    };
  }, [entries]);

  const start = () => {
    if (sortedKeys.length === 0) return;
    const picked =
      length === 'all' ? sortedKeys : sortedKeys.slice(0, Math.min(length, sortedKeys.length));
    const config: GlobalPracticeConfig = {
      scope: 'all',
      kinds: ['collocation', 'minimal-pairs', 'composition'],
      length,
      source: 'wrong-bank',
      retryWrongInSession,
    };
    sessionStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    sessionStorage.setItem(DIFF_KEYS, JSON.stringify(picked));
    router.push('/practice/session/');
  };

  return (
    <article className="mx-auto max-w-xl">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← 홈으로
      </Link>

      <h1 className="mt-6 text-2xl font-bold tracking-tight md:text-3xl">
        📝 오답 보관함
      </h1>
      <p className="mt-2 text-sm text-muted-foreground tabular-nums">
        총 {wrongCount}문제 틀렸어요
      </p>

      {wrongCount > 0 ? (
        <>
          <section className="mt-6 space-y-2 rounded-md border bg-muted/30 p-4 text-sm">
            {mostWrong ? (
              <div>
                <span className="text-muted-foreground">가장 자주: </span>
                <span className="font-medium">{mostWrong.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {' '}
                  ({mostWrong.count}회)
                </span>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {byDay.map(({ day, count }) => (
                <span key={day} className="tabular-nums">
                  Day {day}: {count}문제
                </span>
              ))}
            </div>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              정렬
            </h2>
            <div className="flex flex-wrap gap-2">
              {([
                { value: 'recent', label: '최근 틀린 순' },
                { value: 'frequent', label: '자주 틀린 순' },
                { value: 'day', label: 'Day 순' },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSort(opt.value)}
                  className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    sort === opt.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              길이
            </h2>
            <div className="flex gap-2">
              {([5, 10, 'all'] as const).map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => setLength(len)}
                  className={`flex-1 rounded-md border px-4 py-3 text-sm font-medium transition-colors ${
                    length === len
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {len === 'all' ? '전체' : `${len}문제`}
                </button>
              ))}
            </div>
          </section>

          <label className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={retryWrongInSession}
              onChange={(e) => setRetryWrongInSession(e.target.checked)}
            />
            세션 끝에 틀린 거 다시 풀기
          </label>

          <Button onClick={start} className="mt-8 w-full" size="lg">
            다시 풀기 →
          </Button>
        </>
      ) : (
        <div className="mt-8 rounded-md border bg-muted/30 p-8 text-center">
          <p className="text-muted-foreground">오답이 없어요. 깔끔해요.</p>
          <Link
            href="/practice/"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            🎯 전체 연습하러 가기
          </Link>
        </div>
      )}
    </article>
  );
}
