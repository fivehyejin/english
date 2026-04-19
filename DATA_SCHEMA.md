# Data Schema

`curriculum-m2.json`의 구조를 TypeScript로 옮긴 것. `src/types.ts`로 그대로 복사해서 사용하면 됩니다.

## 변경 이력
- **v2 (현재)**: Day 요약(`daySummaries`) 추가, 복습 관련 타입 전체 제거
- v1: 복습 관리 앱 버전 (사용 안 함)

---

## 전체 타입 정의

```typescript
// ============================================
// 커리큘럼 데이터 (읽기 전용, JSON으로 제공)
// ============================================

export type Level = 'beginner' | 'intermediate';

export interface CurriculumData {
  /** 월 번호 (1~10) */
  month: number;
  /** 난이도 레벨 */
  level: Level;
  /** 해당 월의 대주제 */
  topic: string;
  /** 주제 세부 안내 (선택) */
  topicNote?: string;
  /** Day별 핵심 요약. key는 day number (1,2,3,...) */
  daySummaries: Record<number, DaySummary>;
  /** 패턴 그룹 배열 */
  groups: PatternGroup[];
}

export interface DaySummary {
  /** Day의 큰 제목, e.g. "HAVE · GET · KEEP" */
  dayTitle: string;
  /** "이 날의 핵심" 한 문장 (홈 목차의 카드에도 노출) */
  headline: string;
  /** 핵심 포인트 불릿 리스트. markdown 강조 문법 허용 (`**굵게**`, `*기울임*`, `` `code` ``) */
  keyPoints: string[];
  /** 꼭 기억할 것 (선택). 있으면 📌 아이콘과 함께 강조 배경으로 표시 */
  mustRemember?: string[];
}

export interface PatternGroup {
  /** 고유 ID. 형식: "m{month}d{day}-{topic}", e.g. "m2d1-leave" */
  id: string;
  /** Day 번호 (1부터 시작) */
  day: number;
  /** 해당 Day의 주제 (같은 day의 모든 그룹이 동일) */
  dayTopic: string;
  /** 그룹 제목 */
  title: string;
  /** 패턴 구조 설명 (선택) */
  pattern?: string;
  /** 그룹 의미 한 줄 설명 (선택) */
  meaning?: string;
  /** 예문 배열. 수업노트 전용 그룹은 빈 배열일 수 있음 */
  examples: Example[];
  /** 있으면 "수업노트 전용" 그룹 (예문이 없거나 적고 notes 중심) */
  kind?: 'class-note';
  /** 그룹 레벨 필기 메모 (멀티라인, 각 원소가 한 줄) */
  notes?: string[];
  /** 필기 출처 표시용, e.g. "✏️ 개인 필기 (이미지 11)" 또는 "✏️ 수업노트 · 04/14" */
  noteSource?: string;
}

export interface Example {
  /** 영어 원문 */
  en: string;
  /** 한국어 뜻 */
  ko: string;
  /** 이 예문에 붙은 필기 메모 (선택). 예문 아래 ✏️ 아이콘과 함께 표시 */
  note?: string;
}


// ============================================
// 사용자 상태 (localStorage에 저장) — 최소화
// ============================================

export interface AppState {
  /** 마지막으로 본 Day (홈 "📍 최근 학습" 표시용) */
  lastViewedDay: { month: number; day: number } | null;
  /** 테마 (next-themes가 관리하지만 명시용) */
  theme?: 'light' | 'dark' | 'system';
  /** 연습 모드 상태 (v2.1 추가) */
  practice?: PracticeState;
}

// ============================================
// 연습 모드 (v2.1 추가)
// ============================================

/**
 * 연습 모드 영구 상태.
 *
 * 저장하는 건 "어려움 표시된 예문" 단 하나뿐.
 * 세션 기록, 누적 통계, 점수, streak 등은 저장하지 않음 (복습 앱 회귀 방지).
 */
export interface PracticeState {
  /**
   * 어려움 플래그가 켜진 예문들.
   * key 형식: `${groupId}:${exampleIdx}` (e.g. "m2d3-have:5")
   */
  difficultExamples: Record<string, DifficultFlag>;
}

export interface DifficultFlag {
  /** 최초로 어려움 표시된 날짜 (ISO) */
  markedAt: string;
  /** 이 플래그가 유지된 세션 수 (표시용, 의사결정에 쓰지 않음) */
  sessionsStruggled: number;
}

/** 연습 유형 */
export type PracticeKind =
  | 'fill-in'        // 빈칸 채우기 (동사 고르기)
  | 'pattern-choice' // 동사/패턴 고르기 (패턴 인식)
  | 'sort-transitivity'; // 자·타동사 분류 (Day 1 전용)

/** 한 문제 */
export interface PracticeQuestion {
  kind: PracticeKind;
  groupId: string;
  exampleIdx: number;
  /** 문제 프롬프트 (한국어 문장 등) */
  prompt: string;
  /** 영어 원문 (정답 공개 시 보여줌) */
  fullEn: string;
  /** 정답 (빈칸에 들어갈 단어, 또는 패턴 이름) */
  answer: string;
  /** 선택지 (fill-in, pattern-choice만) */
  choices?: string[];
  /** 빈칸 위치 (fill-in만). 영어 문장 렌더링 시 이 index부터 answer.length만큼이 빈칸 */
  blankStart?: number;
  blankLength?: number;
}

/** 세션 설정 (시작 전 선택) */
export interface PracticeSessionConfig {
  day: number;
  kinds: PracticeKind[];  // 복수 선택 가능
  length: 5 | 10 | 'all' | 'difficult-only';
}

/** 세션 결과 (세션 종료 화면용, 영구 저장 X) */
export interface PracticeSessionResult {
  total: number;
  correct: number;
  wrong: PracticeQuestion[];  // 틀린 문제 목록
  newlyDifficult: string[];   // 이번 세션에 어려움 표시된 key들
}

/** localStorage 키 (AppState 하나로 합침) */
export const STORAGE_KEY = 'english-notebook-state';


// ============================================
// 상수 · 유틸
// ============================================

export const TOTAL_MONTHS = 10;
export const BEGINNER_MONTHS = 4;

export function getLevel(month: number): Level {
  return month <= BEGINNER_MONTHS ? 'beginner' : 'intermediate';
}

export function getLevelLabel(level: Level): string {
  return level === 'beginner' ? '초급' : '중급';
}

/** 특정 Day의 모든 그룹 가져오기 (dayTopic과 day 기준) */
export function getGroupsByDay(curriculum: CurriculumData, day: number): PatternGroup[] {
  return curriculum.groups.filter(g => g.day === day);
}

/** 특정 Day의 수업노트 그룹만 가져오기 */
export function getClassNotesByDay(curriculum: CurriculumData, day: number): PatternGroup[] {
  return curriculum.groups.filter(g => g.day === day && g.kind === 'class-note');
}

/** 특정 Day의 일반(예문 중심) 그룹만 가져오기 */
export function getRegularGroupsByDay(curriculum: CurriculumData, day: number): PatternGroup[] {
  return curriculum.groups.filter(g => g.day === day && g.kind !== 'class-note');
}

/** 모든 Day 번호 (오름차순) */
export function getAllDays(curriculum: CurriculumData): number[] {
  const days = new Set(curriculum.groups.map(g => g.day));
  return Array.from(days).sort((a, b) => a - b);
}


// ============================================
// 연습 모드 유틸 (v2.1)
// ============================================

/**
 * "자매 그룹" 찾기.
 * 빈칸 채우기·동사 고르기에서 선택지 생성용.
 *
 * 예: Day 3 "have" 그룹의 자매는 "get", "keep"
 *     Day 4 "try-N"의 자매는 "try-ing", "try-to-V"
 *     Day 2 "can-could-might"의 자매는 "will", "should" 등
 */
const SISTER_GROUPS: Record<string, string[]> = {
  // Day 3: HAVE · GET · KEEP
  'm2d3-have':  ['m2d3-get', 'm2d3-keep'],
  'm2d3-get':   ['m2d3-have', 'm2d3-keep'],
  'm2d3-keep':  ['m2d3-have', 'm2d3-get'],

  // Day 4: TRY 3형제
  'm2d4-try-N':    ['m2d4-try-ing', 'm2d4-try-to-V'],
  'm2d4-try-ing':  ['m2d4-try-N',   'm2d4-try-to-V'],
  'm2d4-try-to-V': ['m2d4-try-N',   'm2d4-try-ing'],

  // Day 2: 조동사 (will/should/would/could/might 상호 비교)
  'm2d2-will':             ['m2d2-should', 'm2d2-can-could-might', 'm2d2-haveto'],
  'm2d2-should':           ['m2d2-will',   'm2d2-haveto'],
  'm2d2-can-could-might':  ['m2d2-will',   'm2d2-should'],
  'm2d2-haveto':           ['m2d2-should', 'm2d2-will'],
};

export function getSisterGroupIds(groupId: string): string[] {
  return SISTER_GROUPS[groupId] ?? [];
}

/** 어려움 플래그 key 생성 */
export function difficultKey(groupId: string, exampleIdx: number): string {
  return `${groupId}:${exampleIdx}`;
}

/** 특정 예문이 어려움 표시됐는지 */
export function isDifficult(practice: PracticeState | undefined, groupId: string, exampleIdx: number): boolean {
  if (!practice) return false;
  return difficultKey(groupId, exampleIdx) in practice.difficultExamples;
}

/** 특정 Day에서 어려움 표시된 예문 개수 */
export function countDifficultInDay(practice: PracticeState | undefined, curriculum: CurriculumData, day: number): number {
  if (!practice) return 0;
  const dayGroupIds = new Set(curriculum.groups.filter(g => g.day === day).map(g => g.id));
  return Object.keys(practice.difficultExamples).filter(k => {
    const [gid] = k.split(':');
    return dayGroupIds.has(gid);
  }).length;
}
```

