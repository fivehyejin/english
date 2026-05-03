import { generateSpeakQuestions } from '@/lib/practice';
import type {
  CurriculumData,
  GlobalPracticeConfig,
  PatternGroup,
  PracticeKind,
  PracticeQuestion,
  PracticeScope,
} from '@/types';
import { difficultKey, getAllDays, parseDifficultKey } from '@/types';

const KNOWN_PREPS = new Set([
  'in',
  'on',
  'at',
  'to',
  'for',
  'with',
  'by',
  'from',
  'into',
  'onto',
  'about',
  'of',
  'off',
]);

export const CROSS_DAY_SISTERS: Record<string, string[]> = {
  'm2d3-have': ['m2d3-get', 'm2d3-keep', 'm2d4-take-basic'],
  'm2d3-get': ['m2d3-have', 'm2d3-keep', 'm2d4-take-basic'],
  'm2d3-keep': ['m2d3-have', 'm2d3-get', 'm2d4-take-basic'],
  'm2d4-take-basic': ['m2d3-have', 'm2d3-get', 'm2d3-keep'],
  'm2d4-try-N': ['m2d4-try-ing', 'm2d4-try-to-V'],
  'm2d4-try-ing': ['m2d4-try-N', 'm2d4-try-to-V'],
  'm2d4-try-to-V': ['m2d4-try-N', 'm2d4-try-ing'],
  'm2d2-will': ['m2d2-should', 'm2d2-can-could-might', 'm2d2-haveto'],
  'm2d2-should': ['m2d2-will', 'm2d2-can-could-might', 'm2d2-haveto'],
  'm2d2-can-could-might': ['m2d2-will', 'm2d2-should', 'm2d2-haveto'],
  'm2d2-haveto': ['m2d2-will', 'm2d2-should', 'm2d2-can-could-might'],
  'm2d5-too-circular': ['m2d5-enough-circular'],
  'm2d5-enough-circular': ['m2d5-too-circular'],
  'm2d5-too-straight': ['m2d5-enough-straight'],
  'm2d5-enough-straight': ['m2d5-too-straight'],
  'm2d5-too-it-subject': ['m2d5-enough-it-subject'],
  'm2d5-enough-it-subject': ['m2d5-too-it-subject'],
};

export const INTRANSITIVE_PREP_RULES: Record<
  string,
  { required: string; meaning: string }
> = {
  arrive: { required: 'at/in', meaning: '장소에 도착' },
  listen: { required: 'to', meaning: '~을 듣다 (귀 기울이다)' },
  talk: { required: 'to/with', meaning: '~와 얘기하다' },
  wait: { required: 'for', meaning: '~을 기다리다' },
  look: { required: 'at', meaning: '~을 보다 (시선)' },
  go: { required: 'to', meaning: '~에 가다' },
  laugh: { required: 'at', meaning: '~을 비웃다' },
};

export function getCrossDaySisters(groupId: string): string[] {
  return CROSS_DAY_SISTERS[groupId] ?? [];
}

export function extractCollocation(
  pattern: string | undefined
): { verb: string; prep: string } | null {
  if (!pattern) return null;
  const words = pattern.toLowerCase().split(/\s+/);
  if (words.length < 2) return null;
  const verb = words[0];
  const prep = words.find((w) => KNOWN_PREPS.has(w));
  if (!prep) return null;
  return { verb, prep };
}

export function daysInScope(
  scope: PracticeScope,
  curriculum: CurriculumData
): number[] {
  const all = getAllDays(curriculum);
  if (scope === 'all') return all;
  if (scope === 'd1-2') return all.filter((d) => d >= 1 && d <= 2);
  if (scope === 'd3-4') return all.filter((d) => d >= 3 && d <= 4);
  if (scope === 'd5-6') return all.filter((d) => d >= 5 && d <= 6);
  if (scope === 'd7-8') return all.filter((d) => d >= 7 && d <= 8);
  return all;
}

