'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { GlobalPracticeSession } from '@/components/practice/GlobalPracticeSession';
import { CURRENT_CURRICULUM } from '@/lib/curriculum';
import { buildDifficultOnlyQuestions, buildGlobalQuestionPool } from '@/lib/practice-global';
import type { GlobalPracticeConfig, PracticeQuestion, SessionRecord } from '@/types';

const CONFIG_KEY = 'english-global-practice-config';
const DIFF_KEYS = 'english-global-practice-difficult-keys';

export default function PracticeSessionPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<PracticeQuestion[] | null>(null);
  const [meta, setMeta] = useState<{
    source: SessionRecord['source'];
    day?: number;
    scope?: GlobalPracticeConfig['scope'];
    kinds: SessionRecord['kinds'];
    retryWrongInSession: boolean;
  } | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(CONFIG_KEY);
    if (!raw) {
      router.replace('/practice/');
      return;
    }
    let config: GlobalPracticeConfig;
    try {
      config = JSON.parse(raw) as GlobalPracticeConfig;
    } catch {
      router.replace('/practice/');
      return;
    }
    let diffKeys: string[] | undefined;
    const dk = sessionStorage.getItem(DIFF_KEYS);
    if (dk) {
      try {
        diffKeys = JSON.parse(dk) as string[];
      } catch {
        diffKeys = undefined;
      }
    }
    const pool = buildGlobalQuestionPool(
      CURRENT_CURRICULUM,
      config,
      diffKeys
    );

    const source = config.source ?? 'global';
    const retryWrongInSession = config.retryWrongInSession ?? true;
    const kinds = config.kinds;
    let finalPool = pool;
    if (source === 'wrong-bank') {
      const keys = diffKeys ?? [];
      finalPool = buildDifficultOnlyQuestions(CURRENT_CURRICULUM, keys);
      if (config.length !== 'difficult-only' && config.length !== 'all') {
        finalPool = finalPool.slice(
          0,
          Math.min(config.length as number, finalPool.length)
        );
      }
    }
    if (!finalPool.length) {
      toast.error('선택한 조건에 문제가 없습니다.');
      router.replace('/practice/');
      return;
    }
    setMeta({
      source,
      scope: config.scope,
      kinds,
      retryWrongInSession,
    });
    setQuestions(finalPool);
  }, [router]);

  if (questions === null) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center text-sm text-muted-foreground">
        불러오는 중…
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center text-sm text-muted-foreground">
        불러오는 중…
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mx-auto mb-6 max-w-xl">
        <Link
          href="/practice/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← 설정으로
        </Link>
      </div>
      <GlobalPracticeSession
        questions={questions}
        source={meta.source}
        day={meta.day}
        scope={meta.scope}
        kinds={meta.kinds}
        retryWrongInSession={meta.retryWrongInSession}
      />
    </div>
  );
}