## 제거된 타입 (v1에서 있던 것들)

참고용. v2에서는 **쓰지 않음**:

- ❌ `REVIEW_INTERVALS` (망각곡선 간격)
- ❌ `GroupProgress` (복습 스테이지·카운트·북마크)
- ❌ `ReviewStatus` (Due/Upcoming/Done)
- ❌ `ExamCard`, `ExamState` (플래시카드)
- ❌ `monthTopics` (월별 주제 편집)
- ❌ `customGroups` (커스텀 그룹 직접 추가)

이 타입들이 코드 어딘가에 남아있다면 모두 삭제할 것.

---

## 데이터 예시 (curriculum-m2.json 발췌)

```json
{
  "month": 2,
  "level": "beginner",
  "topic": "Catch up · 구문 학습 집중달",
  "topicNote": "동사암기 · 조동사 · have/get/keep · take · try ...",
  "daySummaries": {
    "3": {
      "dayTitle": "HAVE · GET · KEEP",
      "headline": "상태를 뒤에 붙이는 3개 동사 — 태도가 다르다",
      "keyPoints": [
        "공통 구조: **S + [have/get/keep] + O + [상태]** (adv / adj / p+n / -ed / -ing)",
        "**HAVE** = 정적인 소유. 그 상태가 이미 확보되어 있음. `I have the door open` = 문이 열려있는 상태",
        "**GET** = 동작. 그 상태가 **되게 만듦**. `Get the door open` = 어떻게든 열리게 만들어",
        "**KEEP** = 유지·자제. 반대로 움직이려는 걸 막음. `Keep the door open` = 계속 열려있게 지켜",
        "`get the door open` ≠ `open the door` — get은 '어떻게든' 뉘앙스"
      ],
      "mustRemember": [
        "같은 'door open' 상태라도 → have(이미) / get(만듦) / keep(유지)",
        "소유 4동사: have(정적) · get(동적+put) · keep(지킴) · take(공격적)"
      ]
    }
  },
  "groups": [
    {
      "id": "m2d3-have",
      "day": 3,
      "dayTopic": "HAVE · GET · KEEP",
      "title": "HAVE",
      "pattern": "확보되어 있는 상태 — 정적인 소유",
      "meaning": "~한 상태로 가지고 있다 (상태 유지)",
      "examples": [
        { "en": "We have the tent up now.", "ko": "우린 텐트 다 세워놨어." },
        { "en": "I had 3 days off (work).", "ko": "나 3일 쉬었었어.", "note": "✏️ off (work) = 일에서 떨어져 있는 상태" }
      ]
    },
    {
      "id": "m2d3-possession-verbs-overview",
      "day": 3,
      "dayTopic": "HAVE · GET · KEEP",
      "title": "소유 4동사 개요",
      "kind": "class-note",
      "noteSource": "✏️ 개인 필기 (이미지 8, 10)",
      "notes": [
        "소유 4동사 비교:",
        "  • HAVE = 정적인 소유",
        "  • GET  = 동적인 소유 + put",
        "  • KEEP = 지켜내는 소유",
        "  • TAKE = 공격적 소유"
      ],
      "examples": []
    }
  ]
}
```

