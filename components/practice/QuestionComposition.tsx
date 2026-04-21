'use client';

import { useState } from 'react';
import { Volume2 } from 'lucide-react';

import { gradeComposition } from '@/lib/grading';
import { speak } from '@/lib/speech';
import type { CompositionResult, PracticeQuestion } from '@/types';

import { Button } from '@/components/ui/button';

interface Props {
  q: PracticeQuestion;
  onSelfGrade: (wasCorrect: boolean) => void;
}

export function QuestionComposition({ q, onSelfGrade }: Props) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [verdict, setVerdict] = useState<CompositionResult | null>(null);

  const submit = () => {
    if (!input.trim()) return;
    const g = gradeComposition(input, q.answer);
    setVerdict(g);
    setSubmitted(true);
    speak(q.answer);
  };

  const resetForNext = () => {
    setInput('');
    setSubmitted(false);
    setVerdict(null);
  };

  if (!submitted) {
    return (
      <div>
        <p className="mb-3 text-lg font-medium leading-relaxed md:text-xl">
          {q.ko ?? q.prompt}
        </p>
        {q.hint ? (
          <p className="mb-6 text-xs text-muted-foreground">힌트: {q.hint}</p>
        ) : (
          <div className="mb-6" />
        )}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-24 w-full resize-none rounded-md border border-input bg-background px-4 py-3 font-mono text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40"
          placeholder="여기에 영어로…"
        />
        <Button
          type="button"
          className="mt-4 w-full"
          disabled={!input.trim()}
          onClick={submit}
        >
          제출
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
          당신 답
        </div>
        <div className="rounded-md border bg-muted/40 px-4 py-3 font-mono text-sm">
          {input}
        </div>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            정답
          </div>
          <button
            type="button"
            onClick={() => speak(q.answer)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Volume2 className="h-3 w-3" /> 듣기
          </button>
        </div>
        <div className="rounded-md border border-l-4 border-l-green-500 bg-green-50 px-4 py-3 font-medium dark:bg-green-950/30">
          {q.answer}
        </div>
      </div>
      {verdict ? (
        <div className="text-sm">
          <span className="text-muted-foreground">자동 판정: </span>
          {verdict.verdict === 'exact' && (
            <span className="text-green-700 dark:text-green-400">✓ 정확히 일치</span>
          )}
          {verdict.verdict === 'reorder' && (
            <span>△ 단어는 맞는데 순서 다름</span>
          )}
          {verdict.verdict === 'partial' && (
            <span>△ 핵심 단어 일부 일치</span>
          )}
          {verdict.verdict === 'mismatch' && (
            <span className="text-destructive">✗ 다름</span>
          )}
        </div>
      ) : null}
      <div>
        <div className="mb-2 text-sm font-medium">이번엔 어땠어?</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              onSelfGrade(true);
              resetForNext();
            }}
            className="rounded-md border border-green-500 px-4 py-3 text-sm font-medium hover:bg-green-50 dark:hover:bg-green-950/30"
          >
            ✓ 맞다고 치겠어
          </button>
          <button
            type="button"
            onClick={() => {
              onSelfGrade(false);
              resetForNext();
            }}
            className="rounded-md border px-4 py-3 text-sm font-medium hover:bg-muted"
          >
            ✗ 다시 보겠어
          </button>
        </div>
      </div>
    </div>
  );
}