/** 어려움 키에 해당하는 Speak 문항만 */
export function buildSpeakQuestionsForDifficultKeys(
  curriculum: CurriculumData,
  keys: string[]
): PracticeQuestion[] {
  const set = new Set(keys);
  return generateSpeakQuestions(curriculum).filter((q) =>
    set.has(difficultKey(q.groupId, q.exampleIdx))
  );
}

/** 오답 보관함 키 목록으로 풀 구성(선택한 유형만) */
export function buildQuestionsFromWrongBankKeys(
  curriculum: CurriculumData,
  kinds: PracticeKind[],
  keys: string[]
): PracticeQuestion[] {
  const legacy = buildDifficultOnlyQuestions(curriculum, keys);
  let pool = legacy.filter((q) => kinds.includes(q.kind));
  if (kinds.includes('speak')) {
    pool = pool.concat(buildSpeakQuestionsForDifficultKeys(curriculum, keys));
  }
  return dedupeQuestions(pool);
}

export function groupsInScope(
  curriculum: CurriculumData,
  scope: PracticeScope
): PatternGroup[] {
  const days = new Set(daysInScope(scope, curriculum));
  return curriculum.groups.filter((g) => days.has(g.day));
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function firstSentence(en: string): string {
  return en.split('/')[0]?.trim() ?? en.trim();
}

function findWordRange(
  hay: string,
  needle: string
): { start: number; length: number } | null {
  const re = new RegExp(`\\b${escapeRe(needle)}\\b`, 'i');
  const m = hay.match(re);
  if (!m || m.index === undefined) return null;
  return { start: m.index, length: m[0].length };
}

function collectCollocationPairsInScope(
  groups: PatternGroup[]
): { verb: string; prep: string }[] {
  const set = new Map<string, { verb: string; prep: string }>();
  for (const g of groups) {
    const c = extractCollocation(g.pattern);
    if (c) set.set(`${c.verb}|${c.prep}`, c);
  }
  return [...set.values()];
}

function wrongPreps(correct: string, pool: string[]): string[] {
  return shuffle(pool.filter((p) => p !== correct)).slice(0, 3);
}

function buildPrepBlankQuestion(
  group: PatternGroup,
  exampleIdx: number,
  enRaw: string,
  ko: string,
  col: { verb: string; prep: string },
  distractorPreps: string[]
): PracticeQuestion | null {
  const en = firstSentence(enRaw);
  const prepRange = findWordRange(en, col.prep);
  if (!prepRange) return null;
  const wrongs = wrongPreps(col.prep, distractorPreps);
  const choices = shuffle([col.prep, ...wrongs]).slice(0, 4);
  if (!choices.includes(col.prep)) choices[0] = col.prep;

  return {
    id: `gcol-prep-${group.id}-${exampleIdx}-${prepRange.start}`,
    kind: 'collocation',
    subKind: 'fill-preposition',
    groupId: group.id,
    exampleIdx,
    groupPattern: group.pattern,
    prompt: ko.split('/')[0]?.trim() ?? group.title,
    fullEn: enRaw,
    answer: col.prep,
    choices,
    ko: group.examples[exampleIdx]?.ko,
    blankStart: prepRange.start,
    blankLength: prepRange.length,
  };
}

function buildVerbPrepQuestion(
  group: PatternGroup,
  exampleIdx: number,
  enRaw: string,
  col: { verb: string; prep: string },
  otherPairs: { verb: string; prep: string }[]
): PracticeQuestion | null {
  const en = firstSentence(enRaw);
  const vr = findWordRange(en, col.verb);
  const pr = findWordRange(en, col.prep);
  if (!vr || !pr) return null;

  const answer = `${col.verb} / ${col.prep}`;
  const altStrs = shuffle(
    otherPairs
      .filter((p) => !(p.verb === col.verb && p.prep === col.prep))
      .map((p) => `${p.verb} / ${p.prep}`)
  ).slice(0, 5);

  const choices = shuffle([answer, ...altStrs]).slice(0, 4);
  if (!choices.includes(answer)) choices[0] = answer;

  const blanks = [
    { start: vr.start, length: vr.length, answer: col.verb },
    { start: pr.start, length: pr.length, answer: col.prep },
  ].sort((a, b) => a.start - b.start);

  return {
    id: `gcol-vp-${group.id}-${exampleIdx}`,
    kind: 'collocation',
    subKind: 'fill-verb-and-prep',
    groupId: group.id,
    exampleIdx,
    groupPattern: group.pattern,
    prompt: '빈칸에 맞는 동사와 전치사 세트를 고르세요.',
    fullEn: enRaw,
    answer,
    choices,
    ko: group.examples[exampleIdx]?.ko,
    blanks,
  };
}

function buildDetectTransitivity(
  group: PatternGroup,
  exampleIdx: number,
  correctEn: string,
  wrongEn: string,
  ruleVerb: string
): PracticeQuestion {
  return {
    id: `gcol-detect-${group.id}-${exampleIdx}`,
    kind: 'collocation',
    subKind: 'detect-transitivity-error',
    groupId: group.id,
    exampleIdx,
    prompt: '이 문장이 문법적으로 맞다고 생각하나요?',
    fullEn: wrongEn,
    expectedFullEn: firstSentence(correctEn),
    answer: '틀리다',
    choices: ['맞다', '틀리다'],
    ko: group.examples[exampleIdx]?.ko,
    ruleVerb,
    groupPattern: group.pattern,
  };
}

function tryWrongWithoutPrep(correct: string, prep: string): string | null {
  const re = new RegExp(`\\s+${escapeRe(prep)}\\s+`, 'i');
  if (!re.test(correct)) return null;
  return correct.replace(re, ' ');
}

function buildIntransitiveDetections(
  group: PatternGroup,
  exampleIdx: number,
  en: string
): PracticeQuestion[] {
  const out: PracticeQuestion[] = [];
  const lower = en.toLowerCase();
  if (/\bwe arrived at\b/i.test(en)) {
    const w = tryWrongWithoutPrep(firstSentence(en), 'at');
    if (w)
      out.push(buildDetectTransitivity(group, exampleIdx, en, w, 'arrive'));
  }
  if (/\bwait for\b/i.test(lower)) {
    const w = tryWrongWithoutPrep(firstSentence(en), 'for');
    if (w)
      out.push(buildDetectTransitivity(group, exampleIdx, en, w, 'wait'));
  }
  if (/\blisten to\b/i.test(lower)) {
    const w = tryWrongWithoutPrep(firstSentence(en), 'to');
    if (w)
      out.push(buildDetectTransitivity(group, exampleIdx, en, w, 'listen'));
  }
  return out;
}

export function buildCollocationQuestions(
  curriculum: CurriculumData,
  scope: PracticeScope
): PracticeQuestion[] {
  const groups = groupsInScope(curriculum, scope).filter(
    (g) => g.kind !== 'class-note' && g.examples.length
  );
  const prepPool = [...KNOWN_PREPS];
  const pairs = collectCollocationPairsInScope(groups);
  const out: PracticeQuestion[] = [];

  for (const g of groups) {
    const col = extractCollocation(g.pattern);
    if (!col) continue;
    g.examples.forEach((ex, exampleIdx) => {
      const prepQ = buildPrepBlankQuestion(
        g,
        exampleIdx,
        ex.en,
        ex.ko,
        col,
        prepPool
      );
      if (prepQ) out.push(prepQ);

      const vp = buildVerbPrepQuestion(g, exampleIdx, ex.en, col, pairs);
      if (vp) out.push(vp);

      out.push(...buildIntransitiveDetections(g, exampleIdx, ex.en));
    });
  }

  return dedupeQuestions(out);
}

function titleChoiceLabel(g: PatternGroup): string {
  return g.title.trim();
}

function groupBrief(g: PatternGroup): string {
  const m = g.meaning ? `${g.title} · ${g.meaning}` : g.title;
  return m.slice(0, 120);
}

function tryBlankToken(en: string, groupId: string): string | null {
  const line = firstSentence(en);
  if (groupId.includes('try-to')) {
    const m = line.match(/\btry\s+to\s+([A-Za-z]+)/i);
    return m ? `to ${m[1]}` : null;
  }
  if (groupId.includes('try-ing')) {
    const m = line.match(/\btry\s+([A-Za-z]+ing)\b/i);
    return m ? m[1]! : null;
  }
  if (groupId.includes('try-N')) {
    const m = line.match(/\btry\s+([A-Za-z][A-Za-z '!?]*)/i);
    if (!m) return null;
    let frag = m[1]!.trim();
    if (frag.toLowerCase().startsWith('to')) return null;
    if (frag.length > 40) frag = frag.slice(0, 40);
    return frag;
  }
  return null;
}

function findSubstringRange(hay: string, needle: string) {
  const i = hay.toLowerCase().indexOf(needle.toLowerCase());
  if (i < 0) return null;
  return { start: i, length: needle.length };
}

function buildMinimalForCrossGroup(
  curriculum: CurriculumData,
  group: PatternGroup,
  sisterIds: string[]
): PracticeQuestion[] {
  const sisters = sisterIds
    .map((id) => curriculum.groups.find((g) => g.id === id))
    .filter((g): g is PatternGroup => !!g && g.kind !== 'class-note');
  const allG = [group, ...sisters];
  const choices = shuffle(allG.map(titleChoiceLabel));
  const wrongBrief: Record<string, string> = {};
  for (const sg of allG) {
    wrongBrief[titleChoiceLabel(sg)] = groupBrief(sg);
  }

  const out: PracticeQuestion[] = [];

  for (const g of allG) {
    g.examples.forEach((ex, exampleIdx) => {
      const line = firstSentence(ex.en);
      let range: { start: number; length: number } | null = null;

      if (g.id.startsWith('m2d5-') && (g.id.includes('too') || g.id.includes('enough'))) {
        const tooR = findWordRange(line, 'too');
        const enR = findWordRange(line, 'enough');
        range = tooR ?? enR;
      } else if (g.id.startsWith('m2d2-')) {
        const ORDER = [
          'might',
          'could',
          'would',
          'should',
          'will',
          'can',
          'must',
        ] as const;
        for (const w of ORDER) {
          const r = findWordRange(line, w);
          if (r) {
            range = r;
            break;
          }
        }
        if (!range) {
          const c = line.match(/\b([A-Za-z]+)'ll\b/i);
          if (c && c.index !== undefined) {
            range = { start: c.index, length: c[0].length };
          }
        }
      } else if (g.id.startsWith('m2d3-') || g.id === 'm2d4-take-basic') {
        const re =
          /\b(have|has|had|haven|having|get|got|getting|keep|kept|keeping|take|took|taking)\b/i;
        const m = line.match(re);
        if (m && m.index !== undefined) {
          range = { start: m.index, length: m[0].length };
        }
      } else if (g.id.includes('try-')) {
        const tok = tryBlankToken(ex.en, g.id);
        if (tok) range = findSubstringRange(line, tok);
      }

      if (!range) return;

      out.push({
        id: `gmp-${g.id}-${exampleIdx}-${range.start}`,
        kind: 'minimal-pairs',
        groupId: g.id,
        exampleIdx,
        prompt: '빈칸에 맞는 표현을 고르세요.',
        fullEn: ex.en,
        answer: titleChoiceLabel(g),
        choices,
        ko: ex.ko,
        blankStart: range.start,
        blankLength: range.length,
        correctGroupTitle: titleChoiceLabel(g),
        correctGroupMeaning: g.meaning ?? g.pattern ?? '',
        wrongGroupBrief: wrongBrief,
      });
    });
  }

  return out;
}

export function buildMinimalPairsQuestions(
  curriculum: CurriculumData,
  scope: PracticeScope
): PracticeQuestion[] {
  const out: PracticeQuestion[] = [];
  const seen = new Set<string>();
  const groups = groupsInScope(curriculum, scope);

  for (const g of groups) {
    const sisters = getCrossDaySisters(g.id);
    if (sisters.length === 0) continue;
    const key = [g.id, ...sisters].sort().join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(...buildMinimalForCrossGroup(curriculum, g, sisters));
  }

  return dedupeQuestions(out);
}

export function buildCompositionQuestions(
  curriculum: CurriculumData,
  scope: PracticeScope
): PracticeQuestion[] {
  const out: PracticeQuestion[] = [];
  const groups = groupsInScope(curriculum, scope).filter(
    (g) => g.kind !== 'class-note'
  );
  for (const g of groups) {
    g.examples.forEach((ex, exampleIdx) => {
      const line = firstSentence(ex.en);
      if (!line || !ex.ko.trim()) return;
      out.push({
        id: `gcomp-${g.id}-${exampleIdx}`,
        kind: 'composition',
        groupId: g.id,
        exampleIdx,
        prompt: ex.ko.split('/')[0]?.trim() ?? ex.ko,
        fullEn: ex.en,
        answer: line,
        ko: ex.ko.split('/')[0]?.trim() ?? ex.ko,
        hint: g.pattern ?? g.title,
      });
    });
  }
  return dedupeQuestions(out);
}

function dedupeQuestions(qs: PracticeQuestion[]): PracticeQuestion[] {
  const seen = new Set<string>();
  const out: PracticeQuestion[] = [];
  for (const q of qs) {
    const k = `${q.kind}:${q.id}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(q);
  }
  return out;
}

function inferKindForDifficultGroup(group: PatternGroup): PracticeKind {
  if (extractCollocation(group.pattern)) {
    return 'collocation';
  }
  if (getCrossDaySisters(group.id).length > 0) {
    return 'minimal-pairs';
  }
  return 'composition';
}

export function buildDifficultOnlyQuestions(
  curriculum: CurriculumData,
  difficultKeys: string[]
): PracticeQuestion[] {
  const out: PracticeQuestion[] = [];
  for (const key of difficultKeys) {
    const parsed = parseDifficultKey(key);
    if (!parsed) continue;
    const group = curriculum.groups.find((g) => g.id === parsed.groupId);
    if (!group || group.kind === 'class-note') continue;
    const ex = group.examples[parsed.exampleIdx];
    if (!ex) continue;
    const kind = inferKindForDifficultGroup(group);
    if (kind === 'composition') {
      const line = firstSentence(ex.en);
      out.push({
        id: `diff-comp-${key}`,
        kind: 'composition',
        groupId: group.id,
        exampleIdx: parsed.exampleIdx,
        prompt: ex.ko.split('/')[0]?.trim() ?? ex.ko,
        fullEn: ex.en,
        answer: line,
        ko: ex.ko.split('/')[0]?.trim() ?? ex.ko,
        hint: group.pattern ?? group.title,
      });
    } else if (kind === 'minimal-pairs') {
      const pool = buildMinimalPairsQuestions(curriculum, 'all').filter(
        (q) => q.groupId === group.id && q.exampleIdx === parsed.exampleIdx
      );
      if (pool[0]) {
        out.push({ ...pool[0], id: `diff-mp-${key}` });
      } else {
        const line = firstSentence(ex.en);
        out.push({
          id: `diff-comp-f-${key}`,
          kind: 'composition',
          groupId: group.id,
          exampleIdx: parsed.exampleIdx,
          prompt: ex.ko.split('/')[0]?.trim() ?? ex.ko,
          fullEn: ex.en,
          answer: line,
          ko: ex.ko.split('/')[0]?.trim() ?? ex.ko,
          hint: group.pattern ?? group.title,
        });
      }
    } else {
      const pool = buildCollocationQuestions(curriculum, 'all').filter(
        (q) => q.groupId === group.id && q.exampleIdx === parsed.exampleIdx
      );
      if (pool[0]) {
        out.push({ ...pool[0], id: `diff-col-${key}` });
      } else {
        const line = firstSentence(ex.en);
        out.push({
          id: `diff-comp-f2-${key}`,
          kind: 'composition',
          groupId: group.id,
          exampleIdx: parsed.exampleIdx,
          prompt: ex.ko.split('/')[0]?.trim() ?? ex.ko,
          fullEn: ex.en,
          answer: line,
          ko: ex.ko.split('/')[0]?.trim() ?? ex.ko,
          hint: group.pattern ?? group.title,
        });
      }
    }
  }
  return dedupeQuestions(out);
}

export function countCollocationInScope(
  curriculum: CurriculumData,
  scope: PracticeScope
): number {
  return buildCollocationQuestions(curriculum, scope).length;
}

export function countMinimalPairsInScope(
  curriculum: CurriculumData,
  scope: PracticeScope
): number {
  return buildMinimalPairsQuestions(curriculum, scope).length;
}

export function countCompositionInScope(
  curriculum: CurriculumData,
  scope: PracticeScope
): number {
  return buildCompositionQuestions(curriculum, scope).length;
}

export function countSpeakInScope(
  curriculum: CurriculumData,
  scope: PracticeScope
): number {
  return generateSpeakQuestions(
    curriculum,
    daysInScope(scope, curriculum)
  ).length;
}

function dedupeByExampleAndKind(qs: PracticeQuestion[]): PracticeQuestion[] {
  const seen = new Set<string>();
  const out: PracticeQuestion[] = [];
  for (const q of qs) {
    const k = `${q.groupId}:${q.exampleIdx}:${q.kind}:${q.subKind ?? ''}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(q);
  }
  return out;
}

/**
 * 전체 연습 문제 풀 생성.
 * `difficultKeys`: length가 `difficult-only`일 때 필수.
 */
export function buildGlobalQuestionPool(
  curriculum: CurriculumData,
  config: GlobalPracticeConfig,
  difficultKeys?: string[]
): PracticeQuestion[] {
  if (config.length === 'difficult-only') {
    const keys = difficultKeys ?? [];
    const legacy = buildDifficultOnlyQuestions(curriculum, keys);
    let pool = legacy.filter((q) => config.kinds.includes(q.kind));
    if (config.kinds.includes('speak')) {
      pool = pool.concat(buildSpeakQuestionsForDifficultKeys(curriculum, keys));
    }
    pool = dedupeQuestions(pool);
    return shuffle(pool);
  }
  let pool: PracticeQuestion[] = [];
  for (const k of config.kinds) {
    if (k === 'collocation') {
      pool = pool.concat(
        buildCollocationQuestions(curriculum, config.scope)
      );
    } else if (k === 'minimal-pairs') {
      pool = pool.concat(
        buildMinimalPairsQuestions(curriculum, config.scope)
      );
    } else if (k === 'composition') {
      pool = pool.concat(
        buildCompositionQuestions(curriculum, config.scope)
      );
    } else if (k === 'speak') {
      pool = pool.concat(
        generateSpeakQuestions(
          curriculum,
          daysInScope(config.scope, curriculum)
        )
      );
    }
  }
  pool = dedupeByExampleAndKind(pool);
  pool = shuffle(pool);
  const len = config.length;
  if (len === 'all') return pool;
  return pool.slice(0, Math.min(len, pool.length));
}
