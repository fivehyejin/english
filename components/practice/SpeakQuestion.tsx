'use client';

import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { speak } from '@/lib/speech';
import type { PracticeQuestion } from '@/types';

type Stage = 'thinking' | 'reveal' | 'shadow';

function englishLine(q: PracticeQuestion): string {
  return q.fullEn.split('/')[0]?.trim() ?? q.fullEn;
}

interface SpeakQuestionProps {
  q: PracticeQuestion;
  speakDelay: number;
  onRated: (markedDifficult: boolean) => void;
  onNext: () => void;
}

export function SpeakQuestion({
  q,
  speakDelay,
  onRated,
  onNext,
}: SpeakQuestionProps) {
  const [stage, setStage] = useState<Stage>('thinking');
  const [secondsLeft, setSecondsLeft] = useState(speakDelay);

  useEffect(() => {
    setStage('thinking');
    setSecondsLeft(speakDelay);
  }, [q.id, speakDelay]);

  useEffect(() => {
    if (stage !== 'thinking') return;
    if (secondsLeft <= 0) {
      setStage('reveal');
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, secondsLeft]);

  const enLine = englishLine(q);
  useEffect(() => {
    if (stage === 'reveal') {
      speak(enLine);
    }
  }, [stage, enLine]);

  const replay = () => speak(englishLine(q));

  const pct =
    speakDelay > 0 ? Math.max(0, (secondsLeft / speakDelay) * 100) : 0;

  return (
    <div className="space-y-4">
      <p className="text-lg leading-relaxed md:text-xl">&quot;{q.prompt}&quot;</p>

      {stage === 'thinking' ? (
        <>
          <p className="mt-6 text-sm text-muted-foreground">
            💭 영어로 말해보세요
          </p>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-1000 ease-linear"
              style={{ width: `${pct}%` }}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStage('reveal')}
            className="mt-4"
          >
            ⏭ 바로 보기
          </Button>
        </>
      ) : null}

      {stage === 'reveal' ? (
        <>
          <p className="mt-6 text-xl font-semibold leading-relaxed md:text-2xl">
            {englishLine(q)}
          </p>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={replay}
            className="mt-2"
          >
            <Volume2 className="mr-1 h-4 w-4" /> 다시 듣기
          </Button>

          <div className="mt-8 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onRated(true);
                setStage('shadow');
              }}
            >
              😅 어려움
            </Button>
            <Button
              type="button"
              onClick={() => {
                onRated(false);
                setStage('shadow');
              }}
              className="flex-1"
            >
              ✓ 알았어
            </Button>
          </div>
        </>
      ) : null}

      {stage === 'shadow' ? (
        <>
          <p className="mt-6 text-xl font-semibold leading-relaxed md:text-2xl">
            {englishLine(q)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            🗣️ 소리 내서 따라 말해보세요
          </p>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={replay}
            className="mt-2"
          >
            <Volume2 className="mr-1 h-4 w-4" /> 다시 듣기
          </Button>

          <Button type="button" onClick={onNext} className="mt-8 w-full">
            다음 →
          </Button>
        </>
      ) : null}
    </div>
  );
}
