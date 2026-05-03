'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { difficultKey, useDifficultExamples } from '@/hooks/useDifficultExamples';
import { usePracticeState } from '@/hooks/usePracticeState';
import {
  addSessionRecord,
  addToWrongBank,
  removeFromWrongBank,
} from '@/lib/storage';
import { speak } from '@/lib/speech';
import type {
  PracticeQuestion,
  PracticeScope,
  PracticeSessionResult,
  PracticeSource,
  SessionRecord,
} from '@/types';

import { kindLabel } from './kindLabels';
import { QuestionCollocation } from './QuestionCollocation';
import { QuestionComposition } from './QuestionComposition';
import { QuestionMinimalPairs } from './QuestionMinimalPairs';
import { SpeakQuestion } from './SpeakQuestion';

const RESULT_KEY = 'english-global-practice-result';

interface Props {
  questions: PracticeQuestion[];
  source: PracticeSource;
  day?: number;
  scope?: PracticeScope;
  kinds: SessionRecord['kinds'];
  retryWrongInSession: boolean;
}

type SessionPhase = 'main' | 'retry';

function pushUnique<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr : [...arr, value];
}

export function GlobalPracticeSession({
  questions,
  source,
  day,
  scope,
  kinds,
  retryWrongInSession,
}: Props) {
  const router = useRouter();
  const { items, mark, unmark } = useDifficultExamples();
  const { practice } = usePracticeState();
  const speakDelay = practice.speakDelay ?? 5;
  const [startedAt] = useState(() => new Date().toISOString());
  const [phase, setPhase] = useState<SessionPhase>('main');
  const [mainIdx, setMainIdx] = useState(0);
  const [retryPool, setRetryPool] = useState<PracticeQuestion[]>([]);
  const [retryIdx, setRetryIdx] = useState(0);
  const [retryCorrect, setRetryCorrect] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [mainWrongIds, setMainWrongIds] = useState<string[]>([]);

  const mainTotal = questions.length;
  const currentPool = phase === 'main' ? questions : retryPool;
  const currentIdx = phase === 'main' ? mainIdx : retryIdx;
  const current = currentPool[currentIdx];
  const retryTotal = retryPool.length;
  const totalForBar = mainTotal + retryTotal;
  const progressedForBar =
    phase === 'main' ? mainIdx : mainTotal + retryIdx;

  const applyDifficultAndWrongBank = (q: PracticeQuestion, wasCorrect: boolean) => {
    const key = difficultKey(q.groupId, q.exampleIdx);
    const wasFlagged = !!items[key];

    if (wasCorrect) {
      if (wasFlagged) unmark(key);
      removeFromWrongBank(key);
    } else {
      mark(key, {
        markedAt: items[key]?.markedAt ?? new Date().toISOString().slice(0, 10),
        sessionsStruggled: (items[key]?.sessionsStruggled ?? 0) + 1,
      });
      addToWrongBank(key);
    }
  };

  const finish = (wrongIds: string[], retryCorrectCount: number, retryCount: number) => {
    const wrongQs = questions.filter((q) => wrongIds.includes(q.id));
    const wrongKeys = wrongQs.map((q) => difficultKey(q.groupId, q.exampleIdx));

    addSessionRecord({
      id: new Date().toISOString(),
      startedAt,
      endedAt: new Date().toISOString(),
      source,
      day,
      scope,
      kinds,
      total: questions.length,
      correct: questions.length - wrongIds.length,
      wrongKeys,
    });

    const result: PracticeSessionResult = {
      total: questions.length,
      correct: questions.length - wrongIds.length,
      wrong: wrongQs,
      newlyDifficult: [],
      retryCorrect: retryCorrectCount,
      retryTotal: retryCount,
    };
    try {
      sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
    } catch {
      toast.error('결과를 저장하지 못했습니다.');
    }
    router.push('/practice/result/');
  };

  const next = () => {
    if (phase === 'main') {
      if (mainIdx >= mainTotal - 1) {
        const wrongMainQs = questions.filter((q) => mainWrongIds.includes(q.id));
        if (retryWrongInSession && wrongMainQs.length > 0) {
          setRetryPool(wrongMainQs);
          setRetryIdx(0);
          setPicked(null);
          setRevealed(false);
          setPhase('retry');
          return;
        }
        finish(mainWrongIds, 0, 0);
        return;
      }
      setMainIdx((v) => v + 1);
    } else {
      if (retryIdx >= retryPool.length - 1) {
        finish(mainWrongIds, retryCorrect, retryPool.length);
        return;
      }
      setRetryIdx((v) => v + 1);
    }
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
    applyDifficultAndWrongBank(current, ok);
    if (!ok) {
      if (phase === 'main') {
        setMainWrongIds((prev) => pushUnique(prev, current.id));
      }
    } else if (phase === 'retry') {
      setRetryCorrect((v) => v + 1);
    }
  };

  const onSpeakRated = (markedDifficult: boolean) => {
    if (!current) return;
    const key = difficultKey(current.groupId, current.exampleIdx);

    if (markedDifficult) {
      mark(key, {
        markedAt: items[key]?.markedAt ?? new Date().toISOString().slice(0, 10),
        sessionsStruggled: (items[key]?.sessionsStruggled ?? 0) + 1,
      });
      addToWrongBank(key);
      if (phase === 'main') {
        setMainWrongIds((prev) => pushUnique(prev, current.id));
      }
      return;
    }

    if (items[key]) unmark(key);
    removeFromWrongBank(key);
    if (phase === 'main') {
      setMainWrongIds((prev) => prev.filter((id) => id !== current.id));
    } else {
      setRetryCorrect((v) => v + 1);
    }
  };

  const onCompositionSelfGrade = (wasCorrect: boolean) => {
    if (!current) return;
    applyDifficultAndWrongBank(current, wasCorrect);

    if (phase === 'main') {
      const nextWrongIds = !wasCorrect
        ? pushUnique(mainWrongIds, current.id)
        : mainWrongIds;
      if (!wasCorrect) {
        setMainWrongIds(nextWrongIds);
      }

      if (mainIdx >= mainTotal - 1) {
        const wrongMainQs = questions.filter((q) => nextWrongIds.includes(q.id));
        if (retryWrongInSession && wrongMainQs.length > 0) {
          setRetryPool(wrongMainQs);
          setRetryIdx(0);
          setPicked(null);
          setRevealed(false);
          setPhase('retry');
          return;
        }
        finish(nextWrongIds, 0, 0);
        return;
      }

      setMainIdx((v) => v + 1);
      setPicked(null);
      setRevealed(false);
      return;
    }

    const nextRetryCorrect = wasCorrect ? retryCorrect + 1 : retryCorrect;
    if (wasCorrect) {
      setRetryCorrect(nextRetryCorrect);
    }
    if (retryIdx >= retryPool.length - 1) {
      finish(mainWrongIds, nextRetryCorrect, retryPool.length);
      return;
    }
    setRetryIdx((v) => v + 1);
    setPicked(null);
    setRevealed(false);
  };

  const progress = useMemo(
    () =>
      totalForBar
        ? Math.min(100, ((progressedForBar + 1) / totalForBar) * 100)
        : 0,
    [progressedForBar, totalForBar]
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
      {phase === 'retry' ? (
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-2 text-sm text-muted-foreground">
            <RotateCcw className="h-3.5 w-3.5" />
            어려움 표시한 문제 다시 · {retryIdx + 1} / {retryPool.length}
          </div>
        </div>
      ) : null}

      <div className="mb-6 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground tabular-nums">
          {phase === 'retry' ? '🔁 재풀이' : '🎯 전체 연습'} ·{' '}
          {kindLabel(current.kind)}
        </span>
        <span className="text-xs tabular-nums text-muted-foreground">
          {currentIdx + 1} / {currentPool.length}
        </span>
      </div>
      <div className="mb-8 h-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="rounded-lg border bg-card p-6 md:p-8">
        {current.kind === 'speak' ? (
          <SpeakQuestion
            key={current.id}
            q={current}
            speakDelay={speakDelay}
            onRated={onSpeakRated}
            onNext={next}
          />
        ) : null}
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

      {revealed &&
      current.kind !== 'composition' &&
      current.kind !== 'speak' ? (
        <div className="mt-6 flex justify-end">
          <Button type="button" onClick={next}>
            {phase === 'main' && mainIdx + 1 === mainTotal
              ? retryWrongInSession && mainWrongIds.length > 0
                ? '다시 풀기 →'
                : '결과 보기'
              : phase === 'retry' && retryIdx + 1 === retryPool.length
                ? '결과 보기'
                : '다음 →'}
          </Button>
        </div>
      ) : null}
    </article>
  );
}
