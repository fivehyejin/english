# Cursor 프롬프트: English Learning Notebook 구현

Cursor Agent 모드에 통째로 붙여넣고 실행하세요. Composer 모드면 다음 파일들을 @-mention으로 걸어주세요:
- `README.md` (제품 기획)
- `DESIGN_GUIDE.md` (디자인 가이드 — **특히 중요**)
- `DATA_SCHEMA.md` (TypeScript 타입)
- `CHANGELOG.md` (이전 버전에서 바뀐 점 — **꼭 먼저 읽을 것**)
- `curriculum-m2.json` (학습 데이터, Month 2 · Day 1~6)

---

## 프롬프트 시작

### ⚠️ 먼저 읽어줘

`CHANGELOG.md`를 먼저 읽어줘. 이 프로젝트는 "영어 복습 관리 앱"에서 **"영어 학습 정리 노트"**로 전면 재설계됐어. 이전 버전(v1)에 있던 복습 체크, 망각곡선, 북마크, 플래시카드, Exam Mode 같은 건 **전부 제거**됐어.

현재(v2.2) 버전 핵심:
- 홈 = Day 목차 (+ `[🎯 전체 연습]` 버튼)
- Day 페이지 = 스크롤 한 번에 다 보이는 "노트 한 페이지" (+ `[📝 연습 모드]` 버튼)
- 각 Day 상단에 "이 날의 핵심" 요약 박스
- 수업노트는 별도 강조 박스로
- Day별 연습(v2.1)과 전체 연습(v2.2) 두 가지 훈련 모드

### 스택 (필수)

- **Next.js 14+** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Pretendard Variable** 폰트
- **lucide-react** 아이콘
- **sonner** 토스트 (음성 재생 실패 알림 정도만)
- **next-themes** 라이트/다크 모드
- **localStorage** (최소한 — lastViewedDay, theme, practice.difficultExamples만)
- 배포: Vercel

### 초기 세팅

```bash
pnpm create next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
pnpm dlx shadcn@latest init
# 답변: Style=New York, Base=Slate, CSS variables=Yes

pnpm dlx shadcn@latest add button sonner
pnpm add next-themes lucide-react recharts
```

**shadcn은 Button과 Sonner만 추가해.** Dialog, Tabs, Collapsible, Select, Badge 같은 건 이 제품엔 필요 없어.

**recharts는 Phase 6 대시보드용.** Phase 1~5만 작업하면 설치 안 해도 됨. Phase 6 시작할 때 설치해도 OK.

### 컬러 & 폰트 적용

`DESIGN_GUIDE.md`의 **2. 컬러 팔레트** 섹션 CSS를 `app/globals.css`의 `@layer base`에 그대로 붙여넣어. 라이트·다크 모두.

`app/globals.css` 최상단에 Pretendard:
```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css');
```

`tailwind.config.ts`:
```ts
extend: {
  fontFamily: {
    sans: ['"Pretendard Variable"', 'Pretendard', 'system-ui', 'sans-serif'],
  },
}
```

### 라우팅 구조

```
app/
├── layout.tsx                    # 최상위 레이아웃, ThemeProvider, Toaster, Header
├── page.tsx                      # 홈 (Day 목차)
├── day/[day]/page.tsx            # Day 상세
├── day/[day]/practice/page.tsx   # Day별 연습 (Phase 4)
├── practice/page.tsx             # 전체 연습 시작 (Phase 5, v2.2)
├── practice/session/page.tsx     # 전체 연습 진행 (Phase 5)
├── practice/result/page.tsx      # 전체 연습 결과 (Phase 5)
└── globals.css                   # Pretendard + shadcn 변수 + 팔레트 오버라이드
```

### 폴더 구조

