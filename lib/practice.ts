import type { CurriculumData, PatternGroup, PracticeQuestion } from '@/types';

const SISTER_SETS: string[][] = [
  ['m2d4-try-N', 'm2d4-try-ing', 'm2d4-try-to-V'],
  ['m2d3-have', 'm2d3-get', 'm2d3-keep'],
];

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function titleToken(group: PatternGroup): string | null {
  const m = group.title.match(/[A-Za-z][A-Za-z-]*/);
  return m ? m[0].toLowerCase() : null;
}

export function getSisterGroupIds(
  groupId: string,
  groups: PatternGroup[]
): string[] {
  for (const set of SISTER_SETS) {
    if (set.includes(groupId)) {
      return set;
    }
  }
  const me = groups.find((g) => g.id === groupId);
  if (!me) return [groupId];
  const sameDay = groups.filter((g) => g.day === me.day).map((g) => g.id);
  return sameDay.slice(0, 4);
}

export function generateFillInQuestions(
  group: PatternGroup,
  allGroups: PatternGroup[]
): PracticeQuestion[] {
  const token = titleToken(group);
  if (!token) return [];
  const sisters = getSisterGroupIds(group.id, allGroups)
    .map((id) => allGroups.find((g) => g.id === id))
    .filter((g): g is PatternGroup => !!g);
  const sisterTokens = uniq(
    sisters
      .map((g) => titleToken(g))
      .filter((v): v is string => !!v)
      .map((v) => v.toLowerCase())
  );

  const out: PracticeQuestion[] = [];
  group.examples.forEach((ex, exampleIdx) => {
    const re = new RegExp(`\\b${token}\\b`, 'i');
    if (!re.test(ex.en)) return;
    const prompt = ex.en.replace(re, '_____');
    const choices = shuffle(uniq([token, ...sisterTokens])).slice(0, 4);
    if (!choices.includes(token)) choices[0] = token;
    out.push({
      id: `fill-${group.id}-${exampleIdx}`,
      kind: 'fill-in',
      groupId: group.id,
      groupTitle: group.title,
      exampleIdx,
      fullEn: ex.en,
      ko: ex.ko,
      prompt,
      choices: shuffle(choices),
      answer: token,
    });
  });
  return out;
}

export function generatePatternChoiceQuestions(
  dayGroups: PatternGroup[]
): PracticeQuestion[] {
  const candidates = dayGroups.filter((g) => g.kind !== 'class-note');
  const titles = uniq(candidates.map((g) => g.title));
  const out: PracticeQuestion[] = [];

  candidates.forEach((g) => {
    g.examples.forEach((ex, exampleIdx) => {
      const wrongs = shuffle(titles.filter((t) => t !== g.title)).slice(0, 3);
      const choices = shuffle(uniq([g.title, ...wrongs]));
      out.push({
        id: `pattern-${g.id}-${exampleIdx}`,
        kind: 'pattern-choice',
        groupId: g.id,
        groupTitle: g.title,
        exampleIdx,
        fullEn: ex.en,
        ko: ex.ko,
        prompt: ex.ko,
        choices,
        answer: g.title,
      });
    });
  });
  return out;
}

export function generateSortQuestions(
  dayGroups: PatternGroup[]
): PracticeQuestion[] {
  const out: PracticeQuestion[] = [];
  const rules = [
    {
      id: 'transitive',
      label: '타동사',
      test: (id: string) =>
        id.includes('transitive') && !id.includes('intransitive'),
    },
    {
      id: 'intransitive',
      label: '자동사',
      test: (id: string) => id.includes('intransitive'),
    },
    { id: 'both', label: '둘 다', test: (id: string) => id.includes('both') },
  ] as const;

  dayGroups.forEach((g) => {
    const matched = rules.find((r) => r.test(g.id));
    if (!matched) return;
    g.examples.forEach((ex, exampleIdx) => {
      out.push({
        id: `sort-${g.id}-${exampleIdx}`,
        kind: 'sort-transitivity',
        groupId: g.id,
        groupTitle: g.title,
        exampleIdx,
        fullEn: ex.en,
        ko: ex.ko,
        prompt: ex.en,
        choices: ['타동사', '자동사', '둘 다'],
        answer: matched.label,
      });
    });
  });

  return out;
}

export function uniqueByExample(questions: PracticeQuestion[]): PracticeQuestion[] {
  const seen = new Set<string>();
  const out: PracticeQuestion[] = [];
  for (const q of questions) {
    const key = `${q.groupId}:${q.exampleIdx}:${q.kind}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(q);
  }
  return out;
}

/** 일반 그룹 예문만, KO→EN Speak 연습용 */
export function generateSpeakQuestions(
  curriculum: CurriculumData,
  dayFilter?: number | number[]
): PracticeQuestion[] {
  const days = dayFilter
    ? Array.isArray(dayFilter)
      ? dayFilter
      : [dayFilter]
    : null;

  const groups = curriculum.groups.filter((g) => {
    if (g.kind === 'class-note') return false;
    if (days && !days.includes(g.day)) return false;
    return g.examples.length > 0;
  });

  const questions: PracticeQuestion[] = [];
  for (const g of groups) {
    g.examples.forEach((ex, idx) => {
      questions.push({
        id: `speak-${g.id}-${idx}`,
        kind: 'speak',
        groupId: g.id,
        exampleIdx: idx,
        prompt: ex.ko,
        fullEn: ex.en,
        answer: ex.en,
        choices: undefined,
        ko: ex.ko,
      });
    });
  }
  return shuffle(questions);
}