---

## 렌더링 가이드

### `daySummary.keyPoints`와 `mustRemember`의 마크다운
각 원소는 짧은 마크다운. 처리해야 할 것:

- `**텍스트**` → `<strong>` (굵게)
- `*텍스트*` → `<em>` (기울임)
- `` `코드` `` → `<code>` (고정폭 폰트, 옅은 배경)

**간단한 구현 예시 (정규식):**
```tsx
function renderInlineMarkdown(text: string): React.ReactNode {
  // **bold** → <strong>
  // `code` → <code>
  // *italic* → <em>
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return tokens.map((t, i) => {
    if (t.startsWith('**') && t.endsWith('**')) return <strong key={i}>{t.slice(2, -2)}</strong>;
    if (t.startsWith('`') && t.endsWith('`')) return <code key={i} className="...">{t.slice(1, -1)}</code>;
    if (t.startsWith('*') && t.endsWith('*')) return <em key={i}>{t.slice(1, -1)}</em>;
    return <span key={i}>{t}</span>;
  });
}
```

완전한 마크다운 파서는 과하니 이 정도로 충분. `react-markdown` 같은 라이브러리 **사용하지 말 것** (번들 크기 낭비).

### `group.notes` 렌더링
각 원소가 한 줄. 빈 문자열이면 여백 처리. 들여쓰기(`  • `)는 그대로 표시 (pre-wrap 또는 monospace 폰트 고려).

```tsx
<div className="whitespace-pre-wrap font-sans">
  {group.notes.join('\n')}
</div>
```

들여쓰기 잘 보이게 하려면:
```tsx
{group.notes.map((line, i) =>
  line === '' ? <div key={i} className="h-2" /> :
  <div key={i} className="whitespace-pre">{line}</div>
)}
```

---

## 주의사항

- **`kind: 'class-note'`인 그룹은 예문이 없을 수 있다.** UI에서 분기 처리 필수. Day 페이지에서는 이 그룹들을 **따로 모아서 상단 수업노트 박스로** 렌더링하는 것이 맞음.
- **`noteSource`는 표시용 텍스트**. 링크나 구조화된 값 아님.
- **`example.note`와 `group.notes`는 다른 것**. 전자는 예문 한 줄 주석, 후자는 그룹 전체 필기.
- **ID 형식**: `m{month}d{day}-{topic-slug}`. 월/일로 정렬 쉽게 가능.