```
app/
├── layout.tsx
├── page.tsx                      # 홈
├── day/[day]/page.tsx            # Day 상세
├── day/[day]/practice/page.tsx   # Day별 연습
├── practice/
│   ├── page.tsx                  # 전체 연습 시작
│   ├── session/page.tsx          # 전체 연습 진행
│   └── result/page.tsx           # 전체 연습 결과
└── globals.css

components/
├── ui/                           # shadcn 생성 파일 (수정 X)
├── Header.tsx                    # 앱 헤더 (브랜드 + 테마 토글)
├── ThemeToggle.tsx
├── DayCard.tsx                   # 홈의 Day 카드
├── KeyIdeaBox.tsx                # "💡 이 날의 핵심" 박스
├── ClassNoteBox.tsx              # "✏️ 수업노트" 박스
├── GroupSection.tsx              # 일반 그룹 섹션 (예문 중심)
├── ExampleRow.tsx                # 예문 한 줄
├── DayNav.tsx                    # Day 하단 ← 이전 / 다음 →
├── InlineMarkdown.tsx            # keyPoints의 **굵게**/`코드`/*기울임* 처리
└── practice/
    ├── KindCard.tsx              # 유형 선택 체크박스 카드 (Day별·전체 공유)
    ├── ScopePicker.tsx           # 범위 선택 (전체 연습 전용)
    ├── LengthPicker.tsx          # 길이 선택 (5/10/20)
    ├── DifficultBanner.tsx       # "어려움 N개" 배너
    ├── QuestionFillIn.tsx        # fill-in (Day별)
    ├── QuestionPatternChoice.tsx # pattern-choice (Day별)
    ├── QuestionSort.tsx          # sort-transitivity (Day별, Day 1)
    ├── QuestionCollocation.tsx   # collocation (v2.2)
    ├── QuestionMinimalPairs.tsx  # minimal-pairs (v2.2)
    └── QuestionComposition.tsx   # composition (v2.2, 타이핑)

lib/
├── speech.ts                     # Web Speech API 래퍼
├── storage.ts                    # localStorage 최소 래퍼
├── practice.ts                   # Day별 연습 문제 생성기 (Phase 4)
├── practice-global.ts            # 전체 연습 문제 생성기 (Phase 5)
└── grading.ts                    # 작문 채점 (v2.2, DATA_SCHEMA에서 복사)

hooks/
├── useLastViewedDay.ts
├── useDifficultExamples.ts
└── usePracticeState.ts

curriculum-m2.json                # 루트 (lib/curriculum.ts에서 import)
types.ts                          # DATA_SCHEMA.md의 타입 그대로
```

### 핵심 구현 요구사항

#### 1. 데이터 로딩

`curriculum-m2.json`을 프로젝트 루트에 두고 TypeScript로 import. `types.ts`는 `DATA_SCHEMA.md` 내용 그대로 복사.

나중에 `curriculum-m3.json` 추가 가능하게 배열로 합치는 구조로:

```ts
// lib/curriculum.ts
import m2 from '@/curriculum-m2.json';
import type { CurriculumData } from '@/types';

export const CURRICULA: CurriculumData[] = [m2 as CurriculumData];

// 지금은 Month 2만 있음
export const CURRENT_CURRICULUM = CURRICULA[0];
```

#### 2. 홈 화면 (`app/page.tsx`)

최상단:
- Month 정보 (topic, topicNote) — 큰 타이틀
- "📍 최근 학습: Day N" 뱃지 (lastViewedDay가 있으면)
- **`[🎯 전체 연습]` 버튼** (Phase 5에서 추가, 뱃지 옆 secondary 톤)

Day 목록:
- Day 번호 내림차순 (최신 Day가 위)
- 각 Day는 `DayCard` 컴포넌트 (`DESIGN_GUIDE.md` 5.1 참고)
  - Day 번호, 주제 (`daySummaries[day].dayTitle`)
  - `💡 {headline}`
  - 그룹 수, 예문 수, 수업노트 수

모바일 1열, 태블릿+ 2열 그리드 (선택):
```tsx
<div className="grid gap-4 md:grid-cols-2">
  {days.map(day => <DayCard key={day} day={day} />)}
</div>
```

**단, 한 열 (세로 스택)이 노트 컨셉에 더 맞을 수 있음**. 고민해보고 더 자연스러운 쪽으로.

#### 3. Day 상세 (`app/day/[day]/page.tsx`)

`params.day`로 Day 번호 받음. 페이지 mount 시 `lastViewedDay`를 localStorage에 기록.

페이지 구조 (위→아래 순서):

```tsx
<article className="max-w-3xl mx-auto">
  {/* 1. 목차로 돌아가기 */}
  <Link href="/">← 목차로</Link>

  {/* 2. Day 번호 + 큰 제목 + [📝 연습 모드] 버튼 */}
  <div className="flex items-start justify-between">
    <div>
      <h1>DAY {day}</h1>
      <h2>{daySummary.dayTitle}</h2>
    </div>
    <Link href={`/day/${day}/practice`}>📝 연습 모드</Link>
  </div>

  {/* 3. 이 날의 핵심 박스 */}
  <KeyIdeaBox summary={daySummary} />

  {/* 4. 수업노트 박스들 (kind='class-note' 그룹들) */}
  {classNotes.map(g => <ClassNoteBox key={g.id} group={g} />)}

  {/* 5. 일반 그룹 섹션들 (kind !== 'class-note') */}
  {regularGroups.map(g => <GroupSection key={g.id} group={g} />)}

  {/* 6. 이전/다음 Day 네비 */}
  <DayNav prev={prevDay} next={nextDay} />
</article>
```

