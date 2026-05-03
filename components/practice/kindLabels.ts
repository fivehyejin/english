import type { PracticeKind } from '@/types';

export function kindLabel(k: PracticeKind): string {
  const map: Record<PracticeKind, string> = {
    collocation: '동사 짝꿍',
    'minimal-pairs': '비슷한 동사 구분',
    composition: '직접 작문',
    'fill-in': '빈칸 채우기',
    'pattern-choice': '동사 고르기',
    'sort-transitivity': '자·타동사 분류',
    speak: 'Speak Mode',
  };
  return map[k] ?? k;
}
