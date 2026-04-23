'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useDifficultExamples } from '@/hooks/useDifficultExamples';
import { CURRENT_CURRICULUM } from '@/lib/curriculum';
import {
  countCollocationInScope,
  countCompositionInScope,
  countMinimalPairsInScope,
} from '@/lib/practice-global';
import { cn } from '@/lib/utils';
import {
  countAllDifficult,
  type GlobalPracticeConfig,
  type PracticeScope,
  type PracticeState,
} from '@/types';

import { KindCard } from './KindCard';

const CONFIG_KEY = 'english-global-practice-config';
const DIFF_KEYS = 'english-global-practice-difficult-keys';

type GlobalKind = 'collocation' | 'minimal-pairs' | 'composition';

const KIND_OPTS: Array<{
  kind: GlobalKind;
  title: string;
  description: string;
}> = [
  {
    kind: 'collocation',
    title: '동사 짝꿍',
    description: '타동사 목적어 · 자동사 전치사 짝꿍',
  },
  {
    kind: 'minimal-pairs',
    title: '비슷한 동사 구분',
    description: 'have/get/keep · try 3형제 · too/enough 등',
  },
  {
    kind: 'composition',
    title: '직접 작문',
    description: '한국어 → 영어 타이핑',
  },
];

export function PracticeSetup() {
  const router = useRouter();
  const { items } = useDifficultExamples();
  const practiceSlice: PracticeState = {
    difficultExamples: items,
    sessionHistory: [],
    wrongBank: {},
  };
  const difficultCount = countAllDifficult(practiceSlice);

  const [scope, setScope] = useState<PracticeScope>('all');
  const [selectedKinds, setSelectedKinds] = useState<GlobalKind[]>([
    'collocation',
  ]);
  const [length, setLength] = useState<5 | 10 | 20>(10);
  const [retryWrongInSession, setRetryWrongInSession] = useState(true);

  const counts = useMemo((): Record<GlobalKind, number> => {
    const c = CURRENT_CURRICULUM;
    return {
      collocation: countCollocationInScope(c, scope),
      'minimal-pairs': countMinimalPairsInScope(c, scope),
      composition: countCompositionInScope(c, scope),
    };
  }, [scope]);

  const toggleKind = (k: GlobalKind) => {
    setSelectedKinds((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );
  };

  const startSession = (config: GlobalPracticeConfig, diffKeys?: string[]) => {
    if (config.length !== 'difficult-only' && config.kinds.length === 0) {
      toast.error('연습 유형을 하나 이상 선택하세요.');
      return;
    }
    try {
      sessionStorage.setItem(CONFIG_KEY, JSON.stringify(config));
      if (diffKeys && diffKeys.length) {
        sessionStorage.setItem(DIFF_KEYS, JSON.stringify(diffKeys));
      } else {
        sessionStorage.removeItem(DIFF_KEYS);
      }
    } catch {
      toast.error('설정을 저장하지 못했습니다.');
      return;
    }
    router.push('/practice/session/');
  };

  const onStart = () => {
    startSession({
      scope,
      kinds: selectedKinds as GlobalPracticeConfig['kinds'],
      length,
      retryWrongInSession,
      source: 'global',
    });
  };

  const startDifficultOnly = () => {
    const keys = Object.keys(items);
    if (!keys.length) return;
    startSession(
      {
        scope: 'all',
        kinds: ['collocation', 'minimal-pairs', 'composition'],
        length: 'difficult-only',
        retryWrongInSession,
        source: 'global',
      },
      keys
    );
  };

  return (
    <article className="mx-auto max-w-xl">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← 홈으로
      </Link>

      <h1 className="mt-6 text-2xl font-bold tracking-tight md:text-3xl">
        🎯 전체 연습
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        지금까지 배운 동사를 섞어서 반복
      </p>

      {difficultCount > 0 ? (
        <div className="mt-6 rounded-md border border-l-4 border-l-accent bg-[hsl(var(--highlight-bg))] px-4 py-3 text-sm">
          어려움 표시된 예문{' '}
          <strong className="tabular-nums">{difficultCount}개</strong>
          <button
            type="button"
            onClick={startDifficultOnly}
            className="mt-2 block font-medium text-accent hover:underline"
          >
            → 어려움 표시된 것만 풀기
          </button>
        </div>
      ) : null}

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          범위
        </h2>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['all', '전체'],
              ['d1-3', 'Day 1~3'],
              ['d4-5', 'Day 4~5'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setScope(value)}
              className={cn(
                'rounded-md border px-4 py-2 text-sm font-medium transition-colors',
                scope === value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          연습 유형 (여러 개 선택 가능)
        </h2>
        {KIND_OPTS.map((o) => (
          <KindCard
            key={o.kind}
            title={o.title}
            description={o.description}
            count={counts[o.kind]}
            selected={selectedKinds.includes(o.kind)}
            onToggle={() => toggleKind(o.kind)}
          />
        ))}
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          세션 길이
        </h2>
        <div className="flex gap-2">
          {([5, 10, 20] as const).map((len) => (
            <button
              key={len}
              type="button"
              onClick={() => setLength(len)}
              className={cn(
                'flex-1 rounded-md border px-4 py-3 text-sm font-medium transition-colors',
                length === len
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              {len}문제
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

      <Button
        type="button"
        className="mt-8 w-full"
        size="lg"
        disabled={selectedKinds.length === 0}
        onClick={onStart}
      >
        연습 시작 →
      </Button>
    </article>
  );
}