Day 번호가 데이터에 없으면 404 (`notFound()`).

#### 4. 각 컴포넌트 구현

**`KeyIdeaBox`** — `DESIGN_GUIDE.md` 5.2 참고. `headline`, `keyPoints`, `mustRemember` 세 부분. keyPoints는 마크다운 강조 처리 필요 → `InlineMarkdown` 컴포넌트 사용.

**`ClassNoteBox`** — `DESIGN_GUIDE.md` 5.3 참고. 옅은 네이비 배경, 좌측 네이비 세로선, `noteSource`를 라벨처럼 상단에.

**`GroupSection`** — `DESIGN_GUIDE.md` 5.4 참고. 그룹 헤더(좌측 네이비 두꺼운 세로선) + 그룹 필기 박스(있으면) + 예문 리스트. 접기/펼치기 없음 — 항상 다 보임.

**`ExampleRow`** — 예문 영어(굵게)/한국어(muted)/필기(있으면 옅은 박스) + 🔊 버튼. 모바일은 세로, 데스크탑은 예문 1fr + 🔊 auto. v2.1 이후 어려움 플래그 찍힌 예문엔 왼쪽에 조용한 점(`DESIGN_GUIDE.md` 5.11).

**`InlineMarkdown`** — `**굵게**`, `` `코드` ``, `*기울임*` 세 가지만 처리. `DATA_SCHEMA.md`의 샘플 구현 참고. `react-markdown` 같은 라이브러리는 **절대 쓰지 말 것** (오버킬).

#### 5. 음성 재생 (`lib/speech.ts`)

```ts
export function speak(text: string, lang = 'en-US'): void {
  if (typeof window === 'undefined') return;
  if (!('speechSynthesis' in window)) {
    // sonner toast로 알림
    return;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

export function speakSequence(texts: string[], lang = 'en-US'): void {
  if (typeof window === 'undefined') return;
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  
  let i = 0;
  const playNext = () => {
    if (i >= texts.length) return;
    const u = new SpeechSynthesisUtterance(texts[i]);
    u.lang = lang;
    u.rate = 0.9;
    u.onend = () => { i++; playNext(); };
    window.speechSynthesis.speak(u);
  };
  playNext();
}
```

그룹 섹션 헤더의 🔊은 `speakSequence(group.examples.slice(0, 3).map(e => e.en))`.

#### 6. localStorage (`lib/storage.ts`, `hooks/*.ts`)

**최소한**만. 복잡한 useAppState 훅 만들지 말 것.

```ts
// lib/storage.ts
const KEY = 'english-notebook-state';
type State = {
  lastViewedDay?: { month: number; day: number };
  practice?: { difficultExamples: Record<string, DifficultFlag> };
};

export function getState(): State {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch { return {}; }
}

export function setLastViewedDay(month: number, day: number) {
  if (typeof window === 'undefined') return;
  try {
    const state = getState();
    state.lastViewedDay = { month, day };
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

export function addDifficult(key: string, flag: DifficultFlag) { /* ... */ }
export function removeDifficult(key: string) { /* ... */ }
```

Day 페이지 mount 시 `setLastViewedDay(curriculum.month, day)` 호출.
홈에서는 `useLastViewedDay` 훅으로 읽고 "📍 최근 학습" 뱃지에 사용.

#### 7. 다크모드

`DESIGN_GUIDE.md` 8번 섹션 그대로.

### 반응형

- **모바일 우선** (375px에서 완벽해야)
- Day 페이지 본문은 `max-w-3xl mx-auto` (태블릿+에서 넓어지지 않게)
- 예문 영어/한국어:
  - 모바일: 세로 스택 (`flex flex-col` 또는 `grid grid-cols-1`)
  - 데스크탑: 필요하면 `md:grid-cols-[1fr_auto]` 정도. 굳이 2열 나란히 할 필요는 없음

### 🚫 하지 말 것

1. **복습 관련 UI·로직 전부 금지** — CHANGELOG의 "제거된 기능" 목록 참고
2. v1 HTML 프로토타입이 있었다면 UI를 그대로 옮기지 말 것 (구조가 다름)
3. `react-markdown`, `framer-motion` 같은 라이브러리 추가 금지
4. 카드 펼침/접기 기능 만들지 말 것 (Day 페이지는 **항상 다 펼쳐진 상태**)
5. 탭 네비게이션 쓰지 말 것 (홈 ↔ Day ↔ /practice 라우팅만)
6. 진도율, % 표시, 체크박스, 뱃지(Due/Mastered) 만들지 말 것

