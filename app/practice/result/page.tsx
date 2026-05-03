'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { PracticeSessionResult } from '@/types';

const RESULT_KEY = 'english-global-practice-result';

export default function PracticeResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<PracticeSessionResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(RESULT_KEY);
    if (!raw) {
      router.replace('/practice/');
      return;
    }
    try {
      setResult(JSON.parse(raw) as PracticeSessionResult);
    } catch {
      router.replace('/practice/');
    }
  }, [router]);

  if (!result) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center text-sm text-muted-foreground">
        불러오는 중…
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-xl py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← 홈으로
      </Link>
      <h1 className="mt-6 text-2xl font-bold tracking-tight md:text-3xl">
        연습 완료!
      </h1>
      <p className="mt-3 text-sm tabular-nums text-muted-foreground">
        {result.correct} / {result.total}
      </p>
      {result.retryTotal != null && result.retryTotal > 0 ? (
        <p className="mt-2 text-sm text-muted-foreground tabular-nums">
          재풀이: {result.retryCorrect ?? 0} / {result.retryTotal}
        </p>
      ) : null}
      {result.wrong.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-sm font-semibold">
            어려움 표시한 문제 · {result.wrong.length}개
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {result.wrong.map((q) => (
              <li key={q.id} className="rounded-md border border-border p-3">
                <p className="font-medium">{q.fullEn.split('/')[0]?.trim()}</p>
                {q.ko ? (
                  <p className="mt-1 text-muted-foreground">{q.ko}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-2">
        <Button asChild type="button">
          <Link href="/practice/">다시 연습</Link>
        </Button>
        <Button asChild type="button" variant="outline">
          <Link href="/">홈으로</Link>
        </Button>
        <Button asChild type="button" variant="outline">
          <Link href="/dashboard/">📊 대시보드</Link>
        </Button>
      </div>
    </article>
  );
}
