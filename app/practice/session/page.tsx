'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { GlobalPracticeSession } from '@/components/practice/GlobalPracticeSession';
import { CURRENT_CURRICULUM } from '@/lib/curriculum';
import { buildGlobalQuestionPool } from '@/lib/practice-global';
import type { GlobalPracticeConfig, PracticeQuestion } from '@/types';

const CONFIG_KEY = 'english-global-practice-config';
const DIFF_KEYS = 'english-global-practice-difficult-keys';

export default function PracticeSessionPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<PracticeQuestion[] | null>(null);

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
    if (!pool.length) {
      toast.error('선택한 조건에 문제가 없습니다.');
      router.replace('/practice/');
      return;
    }
    setQuestions(pool);
  }, [router]);

  if (questions === null) {
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
      <GlobalPracticeSession questions={questions} />
    </div>
  );
}