### ✅ 완료 기준

**Phase 1~2 (MVP 노트 기능)**
- [ ] `pnpm dev`로 로컬 실행
- [ ] 홈 (/)에서 Day 1~5가 카드로 보임, 각 카드에 headline 노출
- [ ] Day 카드 클릭 → `/day/{n}` 이동, 그 Day의 모든 예문 + 수업노트가 스크롤로 보임
- [ ] "💡 이 날의 핵심" 박스가 Day 상단에 있고 headline + keyPoints + mustRemember 렌더링
- [ ] `kind: 'class-note'` 그룹은 수업노트 박스로, 일반 그룹은 `GroupSection`으로 분리 렌더링
- [ ] 예문별 필기(`example.note`)는 예문 아래 옅은 박스로
- [ ] 🔊 버튼 클릭 시 영어 발음 재생 (크롬·사파리·iOS Safari)
- [ ] 이전/다음 Day 네비 동작
- [ ] 모바일 375px에서 레이아웃 OK
- [ ] 라이트·다크 모드 모두 가독성 OK
- [ ] Pretendard 폰트 확인 (한영 모두)
- [ ] Navy/Silver/Red 팔레트 사용 확인
- [ ] "📍 최근 학습" 뱃지가 마지막 방문 Day에 표시
- [ ] `pnpm build` 에러 없음

**Phase 4 (Day별 연습 모드, v2.1)**
- [ ] Day 페이지 상단에 `[📝 연습 모드]` 버튼 보임
- [ ] `/day/[day]/practice` 진입 시 유형 + 길이 선택 화면
- [ ] 빈칸 채우기: 그룹 동사가 빈칸 처리되고 자매 그룹 동사들이 선택지로
- [ ] 동사 고르기: 한국어 보고 어떤 패턴인지 먼저 선택
- [ ] 자·타동사 분류: Day 1에서만 제공
- [ ] 정답 시 초록, 오답 시 빨강 피드백 + 🔊 자동 재생
- [ ] 세션 종료 시 정답률 + 틀린 예문 리스트
- [ ] 어려움 표시된 예문이 Day 노트에 작은 회색 점으로 표시
- [ ] 점 클릭 시 수동 해제 가능
- [ ] "어려움 표시된 것만 풀기" 모드 동작
- [ ] 맞추면 어려움 플래그 자동 제거, 틀리면 유지/추가
- [ ] 홈 페이지엔 연습 모드 흔적 없음 (노트 컨셉 유지)

**Phase 5 (전체 연습 모드, v2.2)**
- [ ] 홈 상단 "📍 최근 학습" 뱃지 라인에 `[🎯 전체 연습]` 버튼 렌더 (secondary 톤, 카운트 없음)
- [ ] `/practice` 진입 시 범위(전체/D1-3/D4-5) + 유형(복수) + 길이(5/10/20) 선택 가능
- [ ] 각 유형 카드에 해당 scope의 문제 수 표시, 0이면 disabled
- [ ] 어려움 배너는 `countAllDifficult() > 0`일 때만 노출
- [ ] **collocation** 세 서브 유형 모두 출제: `fill-preposition`, `fill-verb-and-prep`, `detect-transitivity-error`
- [ ] collocation 정답 후 `groupPattern` 힌트 + `fullEn` 원문 표시
- [ ] **minimal-pairs**: have/get/keep/take 4지선다 크로스-Day 출제 동작
- [ ] minimal-pairs: try 3형제, 조동사, too/enough 묶음도 동작
- [ ] minimal-pairs 정답 후 정답 그룹 의미 + 오답 그룹 간단 설명 표시
- [ ] **composition**: 타이핑 → 제출 → 자동 판정 배지(exact/reorder/partial/mismatch) 표시
- [ ] composition: 제출 즉시 🔊 자동 재생
- [ ] composition: `[✓ 맞다고]` `[✗ 다시]` 둘 중 하나 눌러야 다음으로 진행 (자동 진행 금지)
- [ ] 모든 유형에서 오답/✗ 시 어려움 플래그 추가, 정답/✓ 시 제거
- [ ] Day 연습에서 찍은 어려움이 `/practice` 배너에 반영됨 (저장소 공유 확인)
- [ ] `/practice/result` 정답률 + 틀린 문제 리스트 표시
- [ ] 모바일 375px에서 레이아웃 OK
- [ ] 라이트/다크 양쪽 가독성 OK
- [ ] `pnpm build` 에러 없음

