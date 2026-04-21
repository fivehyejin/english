# Design Guide

English Learning Notebook의 비주얼·인터랙션 가이드. Cursor가 코드 짤 때 이 문서만 보면 일관된 결과물이 나오도록 구체적으로 씀.

## 목차
1. [디자인 철학](#1-디자인-철학)
2. [컬러 팔레트](#2-컬러-팔레트)
3. [타이포그래피](#3-타이포그래피)
4. [스페이싱 & 레이아웃](#4-스페이싱--레이아웃)
5. [컴포넌트별 규격](#5-컴포넌트별-규격)
6. [shadcn/ui 사용 가이드](#6-shadcnui-사용-가이드)
7. [아이콘 & 이모지](#7-아이콘--이모지)
8. [다크모드](#8-다크모드)
9. [접근성](#9-접근성)

---

## 1. 디자인 철학

**"진지한 학습 노트"**

- 과장된 컬러 X, 장식 X, 그라데이션 X
- **여백**으로 정보 계층 만들기
- **타이포그래피 위계**로 강약 조절 (굵기, 크기, 색의 차이로)
- 모바일에서 "한 페이지 쭉 훑는 노트" 같은 리듬
- 에디토리얼한 느낌 (네이버 블로그 X, 뉴욕타임즈 ○)

### 레퍼런스 느낌
- Notion의 깔끔함
- Linear의 정보 밀도
- Readwise의 하이라이트/필기 표시 방식

---

## 2. 컬러 팔레트

**Navy(주) · Silver(중립) · Red(강조)**

### 라이트 모드

```css
@layer base {
  :root {
    /* shadcn base tokens */
    --background: 0 0% 100%;               /* #FFFFFF */
    --foreground: 220 40% 12%;             /* #121A2D  네이비-near-black */

    --card: 0 0% 100%;
    --card-foreground: 220 40% 12%;

    --popover: 0 0% 100%;
    --popover-foreground: 220 40% 12%;

    --muted: 220 14% 96%;                  /* #F1F3F7  실버-50 */
    --muted-foreground: 220 9% 46%;        /* #6B7280  실버-500 */

    --border: 220 13% 91%;                 /* #E1E5EB  실버-200 */
    --input: 220 13% 91%;

    --ring: 220 70% 40%;                   /* 포커스 링 네이비 */

    --primary: 220 60% 22%;                /* #1B2D5B  네이비 */
    --primary-foreground: 0 0% 100%;

    --secondary: 220 14% 93%;              /* #E8ECF2  실버 */
    --secondary-foreground: 220 40% 18%;

    --accent: 0 72% 51%;                   /* #DC2626  레드 */
    --accent-foreground: 0 0% 100%;

    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;

    --radius: 0.5rem;

    /* 커스텀 토큰 (shadcn 외 추가) */
    --note-bg: 220 30% 96%;                /* #EEF1F7  수업노트 배경 */
    --note-border: 220 30% 85%;            /* 수업노트 테두리 */
    --note-accent: 220 60% 35%;            /* 수업노트 좌측 세로선 */

    --highlight-bg: 0 72% 97%;             /* #FEF2F2  must-remember 배경 */
    --highlight-border: 0 72% 85%;
  }
}
```

### 다크 모드

```css
@layer base {
  .dark {
    --background: 220 30% 8%;              /* #0E131C */
    --foreground: 220 14% 95%;             /* #EEF0F3 */

    --card: 220 30% 11%;
    --card-foreground: 220 14% 95%;

    --popover: 220 30% 11%;
    --popover-foreground: 220 14% 95%;

    --muted: 220 25% 16%;
    --muted-foreground: 220 10% 65%;

    --border: 220 25% 20%;
    --input: 220 25% 20%;

    --ring: 220 60% 60%;

    --primary: 220 14% 95%;
    --primary-foreground: 220 40% 12%;

    --secondary: 220 25% 16%;
    --secondary-foreground: 220 14% 90%;

    --accent: 0 75% 58%;                   /* 다크에선 살짝 밝은 레드 */
    --accent-foreground: 0 0% 100%;

    --destructive: 0 75% 58%;
    --destructive-foreground: 0 0% 100%;

    --note-bg: 220 25% 15%;
    --note-border: 220 25% 25%;
    --note-accent: 220 60% 65%;

    --highlight-bg: 0 50% 18%;
    --highlight-border: 0 50% 35%;
  }
}
```

### 컬러 사용 규칙

**절대 규칙:**
- 네이비 = 주요 텍스트·버튼·브랜드. 전체 UI의 70%
- 실버 = 배경·구분선·부차 텍스트. 전체 UI의 25%
- 레드 = 강조·경고·액센트. 전체 UI의 **5% 이하만**. 아끼지 않으면 효과 없음.

**레드를 쓰는 곳 (이 목록 외에는 쓰지 말 것):**
1. Day 페이지의 "이 날의 핵심" 박스 좌측 세로선 (`border-l-4 border-l-accent`)
2. `mustRemember` 박스의 📌 아이콘
3. 홈의 "📍 최근 학습" 뱃지 텍스트 색
4. 다크모드 토글 호버
5. 에러 토스트 (sonner destructive)

**레드를 쓰지 말 것:**
- 본문 링크 색 (네이비 사용)
- Day 카드 배경
- 그룹 섹션 구분선
- 버튼 기본 색

---

## 3. 타이포그래피

### 폰트
**Pretendard Variable** (한영 통합, 단일 폰트)

`app/globals.css` 최상단:
```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css');
```

`tailwind.config.ts`:
```ts
extend: {
  fontFamily: {
    sans: ['"Pretendard Variable"', 'Pretendard', 'system-ui', 'sans-serif'],
  },
  fontFeatureSettings: {
    // 숫자 tabular 쓰고 싶으면 className="tabular-nums"
  },
}
```

`body`에 기본 적용:
```css
body { font-family: 'Pretendard Variable', Pretendard, system-ui, sans-serif; }
```

### 타이포 계층

| 용도 | Tailwind 클래스 | 크기 (desktop) | weight | 비고 |
|---|---|---|---|---|
| 브랜드 타이틀 ("English Notebook") | `text-2xl md:text-3xl font-bold tracking-tight` | 24-30px | 700 | 헤더에 있음 |
| Day 페이지 대제목 (Day 번호 + 주제) | `text-3xl md:text-4xl font-bold tracking-tight` | 30-36px | 700 | |
| "이 날의 핵심" 헤드라인 | `text-lg md:text-xl font-semibold leading-snug` | 18-20px | 600 | |
| 수업노트 박스 타이틀 | `text-sm font-semibold uppercase tracking-wide` | 14px | 600 | 라벨 느낌 |
| 그룹 섹션 타이틀 (e.g. HAVE) | `text-2xl font-bold tracking-tight` | 24px | 700 | 좌측에 두꺼운 막대 `border-l-4 border-l-primary` |
| 그룹 패턴 | `text-sm font-medium text-muted-foreground` | 14px | 500 | italic 아님, muted 색 |
| 그룹 의미 한 줄 | `text-base font-normal text-muted-foreground` | 16px | 400 | |
| 예문 영어 | `text-base md:text-lg font-semibold` | 16-18px | 600 | **가장 중요한 정보, 굵게** |
| 예문 한국어 | `text-sm md:text-base text-muted-foreground` | 14-16px | 400 | |
| 예문 필기 (`example.note`) | `text-xs md:text-sm text-muted-foreground` | 12-14px | 400 | 옅은 배경 박스 안 |
| 그룹 필기 (`group.notes`) | `text-sm leading-relaxed font-normal` | 14px | 400 | 수업노트 박스 안 |
| 키포인트 불릿 | `text-sm md:text-base leading-relaxed` | 14-16px | 400 | `**굵게**` 처리 필수 |
| 라벨·메타 (개수, Day 번호) | `text-xs font-medium tracking-wide uppercase text-muted-foreground` | 12px | 500 | |

### 줄간격
- 본문(예문, 필기): `leading-relaxed` (1.625)
- 헤드라인: `leading-snug` (1.375) 또는 `leading-tight` (1.25)
- 긴 설명 (키포인트): `leading-relaxed`

### 자간
- 제목: `tracking-tight` (-0.025em)
- 라벨·uppercase: `tracking-wide` (0.025em)
- 본문: 기본

### 숫자 표시
Day 번호, 예문 개수, 그룹 개수 등은 `tabular-nums` 클래스 붙이기:
```tsx
<span className="tabular-nums">Day {day}</span>
<span className="tabular-nums">{count} 예문</span>
```

---

## 4. 스페이싱 & 레이아웃

### 컨테이너

```tsx
// 최상위 레이아웃 (app/layout.tsx 내부)
<main className="min-h-screen bg-background">
  <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10">
    {children}
  </div>
</main>
```

### Day 페이지는 좁게

```tsx
// Day 상세는 노트처럼 읽기 편한 폭 유지
<article className="max-w-3xl mx-auto">
  {/* Day 내용 */}
</article>
```

### 섹션 간격
- 최상위 섹션 간: `space-y-10 md:space-y-14`
- 섹션 내 요소 간: `space-y-4 md:space-y-6`
- 예문 간: `space-y-3`
- 키포인트 불릿 간: `space-y-2`

### 박스 패딩
- 큰 박스 (이 날의 핵심, 수업노트): `p-5 md:p-6`
- 예문 행: `py-3` (가로는 패딩 없음, 그냥 flush)
- 그룹 섹션 전체: 패딩 없음, 구분은 헤더 마진으로

### 반응형 브레이크포인트
Tailwind 기본값 사용:
- `sm:` 640px
- `md:` 768px ← 주요 분기점
- `lg:` 1024px
- `xl:` 1280px

---

## 5. 컴포넌트별 규격

### 5.1 홈 화면 Day 카드

```tsx
<a
  href={`/day/${day}`}
  className="
    block rounded-lg border bg-card p-5 md:p-6
    transition-colors hover:border-primary/30 hover:bg-muted/30
    focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
  "
>
  {/* 상단 메타 라인 */}
  <div className="flex items-center gap-2 text-xs font-medium tracking-wide uppercase text-muted-foreground">
    <span className="tabular-nums">Day {day}</span>
    <span>·</span>
    <span>{dayTopic}</span>
    {isRecent && (
      <span className="ml-auto inline-flex items-center gap-1 text-accent">
        📍 최근 학습
      </span>
    )}
  </div>

  {/* 이 날의 핵심 headline */}
  <h2 className="mt-3 text-lg md:text-xl font-semibold leading-snug">
    💡 {summary.headline}
  </h2>

  {/* 하단 통계 */}
  <div className="mt-4 flex items-center gap-3 text-xs tabular-nums text-muted-foreground">
    <span>{groupCount} 그룹</span>
    <span>·</span>
    <span>{exampleCount} 예문</span>
    {classNoteCount > 0 && (
      <>
        <span>·</span>
        <span>✏️ 수업노트 {classNoteCount}</span>
      </>
    )}
  </div>
</a>
```

### 5.2 이 날의 핵심 박스

Day 페이지 상단. 컬러는 레드 액센트.

```tsx
<section
  className="
    relative rounded-lg border border-border bg-muted/30
    p-5 md:p-6
    border-l-4 border-l-accent
  "
>
  <h3 className="text-xs font-semibold uppercase tracking-wide text-accent">
    💡 이 날의 핵심
  </h3>

  <p className="mt-3 text-lg md:text-xl font-semibold leading-snug">
    {summary.headline}
  </p>

  <ul className="mt-5 space-y-2 text-sm md:text-base leading-relaxed">
    {summary.keyPoints.map((point, i) => (
      <li key={i} className="flex gap-2">
        <span className="text-muted-foreground select-none">•</span>
        <span>{renderInlineMarkdown(point)}</span>
      </li>
    ))}
  </ul>

  {/* mustRemember 있으면 */}
  {summary.mustRemember && summary.mustRemember.length > 0 && (
    <div
      className="
        mt-5 rounded-md border
        bg-[hsl(var(--highlight-bg))] border-[hsl(var(--highlight-border))]
        px-4 py-3
      "
    >
      <h4 className="text-xs font-semibold uppercase tracking-wide text-accent">
        📌 꼭 기억할 것
      </h4>
      <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
        {summary.mustRemember.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-accent select-none">→</span>
            <span>{renderInlineMarkdown(item)}</span>
          </li>
        ))}
      </ul>
    </div>
  )}
</section>
```

### 5.3 수업노트 박스

`kind === 'class-note'` 그룹을 감싸는 박스.

```tsx
<section
  className="
    rounded-lg border
    bg-[hsl(var(--note-bg))] border-[hsl(var(--note-border))]
    border-l-4 border-l-[hsl(var(--note-accent))]
    p-5 md:p-6
  "
>
  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
    <span>{group.noteSource /* e.g. "✏️ 수업노트 · 04/14" */}</span>
  </div>

  {group.title && (
    <h3 className="mt-2 text-lg font-semibold">
      {group.title}
    </h3>
  )}

  <div className="mt-4 text-sm leading-relaxed space-y-1">
    {group.notes?.map((line, i) =>
      line === '' ? (
        <div key={i} className="h-2" />
      ) : (
        <div key={i} className="whitespace-pre-wrap">{line}</div>
      )
    )}
  </div>
</section>
```

### 5.4 일반 그룹 섹션 (예문 중심)

```tsx
<section className="space-y-4">
  {/* 그룹 헤더 */}
  <header className="border-l-4 border-l-primary pl-4">
    <div className="flex items-baseline justify-between gap-3">
      <h3 className="text-2xl font-bold tracking-tight">
        {group.title}
      </h3>
      <Button size="sm" variant="ghost" onClick={playGroup} aria-label="그룹 전체 듣기">
        <Volume2 className="h-4 w-4" />
      </Button>
    </div>
    {group.pattern && (
      <p className="mt-1 text-sm font-medium text-muted-foreground">
        {group.pattern}
      </p>
    )}
    {group.meaning && (
      <p className="mt-1 text-base text-muted-foreground">
        {group.meaning}
      </p>
    )}
  </header>

  {/* 그룹 레벨 필기 (있으면) */}
  {group.notes && group.notes.length > 0 && (
    <div
      className="
        rounded-md border bg-[hsl(var(--note-bg))]
        border-l-4 border-l-[hsl(var(--note-accent))]
        px-4 py-3 text-sm leading-relaxed space-y-1
      "
    >
      {group.noteSource && (
        <div className="text-xs font-medium text-muted-foreground mb-2">
          {group.noteSource}
        </div>
      )}
      {group.notes.map((line, i) =>
        line === '' ? <div key={i} className="h-2" /> : <div key={i}>{line}</div>
      )}
    </div>
  )}

  {/* 예문 리스트 */}
  <ol className="space-y-3">
    {group.examples.map((ex, i) => (
      <li key={i} className="group">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-x-4 gap-y-1">
          <div className="min-w-0">
            <p className="text-base md:text-lg font-semibold break-words">
              {ex.en}
            </p>
            <p className="mt-0.5 text-sm md:text-base text-muted-foreground break-words">
              {ex.ko}
            </p>
            {ex.note && (
              <div
                className="
                  mt-2 inline-block max-w-full
                  rounded bg-[hsl(var(--note-bg))] border border-[hsl(var(--note-border))]
                  px-2 py-1 text-xs text-muted-foreground
                "
              >
                {ex.note}
              </div>
            )}
          </div>

          <div className="flex items-start">
            <Button size="icon" variant="ghost" onClick={() => speak(ex.en)} aria-label="영어 듣기">
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </li>
    ))}
  </ol>
</section>
```

### 5.5 헤더 & 네비

```tsx
<header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
  <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between">
    <a href="/" className="flex flex-col">
      <span className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
        English Notebook
      </span>
      <span className="text-base md:text-lg font-bold tracking-tight">
        {curriculum.topic}
      </span>
    </a>
    <ThemeToggle />
  </div>
</header>
```

Day 페이지에서는 "← 목차로" 링크 추가:

```tsx
<div className="mb-6">
  <Link
    href="/"
    className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
  >
    <ChevronLeft className="h-4 w-4" />
    목차로
  </Link>
</div>
```

### 5.6 이전/다음 Day 네비 (Day 페이지 하단)

```tsx
<nav className="mt-12 pt-6 border-t flex items-center justify-between gap-4">
  {prevDay ? (
    <Link
      href={`/day/${prevDay}`}
      className="flex flex-col text-left text-sm no-underline hover:text-primary transition-colors"
    >
      <span className="text-xs text-muted-foreground">← 이전</span>
      <span className="font-semibold">Day {prevDay}</span>
    </Link>
  ) : <span />}

  {nextDay ? (
    <Link
      href={`/day/${nextDay}`}
      className="flex flex-col text-right text-sm no-underline hover:text-primary transition-colors ml-auto"
    >
      <span className="text-xs text-muted-foreground">다음 →</span>
      <span className="font-semibold">Day {nextDay}</span>
    </Link>
  ) : <span />}
</nav>
```

### 5.7 연습 모드 진입 버튼 (Day 페이지 상단)

Day 헤더 영역, 제목 근처에 배치. 너무 튀지 않게 secondary 톤.

```tsx
<div className="mb-8 flex items-start justify-between gap-4">
  <div>
    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground tabular-nums">
      Day {day}
    </div>
    <h1 className="mt-1 text-3xl md:text-4xl font-bold tracking-tight">
      {daySummary.dayTitle}
    </h1>
  </div>
  <Link
    href={`/day/${day}/practice`}
    className="
      shrink-0 inline-flex items-center gap-2 rounded-md
      border border-border bg-secondary text-secondary-foreground
      px-3 py-2 text-sm font-medium
      hover:bg-secondary/80 transition-colors
    "
  >
    📝 연습 모드
  </Link>
</div>
```

### 5.8 연습 모드 시작 화면

`/day/[day]/practice` 기본 화면. 유형 + 길이 선택.

```tsx
<article className="max-w-xl mx-auto">
  {/* 상단 back */}
  <Link href={`/day/${day}`} className="text-sm text-muted-foreground hover:text-foreground">
    ← Day 노트로
  </Link>

  <h1 className="mt-6 text-2xl md:text-3xl font-bold tracking-tight">
    Day {day} · 연습 모드
  </h1>
  <p className="mt-2 text-sm text-muted-foreground">
    {daySummary.dayTitle}
  </p>

  {/* 최근 세션 상태 (있으면) */}
  {difficultCount > 0 && (
    <div className="
      mt-6 rounded-md border bg-[hsl(var(--highlight-bg))]
      border-l-4 border-l-accent
      px-4 py-3 text-sm
    ">
      어려움 표시된 예문 <strong className="tabular-nums">{difficultCount}개</strong>
      <button
        onClick={startDifficultOnly}
        className="block mt-2 text-accent font-medium hover:underline"
      >
        → 어려움 표시된 것만 풀기
      </button>
    </div>
  )}

  {/* 유형 선택 */}
  <section className="mt-8 space-y-4">
    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
      연습 유형 (여러 개 선택 가능)
    </h2>

    <label className="flex items-start gap-3 rounded-md border p-4 cursor-pointer hover:border-primary/30">
      <input type="checkbox" checked={...} className="mt-1" />
      <div className="flex-1">
        <div className="font-semibold">빈칸 채우기</div>
        <div className="text-sm text-muted-foreground mt-0.5">
          HAVE/GET/KEEP 같은 자매 동사 중 고르기 · 동사 구분 훈련
        </div>
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{fillInCount}문제</span>
    </label>

    {/* 동사 고르기 · 자타동사 분류도 같은 패턴 */}
  </section>

  {/* 길이 선택 */}
  <section className="mt-8 space-y-3">
    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
      세션 길이
    </h2>
    <div className="flex gap-2">
      {([5, 10, 'all'] as const).map(len => (
        <button
          key={len}
          onClick={() => setLength(len)}
          className={cn(
            'flex-1 rounded-md border px-4 py-3 text-sm font-medium transition-colors',
            length === len ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'
          )}
        >
          {len === 'all' ? '전체' : `${len}개`}
        </button>
      ))}
    </div>
  </section>

  <Button
    onClick={startSession}
    disabled={selectedKinds.length === 0}
    className="mt-8 w-full"
    size="lg"
  >
    연습 시작 →
  </Button>
</article>
```

### 5.9 연습 모드 진행 화면

한 문제씩. 카드 형태.

```tsx
<article className="max-w-xl mx-auto">
  {/* 진행률 */}
  <div className="flex items-center justify-between mb-6">
    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground tabular-nums">
      Day {day} · {kindLabel(q.kind)}
    </span>
    <span className="text-xs tabular-nums text-muted-foreground">
      {current + 1} / {total}
    </span>
  </div>

  {/* 프로그레스 바 */}
  <div className="h-1 bg-muted rounded-full overflow-hidden mb-8">
    <div
      className="h-full bg-primary transition-all"
      style={{ width: `${((current) / total) * 100}%` }}
    />
  </div>

  {/* 문제 카드 */}
  <div className="rounded-lg border bg-card p-6 md:p-8">
    {/* 한국어 프롬프트 */}
    <p className="text-lg md:text-xl leading-relaxed">
      "{q.prompt}"
    </p>

    {/* 빈칸 있는 영어 문장 (fill-in일 때) */}
    {q.kind === 'fill-in' && (
      <p className="mt-6 text-xl md:text-2xl font-semibold leading-relaxed">
        {renderSentenceWithBlank(q.fullEn, q.blankStart, q.blankLength, userChoice)}
      </p>
    )}

    {/* 선택지 */}
    {q.choices && (
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-2">
        {q.choices.map(choice => {
          const isCorrect = choice === q.answer;
          const isSelected = userChoice === choice;
          return (
            <button
              key={choice}
              disabled={revealed}
              onClick={() => selectChoice(choice)}
              className={cn(
                'rounded-md border py-3 px-4 font-semibold transition-colors',
                !revealed && 'hover:bg-muted',
                revealed && isCorrect && 'bg-green-50 dark:bg-green-950 border-green-500 text-green-900 dark:text-green-100',
                revealed && isSelected && !isCorrect && 'bg-red-50 dark:bg-red-950 border-destructive text-destructive',
                !revealed && isSelected && 'bg-muted border-primary',
              )}
            >
              {choice}
            </button>
          );
        })}
      </div>
    )}

    {/* 정답 공개 후 */}
    {revealed && (
      <div className="mt-6 space-y-3">
        <p className="text-base md:text-lg font-semibold">{q.fullEn}</p>
        <Button size="sm" variant="ghost" onClick={() => speak(q.fullEn)}>
          <Volume2 className="h-4 w-4 mr-1" /> 다시 듣기
        </Button>
      </div>
    )}
  </div>

  {/* 하단 액션 */}
  <div className="mt-6 flex items-center justify-between">
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={markedDifficult}
        onChange={toggleDifficult}
      />
      <span>어려움 표시</span>
    </label>

    {revealed && (
      <Button onClick={next}>
        {current + 1 === total ? '결과 보기' : '다음 →'}
      </Button>
    )}
  </div>
</article>
```

### 5.10 연습 모드 종료 화면

```tsx
<article className="max-w-xl mx-auto text-center">
  <h1 className="text-3xl font-bold tracking-tight">
    Day {day} · 연습 완료
  </h1>

  <div className="mt-8 rounded-lg border bg-card p-8">
    <div className="text-6xl font-bold tabular-nums">
      {result.correct} <span className="text-muted-foreground">/ {result.total}</span>
    </div>
    <p className="mt-2 text-muted-foreground">
      {result.correct === result.total ? '전부 맞췄어요!' : `${result.total - result.correct}개 틀림`}
    </p>
  </div>

  {/* 어려움 표시된 예문 */}
  {result.wrong.length > 0 && (
    <section className="mt-8 text-left">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        다음 세션에 우선 노출될 예문
      </h2>
      <ul className="space-y-2">
        {result.wrong.map((q, i) => (
          <li key={i} className="rounded-md border bg-muted/30 px-4 py-3">
            <div className="text-sm font-semibold">{q.fullEn}</div>
            <div className="text-xs text-muted-foreground mt-1">정답: {q.answer}</div>
          </li>
        ))}
      </ul>
    </section>
  )}

  <div className="mt-8 flex gap-3">
    <Button variant="outline" onClick={restart} className="flex-1">
      다시 하기
    </Button>
    <Button onClick={() => router.push(`/day/${day}`)} className="flex-1">
      Day 노트로
    </Button>
  </div>
</article>
```

### 5.11 노트 페이지에서 "어려움" 점 표시

Day 노트 페이지의 `ExampleRow`에 조용히 추가. **레드 금지**.

```tsx
<li className="group relative">
  {/* 어려움 표시된 경우 왼쪽 점 */}
  {isDifficult && (
    <button
      onClick={toggleDifficult}
      aria-label="어려움 표시 해제"
      className="
        absolute -left-4 top-3
        h-1.5 w-1.5 rounded-full
        bg-muted-foreground/40
        hover:bg-muted-foreground/70 transition-colors
      "
      title="어려움 표시 해제"
    />
  )}

  {/* 기존 예문 내용 */}
  <div className="...">...</div>
</li>
```

점 크기·색 가이드:
- 크기: `h-1.5 w-1.5` (6px) — 눈에 안 띌 정도
- 색: `bg-muted-foreground/40` — 매우 옅은 회색
- 호버: 약간 진해짐
- **절대 레드·브라이트한 색 금지**


### 5.12 홈 페이지 "전체 연습" 진입 버튼 (v2.2)

홈 상단 영역의 "📍 최근 학습" 뱃지 옆에 배치. 이 버튼은 홈 페이지에만 존재.

```tsx
<div className="flex flex-wrap items-center gap-2 mb-6">
  {lastViewedDay && (
    <Link
      href={`/day/${lastViewedDay.day}`}
      className="
        inline-flex items-center gap-1.5 rounded-full
        border bg-secondary text-secondary-foreground
        px-3 py-1 text-xs font-medium
        hover:bg-secondary/80 transition-colors
      "
    >
      📍 최근 학습 · Day {lastViewedDay.day}
    </Link>
  )}

  <Link
    href="/practice"
    className="
      inline-flex items-center gap-1.5 rounded-full
      border bg-secondary text-secondary-foreground
      px-3 py-1 text-xs font-medium
      hover:bg-secondary/80 transition-colors
    "
  >
    🎯 전체 연습
  </Link>
</div>
```

**톤 규칙**
- primary/accent 색 쓰지 말 것 — **유혹하듯 강조하지 않음**. secondary 동일.
- 뱃지 느낌 (rounded-full, text-xs). 큰 CTA가 아님.
- 홈이 노트 목차라는 정체성을 훼손하지 않기 위해 "오늘 N개 풀어야 해요" 같은 카운트도 **절대 붙이지 말 것**.

### 5.13 전체 연습 시작 화면 (v2.2)

`/practice` 라우트의 기본 화면. Day별 연습 시작 화면(5.8)과 비슷하지만 **범위 선택**이 추가됨.

```tsx
<article className="max-w-xl mx-auto">
  <Link
    href="/"
    className="text-sm text-muted-foreground hover:text-foreground"
  >
    ← 홈으로
  </Link>

  <h1 className="mt-6 text-2xl md:text-3xl font-bold tracking-tight">
    🎯 전체 연습
  </h1>
  <p className="mt-2 text-sm text-muted-foreground">
    지금까지 배운 동사를 섞어서 반복
  </p>

  {/* 어려움 바로가기 (있을 때만) */}
  {difficultCount > 0 && (
    <div className="
      mt-6 rounded-md border bg-[hsl(var(--highlight-bg))]
      border-l-4 border-l-accent
      px-4 py-3 text-sm
    ">
      어려움 표시된 예문 <strong className="tabular-nums">{difficultCount}개</strong>
      <button
        onClick={startDifficultOnly}
        className="block mt-2 text-accent font-medium hover:underline"
      >
        → 어려움 표시된 것만 풀기
      </button>
    </div>
  )}

  {/* 범위 선택 */}
  <section className="mt-8 space-y-3">
    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
      범위
    </h2>
    <div className="flex flex-wrap gap-2">
      {[
        { value: 'all',  label: '전체'    },
        { value: 'd1-3', label: 'Day 1~3' },
        { value: 'd4-5', label: 'Day 4~5' },
      ].map(opt => (
        <button
          key={opt.value}
          onClick={() => setScope(opt.value)}
          className={cn(
            'rounded-md border px-4 py-2 text-sm font-medium transition-colors',
            scope === opt.value
              ? 'bg-primary text-primary-foreground border-primary'
              : 'hover:bg-muted'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </section>

  {/* 유형 선택 — 5.8과 동일 패턴, 카드 3개 */}
  <section className="mt-8 space-y-3">
    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
      연습 유형 (여러 개 선택 가능)
    </h2>

    <KindCard
      kind="collocation"
      title="동사 짝꿍"
      description="타동사 목적어 · 자동사 전치사 짝꿍"
      count={collocationCount}
    />
    <KindCard
      kind="minimal-pairs"
      title="비슷한 동사 구분"
      description="have/get/keep · try 3형제 · too/enough 등"
      count={minimalPairsCount}
    />
    <KindCard
      kind="composition"
      title="직접 작문"
      description="한국어 → 영어 타이핑"
      count={compositionCount}
    />
  </section>

  {/* 길이 선택 */}
  <section className="mt-8 space-y-3">
    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
      세션 길이
    </h2>
    <div className="flex gap-2">
      {[5, 10, 20].map(len => (
        <button
          key={len}
          onClick={() => setLength(len)}
          className={cn(
            'flex-1 rounded-md border px-4 py-3 text-sm font-medium transition-colors',
            length === len
              ? 'bg-primary text-primary-foreground border-primary'
              : 'hover:bg-muted'
          )}
        >
          {len}문제
        </button>
      ))}
    </div>
  </section>

  <Button
    onClick={startSession}
    disabled={selectedKinds.length === 0}
    className="mt-8 w-full"
    size="lg"
  >
    연습 시작 →
  </Button>
</article>
```

`KindCard` 컴포넌트는 5.8의 checkbox 카드 패턴 그대로 재사용.

### 5.14 동사 짝꿍 (collocation) 문제 렌더링 (v2.2)

빈칸이 하나 또는 둘. 선택지는 버튼 배열.

```tsx
{/* prompt (한국어) */}
<p className="text-sm text-muted-foreground mb-2">
  {q.prompt}
</p>

{/* 영어 문장 with blank */}
<p className="text-lg md:text-xl font-medium leading-relaxed mb-6">
  {renderBlanks(q.fullEn, q.blankStart, q.blankLength, q.blanks, userChoice)}
</p>
{/* 예: "I ___ my money ___ real estate." */}

{/* 선택지 */}
<div className="grid grid-cols-2 gap-3">
  {q.choices?.map(choice => (
    <button
      key={choice}
      disabled={revealed}
      onClick={() => handlePick(choice)}
      className={cn(
        'rounded-md border px-4 py-3 text-sm font-medium transition-colors',
        revealed && choice === q.answer && 'bg-green-50 dark:bg-green-950 border-green-500 text-green-900 dark:text-green-100',
        revealed && picked === choice && choice !== q.answer && 'bg-red-50 dark:bg-red-950 border-destructive text-destructive',
        !revealed && 'hover:bg-muted',
      )}
    >
      {/* "invest / in" 처럼 슬래시 포함되면 세로 스택, 아니면 인라인 */}
      {choice.includes(' / ') ? (
        <div className="flex flex-col items-center gap-0.5">
          {choice.split(' / ').map((w, i) => (
            <span key={i} className={i === 0 ? 'font-semibold' : 'text-xs text-muted-foreground'}>
              {w}
            </span>
          ))}
        </div>
      ) : choice}
    </button>
  ))}
</div>

{/* 정답 후: 패턴 힌트 + 원문 */}
{revealed && (
  <div className="mt-6 rounded-md bg-muted/50 px-4 py-3 text-sm space-y-2">
    {q.groupPattern && (
      <div>
        <div className="text-xs text-muted-foreground mb-1">패턴</div>
        <div className="font-medium">{q.groupPattern}</div>
        {/* e.g. "invest money in 투자처" */}
      </div>
    )}
    <div>
      <div className="text-xs text-muted-foreground mb-1">원문</div>
      <div>{q.fullEn}</div>
    </div>
  </div>
)}
```

**자·타동사 오류 감지 하위 유형** (`subKind: 'detect-transitivity-error'`)은 이지선다 `[맞다] [틀리다]`. 정답 후 정상 문장과 잘못된 문장을 나란히 보여줌:

```tsx
{q.subKind === 'detect-transitivity-error' && revealed && (
  <div className="mt-6 space-y-3 text-sm">
    <div className="rounded-md border-l-4 border-l-destructive bg-red-50 dark:bg-red-950/30 px-4 py-3">
      <div className="text-xs text-muted-foreground mb-1">틀린 문장</div>
      <div className="line-through opacity-60">{q.fullEn /* wrong version */}</div>
    </div>
    <div className="rounded-md border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/30 px-4 py-3">
      <div className="text-xs text-muted-foreground mb-1">올바른 문장</div>
      <div className="font-medium">{q.answer /* correct version */}</div>
    </div>
    <div className="text-xs text-muted-foreground">
      {INTRANSITIVE_PREP_RULES[q.verb]?.meaning}
    </div>
  </div>
)}
```

### 5.15 작문 (composition) 문제 렌더링 (v2.2)

타이핑 입력창. 제출 전과 후 UI가 완전히 다름.

**제출 전:**
```tsx
<div>
  {/* 한국어 */}
  <p className="text-lg md:text-xl font-medium leading-relaxed mb-3">
    {q.ko}
  </p>

  {/* 힌트 (있으면) */}
  {q.hint && (
    <p className="text-xs text-muted-foreground mb-6">
      힌트: {q.hint}
      {/* e.g. "too ~ to V 순환구조" */}
    </p>
  )}

  {/* 입력창 */}
  <textarea
    value={input}
    onChange={e => setInput(e.target.value)}
    className="
      w-full min-h-24 resize-none rounded-md border bg-background
      px-4 py-3 text-base font-mono leading-relaxed
      focus:outline-none focus:ring-2 focus:ring-primary/40
    "
    placeholder="여기에 영어로…"
  />

  <Button
    onClick={submit}
    disabled={!input.trim()}
    className="mt-4 w-full"
  >
    제출
  </Button>
</div>
```

- 입력창 폰트는 `font-mono`로 (타이핑 감각 강조)
- Enter 키로 제출 금지 (여러 줄 타이핑 가능성 있음)
- 최소 높이 24, 자동 확장 아님

**제출 후:**
```tsx
<div className="space-y-5">
  {/* 내 답 */}
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
      당신 답
    </div>
    <div className="rounded-md border bg-muted/40 px-4 py-3 font-mono text-sm">
      {input}
    </div>
  </div>

  {/* 정답 */}
  <div>
    <div className="flex items-center justify-between mb-1">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        정답
      </div>
      <button onClick={() => speak(q.answer)} className="text-xs inline-flex items-center gap-1">
        <Volume2 className="h-3 w-3" /> 듣기
      </button>
    </div>
    <div className="rounded-md border border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/30 px-4 py-3 font-medium">
      {q.answer}
    </div>
  </div>

  {/* 자동 판정 (참고용) */}
  <div className="text-sm">
    <span className="text-muted-foreground">자동 판정: </span>
    {verdict === 'exact'    && <span className="text-green-700 dark:text-green-400">✓ 정확히 일치</span>}
    {verdict === 'reorder'  && <span>△ 단어는 맞는데 순서 다름</span>}
    {verdict === 'partial'  && <span>△ 핵심 단어 일부 일치</span>}
    {verdict === 'mismatch' && <span className="text-destructive">✗ 다름</span>}
  </div>

  {/* 최종 판단 (사용자) */}
  <div>
    <div className="text-sm font-medium mb-2">이번엔 어땠어?</div>
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => markAndNext('correct')}
        className="rounded-md border border-green-500 px-4 py-3 text-sm font-medium hover:bg-green-50 dark:hover:bg-green-950/30"
      >
        ✓ 맞다고 치겠어
      </button>
      <button
        onClick={() => markAndNext('wrong')}
        className="rounded-md border px-4 py-3 text-sm font-medium hover:bg-muted"
      >
        ✗ 다시 보겠어
      </button>
    </div>
  </div>
</div>
```

**중요**
- 제출 즉시 `speak(q.answer)` 자동 재생
- 사용자가 `[✓ 맞다고]`/`[✗ 다시]` 눌러야 다음 문제로 넘어감 — **자동 진행 금지**
- 두 버튼은 시각적으로 동등한 무게 (✓가 green 테두리지만 배경은 없음)
- 자동 판정 배지는 참고용. 사용자 버튼 선택이 최종 판단

### 5.16 minimal-pairs 문제 렌더링 (v2.2)

5.14와 비슷하지만 선택지가 단어 하나씩. 선택지 개수에 따라 grid 열 수 조정.

```tsx
<p className="text-sm text-muted-foreground mb-2">{q.prompt}</p>

<p className="text-lg md:text-xl font-medium leading-relaxed mb-6">
  {renderBlanks(q.fullEn, q.blankStart, q.blankLength, undefined, userChoice)}
</p>

<div className={cn(
  'grid gap-3',
  q.choices?.length === 2 && 'grid-cols-2',
  q.choices?.length === 3 && 'grid-cols-3',
  q.choices?.length === 4 && 'grid-cols-2 md:grid-cols-4'
)}>
  {q.choices?.map(choice => (
    <ChoiceButton key={choice} choice={choice} /* ... */ />
  ))}
</div>

{/* 정답 후 그룹 의미 피드백 */}
{revealed && (
  <div className="mt-6 space-y-3 text-sm">
    {/* 정답 그룹 */}
    <div className="rounded-md border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/30 px-4 py-3">
      <div className="font-semibold">{q.correctGroupTitle}</div>
      {q.correctGroupMeaning && (
        <div className="text-muted-foreground mt-0.5">{q.correctGroupMeaning}</div>
      )}
      {/* e.g. "KEEP · 자제, 억제 — 그 상태가 유지되게" */}
    </div>

    {/* 틀린 경우 오답 설명 */}
    {picked !== q.answer && q.wrongGroupBrief?.[picked!] && (
      <div className="rounded-md border px-4 py-3">
        <span className="text-muted-foreground">당신이 고른 {picked}는: </span>
        <span>{q.wrongGroupBrief[picked!]}</span>
        {/* e.g. "HAVE · 정적인 소유 — 이미 그 상태가 확보되어 있음" */}
      </div>
    )}

    {/* 원문 */}
    <div className="rounded-md bg-muted/50 px-4 py-3">
      <div className="text-xs text-muted-foreground mb-1">원문</div>
      <div>{q.fullEn}</div>
    </div>
  </div>
)}
```

**힌트 전략**: `q.correctGroupMeaning`에는 해당 그룹의 `meaning` 필드를, `q.wrongGroupBrief`는 오답 그룹의 `title + meaning`을 축약해 보여줌. 이게 "왜 이 동사인지" 감각을 만드는 핵심 피드백.

### 5.17 전체 연습 세션 진행 화면 (v2.2)

Day별 연습(5.9)과 레이아웃 공유. 차이는 상단 라벨과 문제 카드 내용물:

```tsx
<article className="max-w-xl mx-auto">
  {/* 진행률 */}
  <div className="flex items-center justify-between mb-6">
    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground tabular-nums">
      🎯 전체 연습 · {kindLabel(q.kind)}
    </span>
    <span className="text-xs tabular-nums text-muted-foreground">
      {current + 1} / {total}
    </span>
  </div>

  {/* 프로그레스 바 */}
  <div className="h-1 bg-muted rounded-full overflow-hidden mb-8">
    <div
      className="h-full bg-primary transition-all"
      style={{ width: `${(current / total) * 100}%` }}
    />
  </div>

  {/* 문제 카드 — kind에 따라 다른 컴포넌트 */}
  <div className="rounded-lg border bg-card p-6 md:p-8">
    {q.kind === 'collocation'    && <QuestionCollocation q={q} /* ... */ />}
    {q.kind === 'minimal-pairs'  && <QuestionMinimalPairs q={q} /* ... */ />}
    {q.kind === 'composition'    && <QuestionComposition q={q} /* ... */ />}
  </div>

  {/* 하단 네비 */}
  {revealed && q.kind !== 'composition' && (
    <div className="mt-6 flex justify-end">
      <Button onClick={next}>
        {current + 1 === total ? '결과 보기' : '다음 →'}
      </Button>
    </div>
  )}
  {/* composition은 QuestionComposition 안에서 자체 버튼 처리 */}
</article>
```

**kindLabel 매핑**:
```ts
const kindLabel = (k: PracticeKind) => ({
  'collocation':   '동사 짝꿍',
  'minimal-pairs': '비슷한 동사 구분',
  'composition':   '직접 작문',
  'fill-in':       '빈칸 채우기',
  'pattern-choice':'동사 고르기',
  'sort-transitivity': '자·타동사 분류',
}[k]);
```

---
---

## 6. shadcn/ui 사용 가이드

### 설치 명령

```bash
pnpm dlx shadcn@latest init
# 답변: Style=New York, Base=Slate, CSS variables=Yes
pnpm dlx shadcn@latest add button sonner
pnpm add next-themes lucide-react
```

**이 제품은 복잡한 폼·다이얼로그가 없어서 필요한 shadcn 컴포넌트가 적다:**
- `Button` — 🔊 버튼, 테마 토글
- `Sonner` (토스트) — 음성 재생 실패 알림

추가 컴포넌트가 필요하면 그때 `pnpm dlx shadcn@latest add <name>`.

### Button variant 선택 기준
- 주요 CTA: `variant="default"` (네이비)
- 부수 액션: `variant="ghost"` (🔊, 테마 토글)
- 파괴적 액션: 이 제품엔 없음
- 링크처럼 보이게: `variant="link"`

---

## 7. 아이콘 & 이모지

### lucide-react 아이콘 쓰는 곳
- `ChevronLeft` — 목차로 돌아가기
- `ChevronRight` — (미사용)
- `Volume2` — 음성 재생 버튼
- `Sun`, `Moon` — 다크모드 토글
- 그 외 기본적으로 lucide에 있는 건 lucide로

### 이모지 쓰는 곳 (의도적)
특정 UI 신호로 이모지를 쓴다. 남발 금지.

- `💡` — "이 날의 핵심" 헤드라인 앞
- `📌` — "꼭 기억할 것" 박스 앞
- `✏️` — 수업노트 / 개인 필기 표시 (`noteSource`에 이미 포함돼 있음)
- `📍` — "최근 학습" 뱃지
- `🔊` — 본문 안에서는 쓰지 말고, 아이콘(`Volume2`)으로만. 예외: 그룹 헤더 시맨틱 표시용

아이콘 크기: `h-4 w-4` (16px) 기본, 큰 경우 `h-5 w-5` (20px).

---

## 8. 다크모드

### 원칙
- 라이트/다크 둘 다 **동등하게 폴리시**. 다크는 부록이 아니다.
- 다크에서 네이비 배경이 너무 어두우면 눈 아프다 → `hsl(220 30% 8%)` (완전 검정 아님)
- 다크에서 레드는 살짝 밝게 (`hsl(0 75% 58%)`) — 너무 진한 빨강은 다크 배경에서 튐
- 다크에서 카드와 배경 구분: `--card`를 `--background`보다 밝게 (`220 30% 11%` vs `220 30% 8%`)

### 토글 구현

`app/layout.tsx`:
```tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

`components/ThemeToggle.tsx`:
```tsx
'use client';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="테마 전환"
    >
      {resolvedTheme === 'dark'
        ? <Sun className="h-4 w-4" />
        : <Moon className="h-4 w-4" />}
    </Button>
  );
}
```

---

## 9. 접근성

### 필수
- 터치 타깃 최소 **44×44px**. 모바일 🔊 버튼 특히 중요.
- 모든 인터랙티브 요소에 `aria-label` 또는 visible label
- `focus-visible:ring-2 focus-visible:ring-ring` 포커스 표시
- 다크/라이트 모두 WCAG AA 대비 (4.5:1) 통과
- `<html lang="ko">` 명시

### 시맨틱 마크업
- 홈의 Day 카드 리스트는 `<ol>` 또는 `<section>` 안에
- Day 페이지 전체는 `<article>`로
- 그룹마다 `<section>`, 그룹 타이틀은 `<h3>`
- 예문 리스트는 `<ol>`
- 필기는 `<aside>` 또는 그냥 `<div>` (의미상 aside에 가까움)

### 스크린 리더
- 🔊 버튼: `aria-label="영어 예문 듣기"` 또는 예문 일부 포함
- 테마 토글: `aria-label="테마 전환"`
- 이모지만으로 의미 전달 금지 — 텍스트 라벨 병기
