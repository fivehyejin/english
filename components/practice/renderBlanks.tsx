import type { PracticeQuestion } from '@/types';

function BlankSpan({ children }: { children: React.ReactNode }) {
  return (
    <span className="border-b-2 border-primary font-semibold tabular-nums">
      {children}
    </span>
  );
}

/**
 * fullEn 기준 오프셋으로 빈칸 렌더 (전체 연습 collocation / minimal-pairs)
 */
export function renderBlanksFromQuestion(
  q: PracticeQuestion,
  opts: { revealed: boolean; picked: string | null }
): React.ReactNode {
  const { revealed, picked } = opts;
  const fullEn = q.fullEn.split('/')[0]?.trim() ?? q.fullEn;

  if (q.blanks && q.blanks.length > 0) {
    const sorted = [...q.blanks].sort((a, b) => a.start - b.start);
    const fills =
      revealed && q.answer.includes(' / ')
        ? q.answer.split(' / ').map((s) => s.trim())
        : null;
    const nodes: React.ReactNode[] = [];
    let last = 0;
    sorted.forEach((b, i) => {
      nodes.push(<span key={`t-${b.start}`}>{fullEn.slice(last, b.start)}</span>);
      const inner =
        revealed && fills?.[i] ? fills[i] : '_____';
      nodes.push(<BlankSpan key={`b-${b.start}`}>{inner}</BlankSpan>);
      last = b.start + b.length;
    });
    nodes.push(<span key="end">{fullEn.slice(last)}</span>);
    return <>{nodes}</>;
  }

  if (q.blankStart != null && q.blankLength != null) {
    const before = fullEn.slice(0, q.blankStart);
    const orig = fullEn.slice(q.blankStart, q.blankStart + q.blankLength);
    const after = fullEn.slice(q.blankStart + q.blankLength);
    const showMid = revealed ? orig : picked ?? '_____';
    return (
      <>
        {before}
        <BlankSpan>{showMid}</BlankSpan>
        {after}
      </>
    );
  }

  return fullEn;
}