**Phase 6 (오답 재풀이 · 대시보드, v3)**
- [ ] 세션 종료 시 `sessionHistory`에 기록 자동 저장 (모든 유형: Day별·전체·오답 보관함)
- [ ] 세션 시작 화면에 `[□ 세션 끝에 틀린 거 다시 풀기]` 체크박스 (기본 ON)
- [ ] 정규 문제 종료 후 틀린 문제가 있으면 "재풀이 · X / Y" 헤더와 함께 자동 추가 출제
- [ ] 재풀이에서 맞추면 오답 보관함에서 제거, 틀리면 유지 + wrongCount 증가
- [ ] 재풀이 결과는 원 세션 정답률에 반영 X (별도 집계)
- [ ] 홈 상단에 `[📊 대시보드]` 버튼 (secondary 톤)
- [ ] 홈 상단에 `[📝 오답 보관함 (N)]` 버튼 — `countWrongBank() > 0`일 때만
- [ ] `/practice/wrong` 진입 시 정렬(최근/자주/Day순) + 길이 선택 화면
- [ ] 오답 보관함 빈 상태 UI ("오답이 없어요. 깔끔해요.")
- [ ] `/dashboard` 진입 시 세션 있으면 4개 섹션 (요약/추이/Day별/유형별/Top 5) 모두 렌더
- [ ] 세션 없을 때 빈 상태 메시지 ("아직 푼 세션이 없어요")
- [ ] 회차별 추이 LineChart 렌더, `isAnimationActive={false}`
- [ ] Day별/유형별 커스텀 막대 렌더 (가로 bar + 퍼센트 + 분자/분모)
- [ ] 가장 약한 Day/유형에 "← 약함" 텍스트 표시 (accent 색)
- [ ] Top 5 리스트 렌더 + "Top 5 바로 풀기" 버튼 동작
- [ ] 대시보드 차트 색은 Navy/Silver, 그라데이션·그림자 없음
- [ ] 세션 히스토리 100회 초과 시 자동 FIFO 삭제 확인
- [ ] 세션 결과 화면에 [📊 대시보드] 버튼 추가
- [ ] `pnpm build` 에러 없음

### 개발 순서 권장

**Phase 1 (구조)**
1. 프로젝트 셋업 + shadcn init + Pretendard + 팔레트 적용
2. `types.ts` + `curriculum-m2.json` 연결
3. `lib/curriculum.ts` 헬퍼 (getRegularGroupsByDay 등)
4. 홈 페이지 (Day 카드 리스트, lastViewedDay 없이)
5. Day 페이지 (KeyIdeaBox + ClassNoteBox + GroupSection)
6. 다크모드 토글

**Phase 2 (기능 추가)**
7. 음성 재생 (예문별 + 그룹 전체 3개)
8. lastViewedDay 저장 + 홈 뱃지
9. 이전/다음 Day 네비
10. 반응형 폴리시 (모바일 375px 체크)
11. 라이트·다크 양쪽 폴리시

**Phase 4 (Day별 연습 모드) — Phase 1·2 끝난 후**

연습 모드는 **Day 노트 페이지 자체는 건드리지 않고** 새 라우트에 붙이는 기능.
구현 순서:

12. Day 페이지 상단에 `[📝 연습 모드]` 버튼 추가 (`DESIGN_GUIDE.md` 5.7)
13. `/day/[day]/practice` 라우트 생성
14. `lib/practice.ts` — 문제 생성기 만들기:
    - `generateFillInQuestions(group, sisterGroups)`: 그룹의 각 예문에서 해당 그룹의 동사를 찾아 빈칸 만들고, 자매 그룹에서 오답 선택지 생성
    - `generatePatternChoiceQuestions(day)`: Day 내 그룹들의 title을 선택지로
    - `generateSortQuestions(group)`: Day 1 자·타동사 그룹만 대상
15. 세션 시작 화면 (`DESIGN_GUIDE.md` 5.8)
16. 세션 진행 화면 (`DESIGN_GUIDE.md` 5.9)
17. 세션 종료 화면 (`DESIGN_GUIDE.md` 5.10)
18. 어려움 플래그:
    - `usePracticeState` 훅에 `markDifficult(groupId, idx)`, `unmarkDifficult(...)` 추가
    - `PracticeState.difficultExamples`에 저장
    - 맞추면 자동 제거, 틀리면 유지/추가
