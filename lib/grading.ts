import type { CompositionResult, CompositionVerdict } from '@/types';

export function normalizeForGrading(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[()[\]{}]/g, ' ')
    .replace(/[.,!?;:"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

export function gradeComposition(user: string, answer: string): CompositionResult {
  const userWords = normalizeForGrading(user);
  const answerWords = normalizeForGrading(answer);

  if (userWords.join(' ') === answerWords.join(' ')) {
    return { verdict: 'exact', userWords, answerWords, matchRatio: 1 };
  }

  const sortedUser = [...userWords].sort().join(' ');
  const sortedAnswer = [...answerWords].sort().join(' ');
  if (sortedUser === sortedAnswer) {
    return { verdict: 'reorder', userWords, answerWords, matchRatio: 1 };
  }

  const answerSet = new Set(answerWords);
  const matched = userWords.filter((w) => answerSet.has(w)).length;
  const ratio = answerWords.length === 0 ? 0 : matched / answerWords.length;

  if (ratio >= 0.7) {
    return {
      verdict: 'partial' as CompositionVerdict,
      userWords,
      answerWords,
      matchRatio: ratio,
    };
  }

  return {
    verdict: 'mismatch',
    userWords,
    answerWords,
    matchRatio: ratio,
  };
}
