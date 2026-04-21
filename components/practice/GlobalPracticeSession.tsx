'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { difficultKey, useDifficultExamples } from '@/hooks/useDifficultExamples';
import { CURRENT_CURRICULUM } from '@/lib/curriculum';
import { speak } from '@/lib/speech';
import type { PracticeQuestion, PracticeSessionResult } from '@/types';

import { kindLabel } from './kindLabels';
import { QuestionCollocation } from './QuestionCollocation';
import { QuestionComposition } from './QuestionComposition';
import { QuestionMinimalPairs } from './QuestionMinimalPairs';

const RESULT_KEY = 'english-global-practice-result';

interface Props {
  questions: PracticeQuestion[];
}

export function GlobalPracticeSession({ questions }: Props) {
  const router = useRouter();
  const { items, mark, unmark } = useDifficultExamples();
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [wrongIds, setWrongIds] = useState<string[]>([]);

  const total = questions.length;
  const current = questions[idx];

  const applyDifficult = (q: PracticeQuestion, wasCorrect: boolean) => {
    const key = difficultKey(q.groupId, q.exampleIdx);
    const wasFlagged = !!items[key];
    if (wasCorrect) {
      if (wasFlagged) unmark(key);
    } else {
      mark(key, {
        markedAt: items[key]?.markedAt ?? new Date().toISOString().slice(0, 10),
        sessionsStruggled: (items[key]?.sessionsStruggled ?? 0) + 1,
      });
    }
  };

  const finish = (wrong: string[]) => {
    const wrongQs = questions.filter((q) => wrong.includes(q.id));
    const result: PracticeSessionResult = {
      total: questions.length,
      correct: questions.length - wrong.length,
      wrong: wrongQs,
      newlyDifficult: [],
    };
    try {
      sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
    } catch {
      toast.error('결과를 저장하지 못했습니다.');
    }
    router.push('/practice/result/');
  };

  const next = () => {
    if (idx >= total - 1) {
      finish(wrongIds);
      return;
    }
    setIdx((v) => v + 1);
    setPicked(null);
    setRevealed(false);
  };

  const onPickChoice = (choice: string) => {
    if (!current || revealed) return;
    setPicked(choice);
    setRevealed(true);
    const ok = choice === current.answer;
    const speakLine =
      current.subKind === 'detect-transitivity-error' &&
      current.expectedFullEn
        ? current.expectedFullEn
        : current.fullEn.split('/')[0]?.trim() ?? current.fullEn;
    speak(speakLine);
    applyDifficult(current, ok);
    if (!ok) {
      setWrongIds((prev) => [...prev, current.id]);
    }
  };

  const onCompositionSelfGrade = (wasCorrect: boolean) => {
    if (!current) return;
    applyDifficult(current, wasCorrect);
    const nextWrong = wasCorrect ? wrongIds : [...wrongIds, current.id];
    if (!wasCorrect) {
      setWrongIds(nextWrong);
    }
    if (idx >= total - 1) {
      finish(nextWrong);
      return;
    }
    setIdx((v) => v + 1);
    setPicked(null);
    setRevealed(false);
  };

  const progress = useMemo(
    () => (total ? Math.min(100, ((idx + 1) / total) * 100) : 0),
    [idx, total]
  );

  if (!current) {
    return (
      <p className="text-sm text-muted-foreground">
        문제가 없습니다.{' '}
        <Link href="/practice/" className="underline">
          돌아가기
        </Link>
      </p>
    );
  }

  return (
    <article className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground tabular-nums">
          🎯 전체 연습 · {kindLabel(current.kind)}
        </span>
        <span className="text-xs tabular-nums text-muted-foreground">
          {idx + 1} / {total}
        </span>
      </div>
      <div className="mb-8 h-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="rounded-lg border bg-card p-6 md:p-8">
        {current.kind === 'collocation' ? (
          <QuestionCollocation
            q={current}
            revealed={revealed}
            picked={picked}
            onPick={onPickChoice}
          />
        ) : null}
        {current.kind === 'minimal-pairs' ? (
          <QuestionMinimalPairs
            q={current}
            revealed={revealed}
            picked={picked}
            onPick={onPickChoice}
          />
        ) : null}
        {current.kind === 'composition' ? (
          <QuestionComposition
            key={current.id}
            q={current}
            onSelfGrade={onCompositionSelfGrade}
          />
        ) : null}
      </div>

      {revealed && current.kind !== 'composition' ? (
        <div className="mt-6 flex justify-end">
          <Button type="button" onClick={next}>
            {idx + 1 === total ? '결과 보기' : '다음 →'}
          </Button>
        </div>
      ) : null}
    </article>
  );
}