19. Day 노트 페이지의 ExampleRow에 어려움 점 표시 (`DESIGN_GUIDE.md` 5.11)
20. 어려움 카운트 홈에 노출? **X 노출하지 말 것**. 홈은 노트 컨셉 유지.

**Phase 5 (전체 연습 모드, v2.2) — Phase 4 끝난 후 별도 요청으로 진행 권장**

Phase 4는 Day 내부 전용. Phase 5는 홈에서 진입하는 크로스-Day 훈련장. 두 기능이 공유하는 건:
- `PracticeState.difficultExamples` (어려움 플래그)
- `speak` 등 음성 재생 함수
- 세션 진행/결과 화면 UI 패턴

구현 순서:

21. `types.ts`에 v2.2 타입 추가 (`PracticeKind` 3개 리터럴, `CompositionVerdict`, `PracticeScope`, `GlobalPracticeConfig` 등)
22. `lib/grading.ts`에 `normalizeForGrading`, `gradeComposition` 추가 + 간단 테스트
23. `lib/practice-global.ts`에 `extractCollocation`, `CROSS_DAY_SISTERS`, `INTRANSITIVE_PREP_RULES` 복사 + `buildCompositionQuestions`부터 구현 (가장 쉬움)
24. `/practice/page.tsx` 시작 화면 + `ScopePicker` / `KindCard` / `LengthPicker` / `DifficultBanner` (`DESIGN_GUIDE.md` 5.13)
25. `QuestionComposition.tsx` 컴포넌트 + `/practice/session` 뼈대 (`DESIGN_GUIDE.md` 5.15)
26. `/practice/result` 결과 화면 (`DESIGN_GUIDE.md` 5.10 재사용, 제목만 "연습 완료!")
27. `buildMinimalPairsQuestions` + `QuestionMinimalPairs.tsx` (`DESIGN_GUIDE.md` 5.16)
28. `buildCollocationQuestions` + `QuestionCollocation.tsx` (서브 유형 3개, `DESIGN_GUIDE.md` 5.14)
29. `buildDifficultOnlyQuestions` + 어려움 배너 동작 연결
30. 홈 페이지에 `[🎯 전체 연습]` 버튼 추가 (`DESIGN_GUIDE.md` 5.12)
31. 반응형 폴리시, 다크모드 확인, 빌드

**Phase 6 (오답 재풀이 · 대시보드, v3) — Phase 5 끝난 후 별도 진행**

핵심: 세션을 기록하고, 기록을 바탕으로 대시보드 + 오답 보관함을 보여주는 것.
기존 Phase 4·5 코드는 **최소한만 건드림** — 세션 종료 지점에 `appendSessionHistory()` 호출 1줄 추가하는 수준.

구현 순서:

32. `pnpm add recharts` (대시보드 차트용)
33. `types.ts`에 `SessionRecord`, `WrongEntry` 추가, `PracticeState`에 `sessionHistory`, `wrongBank` 필드 추가
34. `lib/storage.ts`에 세션 기록/오답 보관함 헬퍼:
    - `addSessionRecord(record: SessionRecord)` — FIFO 100개 유지
    - `addToWrongBank(key)` / `removeFromWrongBank(key)`
    - 읽기 함수: `getSessionHistory()`, `getWrongBank()`
35. **세션 종료 지점에 자동 기록** (Phase 4, 5 공통):
    - 세션 진행 컴포넌트에서 `onSessionEnd`에 `addSessionRecord(…)` 호출
    - 틀린 문제들은 `addToWrongBank(key)` 호출
    - 맞춘 문제는 기존 `difficultExamples`에서 제거하면서 `removeFromWrongBank(key)`도 함께
36. **세션 중 자동 재풀이**:
    - 세션 시작 화면에 `[□ 세션 끝에 틀린 거 다시 풀기]` 체크박스 (기본 ON)
    - 세션 진행 컴포넌트 상태에 `phase: 'main' | 'retry'` 추가
    - main 끝에서 틀린 문제들을 모아 `phase: 'retry'`로 전환
    - retry 상단에 구분 헤더 (`DESIGN_GUIDE.md` 5.18)
    - retry에서 정답률은 원 세션과 별도 기록
37. **오답 보관함 라우트** `/practice/wrong`:
    - 시작 화면 (`DESIGN_GUIDE.md` 5.19) — 정렬(최근/자주/Day순) + 길이
    - 세션 진행은 기존 세션 화면 재사용 (`source: 'wrong-bank'`)
    - 빈 상태 UI
