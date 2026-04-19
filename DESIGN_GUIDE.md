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