38. **홈 버튼 추가**:
    - `[📊 대시보드]` — 항상 표시
    - `[📝 오답 보관함 (N)]` — `countWrongBank() > 0`일 때만, N은 개수
    - 3개 모두 secondary 톤 rounded-full 뱃지
39. **대시보드 페이지** `/dashboard` (`DESIGN_GUIDE.md` 5.20):
    - 빈 상태 체크 먼저 (`sessions === 0`)
    - 전체 요약 3개 카드 (`getOverallStats`)
    - 회차별 추이 LineChart (`getAccuracyTrend`, 최근 20회)
    - Day별 정답률 커스텀 막대 (`getAccuracyByDay`)
    - 유형별 정답률 커스텀 막대 (`getAccuracyByKind`)
    - 틀린 그룹 Top 5 + "바로 풀기" 버튼 (`getTopWrongGroups`)
40. 세션 결과 화면에 `[📊 대시보드]` 버튼 추가 (`DESIGN_GUIDE.md` 5.21)
41. 모든 recharts 차트 `isAnimationActive={false}`, 그림자·그라데이션 제거, Navy/Silver 팔레트 확인
42. `pnpm build` 에러 체크, 다크모드에서 차트 가독성 확인

### 연습 모드 구현 핵심 규칙

**문제 생성**
- Fill-in 빈칸은 **그룹 title 단어** 1개만 가림 (have / get / keep / try / could / will 등). 긴 단어구 가리지 말 것.
- 선택지는 `getSisterGroupIds(groupId)` (Day별) 또는 `getCrossDaySisters(groupId)` (전체) + 자기 자신 = 보통 3개. 너무 적으면 다른 자매에서 보충.
- 문제 풀에서 중복 예문 제거. 셔플.

**정답 피드백 (선택지 기반 유형)**
- 정답 클릭 → 초록 테두리 + `speak(q.fullEn)` 자동 실행 + 0.8초 후 다음 (자동)
- 오답 클릭 → 빨간 테두리 + 정답 초록 강조 + `speak` 자동 실행 + **수동으로 "다음" 클릭해야 진행**
- 둘 다 문제 아래에 원문 공개

**정답 피드백 (composition)**
- 제출 → 정답 전문 공개 + `speak(q.answer)` 자동 실행
- `[✓ 맞다고 치겠어]` / `[✗ 다시 보겠어]` 둘 중 하나 눌러야 진행 — **자동 진행 금지**
- 자동 판정(`gradeComposition`)은 참고 배지로만 표시. 사용자 버튼이 최종 판단

**어려움 플래그 자동 관리**
```ts
function handleAnswer(q: PracticeQuestion, wasCorrect: boolean, markedManually: boolean = false) {
  const key = difficultKey(q.groupId, q.exampleIdx);
  const wasFlagged = key in practice.difficultExamples;

  if (wasCorrect && !markedManually) {
    // 맞췄고 수동 표시 안 했으면 플래그 제거
    if (wasFlagged) removeDifficult(key);
  } else {
    // 틀렸거나 수동 표시하면 플래그 추가/유지
    addDifficult(key, {
      markedAt: wasFlagged ? practice.difficultExamples[key].markedAt : today(),
      sessionsStruggled: (practice.difficultExamples[key]?.sessionsStruggled ?? 0) + 1,
    });
  }
}
```

composition에서 `wasCorrect`는 **사용자 버튼 기준** (자동 판정 아님).

**"어려움만 풀기" 모드**
- 시작 화면의 `[어려움 표시된 것만 풀기]` 버튼 클릭
- `difficultExamples`의 key들을 기반으로 문제 pool 구성
- Day별 연습: 그 Day에 속한 어려움만
- 전체 연습: 전 Day 어려움. 유형은 그 예문이 속한 그룹 성격에 따라 자동 선택 (Day 1 + collocation 가능 → collocation, `CROSS_DAY_SISTERS` 있음 → minimal-pairs, 나머지 → composition)

### 🚫 연습 모드에서도 하지 말 것

Phase 1~3의 금지 사항 + 아래:

1. ~~누적 통계 저장 금지~~ → **v3에서 도입됨** (세션 기록, 대시보드). 단 저장 범위는 `SessionRecord` 스키마대로만.
2. **홈 페이지 수정 최소화** — 홈 상단 버튼 라인에 최대 3개까지 (전체 연습·대시보드·오답 보관함). 모두 secondary 톤 뱃지. **Day 카드 영역은 절대 변경 X**.
3. **성취 게이미피케이션 금지** — 경험치, 레벨, 뱃지, 축하 애니메이션, 종이 꽃가루 금지. **숫자·그래프는 OK**지만 "오늘 잘하셨어요!" 같은 문구·음성·진동 피드백은 금지. 대시보드는 조용한 톤.
4. **어려움 표시를 강조하지 말 것** — 노트의 점은 조용하게. 빨강 X, 배지 X, 숫자 카운터 X.
5. **외웠음/숙달 표시 금지** — "이 예문은 마스터" 같은 건 없음. 어려움 플래그와 오답 보관함의 **없음/있음** 두 상태만.
6. **작문 채점에 외부 API/LLM 호출 금지** — `gradeComposition` 단순 비교로만.
7. **작문의 사용자 판정 버튼을 자동 판정 결과로 대체 금지** — 자동 판정이 'exact'여도 `[✓ 맞다고]` 버튼은 반드시 사용자가 눌러야 함.
8. **유사 표현/첨삭 제안 UI 금지** — 작문 결과엔 정답 전문만. "비슷한 표현으로 xx도 가능합니다" 같은 거 붙이지 말 것.
9. **대시보드 차트에 애니메이션 금지** — recharts의 모든 차트에 `isAnimationActive={false}`. 그림자·그라데이션도 X.
10. **오답 보관함 자동 회수 금지** — 사용자가 `/practice/wrong`에 들어와서 직접 풀 때만. "오늘 풀 오답 5개가 있어요" 같은 알림 X.

막히면 부분 요청: "KeyIdeaBox만 보여줘", "홈 페이지만 먼저 짜줘". 한 번에 다 만들라고 하지 말 것.

### 데이터 추가 시 (미래)

Month 3부터 진도 나가면:
1. Claude에게 PDF/필기 사진 주고 `curriculum-m3.json` 요청 (같은 스키마)
2. `curriculum-mN.json`을 루트에 추가 → `lib/curriculum.ts`의 `CURRICULA` 배열에 추가
3. 홈에서 Month 선택 UI 추가 (Phase 3)
4. `CROSS_DAY_SISTERS`, `INTRANSITIVE_PREP_RULES`에 새 동사 등록 필요하면 추가

자, 시작해줘. CHANGELOG부터 읽고 진행할 것.

## 프롬프트 끝

---

## 참고: Cursor 사용 팁

1. 이 폴더를 Cursor로 열고 Agent 모드에서 위 프롬프트 실행
2. 컨텍스트 걸기: `@CHANGELOG.md @README.md @DESIGN_GUIDE.md @DATA_SCHEMA.md @curriculum-m2.json`
3. v1 HTML 프로토타입은 **굳이 컨텍스트에 걸지 말 것** (v1이라 혼란 야기 가능).
4. shadcn init 질문 답변:
   - Style: **New York**
   - Base color: **Slate**
   - CSS variables: **Yes**
5. 배포: Vercel + GitHub 연결 → push 자동 배포

## 자주 발생할 이슈

**"복습 체크 버튼 어디에 놓을까요?"**
→ 안 놓음. v2엔 복습 체크 없음. `CHANGELOG.md` 확인.

**"Badge 컴포넌트도 추가할까요?"**
→ 불필요. Due/Mastered 뱃지가 없으니 Badge도 필요 없음. 카드의 "최근 학습" 뱃지는 그냥 `<span>` + Tailwind로 해결.

**"그룹 카드 펼치기/접기 토글은?"**
→ **없음**. Day 페이지에선 모든 그룹이 항상 다 펼쳐져 있음. 이게 이 제품의 핵심 UX.

**"react-markdown 써도 되나요?"**
→ 안 됨. `InlineMarkdown` 컴포넌트를 직접 짜서 `**굵게**`, `` `코드` ``, `*기울임*` 세 가지만 처리.

**"Framer Motion으로 애니메이션 넣을까요?"**
→ 기본은 Tailwind `transition-colors` 정도로 충분. 과한 애니메이션 금지. 정리 노트 앱이라 조용한 톤이 맞음.

**"작문 채점에 OpenAI API 쓸까요?"**
→ 절대 안 됨. `gradeComposition` 단순 단어 비교로. 사용자가 최종 판정.

**"전체 연습 홈 버튼에 카운트 뱃지 붙일까요? (빨간 점 같은 거)"**
→ 안 됨. 조용한 secondary 톤 버튼 하나만. 노트 앱 컨셉 유지.

**"Day별 연습이랑 전체 연습이 어려움 플래그를 따로 저장해야 하나요?"**
→ 아니요. `PracticeState.difficultExamples` 하나를 공유. Day 연습에서 찍은 게 전체 연습에도 보이고, 그 반대도 됨.
