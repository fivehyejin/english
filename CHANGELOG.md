# CHANGELOG

이 프로젝트는 이전에 "영어 복습 관리 앱" 컨셉으로 기획되었다가 **"영어 학습 정리 노트"** 컨셉으로 **전면 재설계**됨. 이 문서는 Cursor/개발자가 이전 문서나 코드 샘플과 혼동하지 않도록 **바뀐 점을 명시**.

---

## v2.2 (현재) — 전체 연습 모드

**추가 이유**: v2.1 Day별 연습 모드는 **한 Day 안의 자매 그룹 구분**에 초점이 맞춰져 있었음. 혜진님이 원하는 건 (1) 지금까지 배운 **모든 동사를 가로지르며** 짝꿍 전치사/목적어를 반복 체화하고, (2) 비슷한 동사(have/get/keep, try 3형제) 구분을 통합해서 훈련하고, (3) too~to 같은 구문을 한국어만 보고 **직접 타이핑**해볼 수 있게 하는 것. 즉 Day 경계를 넘어서는 **크로스-Day 통합 훈련장**이 필요.

### 추가된 기능

- ✅ **전체 연습 모드** (`/practice` 신규 라우트)
- ✅ **홈 진입점**: "📍 최근 학습" 뱃지 옆에 `[🎯 전체 연습]` 버튼
- ✅ **3가지 신규 테스트 유형**:
  1. **동사 짝꿍 (Collocation)**: 타동사의 자주 쓰이는 목적어군 + 자동사의 짝꿍 전치사/전치사 목적어 훈련
  2. **비슷한 동사 구분 (Minimal Pairs)**: have/get/keep, try N/~ing/to V 등 자매 그룹을 Day 경계 없이 섞어서 출제
  3. **직접 작문 (Composition)**: 한국어 문장 보고 영어로 타이핑, 단순 비교 채점
- ✅ **크로스-Day 풀링**: 문제를 낼 때 Day 경계를 넘어서 동일 성격의 그룹을 함께 묶어 출제
- ✅ **범위 필터**: 전체 / Day 1~3 / Day 4~5 중 선택
- ✅ **어려움 플래그 공유**: v2.1 `PracticeState.difficultExamples` 재사용. Day별 연습에서 표시된 어려움도 전체 연습에서 우선 노출됨. 반대도 마찬가지.

### 데이터 스키마 추가

`PracticeKind`에 3개 리터럴 추가. 저장 타입은 변경 없음(`PracticeState.difficultExamples`만 계속 사용).

```typescript
type PracticeKind =
  | 'fill-in'           // (v2.1) 자매 그룹 동사 고르기
  | 'pattern-choice'    // (v2.1) 한국어 → 패턴 이름 고르기
  | 'sort-transitivity' // (v2.1) 자·타동사 분류
  | 'collocation'       // (v2.2 NEW) 동사 + 짝꿍 목적어/전치사
  | 'minimal-pairs'     // (v2.2 NEW) 비슷한 동사 구분 (전 Day 통합)
  | 'composition';      // (v2.2 NEW) 한국어 → 영어 타이핑
```

`curriculum-m2.json`에 Day 5 데이터 추가됨 (TOO ~ TO V · ENOUGH TO V, 11 groups, 62 examples). 스키마 변경은 없음 — 기존 `daySummaries` + `groups`에 항목 추가.

### ⚠️ 전체 연습에서도 지켜야 할 선 (복습 앱 회귀 방지)

v2.1의 모든 금지 사항을 그대로 승계. 특히:

| 절대 금지 | 대신 |
|---|---|
| 홈에 "오늘 N개 연습하세요" 알림 | 홈 버튼은 조용한 secondary 톤, 비강제 |
| 전체 정답률 누적 통계 | 세션 결과만 표시하고 버림 |
| Day/유형별 진도율 표시 | 카운트 있어도 "남은 문제 수" 정도만 |
| 연속 출석(streak) | 날짜 기록 안 함 |
| "작문 점수" 누적 | 작문 맞춘 횟수 저장 X |
| "이 동사는 마스터" 상태 | 어려움 플래그 유일 (있음/없음) |
| 타이핑 작문 자동 첨삭(유사어 제안 등) | 정답 전문만 보여주고 판단은 사용자에게 |

### 타이핑 작문의 채점 원칙

자유 작문 채점은 본질적으로 부정확함. 따라서:

1. **정답을 숨기지 않음** — 제출 즉시 항상 정답 전문 공개
2. **자동 판정은 참고용** — 단어 집합 기반 "충분히 비슷함 / 다름" 정도만
3. **최종 판단은 사용자** — 결과 화면에 `[✓ 맞다고 치겠어]` `[✗ 다시 보겠어]` 수동 버튼
4. **저장은 사용자 판단 기준** — 사용자가 ✗ 누르면 어려움 플래그 on, ✓ 누르면 제거

이 구조 덕분에 "애매한 작문 채점"으로 인한 자동화 실패가 학습 경험을 망치지 않음.

### 변경된 파일

- `README.md` — 5.8 섹션 신규 추가 (전체 연습 모드 기획), Phase 5 개발 순서
- `DESIGN_GUIDE.md` — 5.12~5.16 섹션 신규 추가 (전체 연습 UI 규격)
- `DATA_SCHEMA.md` — `PracticeKind`에 3개 값 추가, 작문 채점 유틸 추가, `CROSS_DAY_SISTERS` 매핑
- `CURSOR_PROMPT.md` — Phase 5 (전체 연습 모드) 섹션 추가
- `curriculum-m2.json` — Day 5 추가 (스키마 변경 없음)

### 핵심 설계 원칙 (v2.1 원칙 승계)

1. **사용자가 원할 때만 시작** — 홈 버튼 외엔 어떤 알림도 없음
2. **세션은 독립적** — 통계 누적 X
3. **노트가 본체** — 전체 연습도 노트 컨셉을 훼손하지 않음
4. **어려움 플래그는 임시 표시** — 맞추면 자연 소멸

---

## v2.1 — Day별 연습 모드 추가

**추가 이유**: 혜진님이 배우는 내용이 "동사 구분"(자·타동사, have/get/keep, try 3형제, 조동사 가능성 강도 등)이라, 단순 노트 읽기만으로는 **실제 구사 감각**이 안 잡힘. 개별 예문 암기가 아니라 **패턴 구분 훈련**이 필요.

### 추가된 기능

- ✅ **연습 모드** (`/day/[day]/practice` 신규 라우트)
- ✅ **3가지 테스트 유형**:
  1. **빈칸 채우기**: 그룹 동사를 가리고 자매 그룹에서 고르기 (have/get/keep 등)
  2. **동사 고르기 (패턴 인식)**: 한국어 보고 어떤 패턴 쓸지 먼저 고르기 (try N / try ~ing / try to V)
  3. **자·타동사 분류**: Day 1 전용
- ✅ **세션 시작 화면**: 유형(복수 선택) + 길이(5/10/전체) 선택
- ✅ **세션 진행 화면**: 프로그레스 바, 정답/오답 피드백, 🔊 자동 재생
- ✅ **세션 종료 화면**: 정답률 + 틀린 예문 리스트
- ✅ **어려움 플래그 시스템**:
  - 틀린 예문은 자동으로 어려움 표시
  - Day 노트 페이지에 조용한 회색 점(●)으로 표시
  - 다음 세션에서 맞추면 자동 제거
  - "어려움 표시된 것만 풀기" 모드
- ✅ **자매 그룹 매핑** (`SISTER_GROUPS`): 빈칸 채우기 선택지 자동 생성용

### 데이터 스키마 추가

`AppState`에 `practice?: PracticeState` 필드 추가. 단, 저장하는 건 **어려움 플래그뿐** — 세션 기록/통계/점수는 저장 X.

```typescript
interface PracticeState {
  difficultExamples: Record<string, DifficultFlag>;
  // key = `${groupId}:${exampleIdx}`
}

interface DifficultFlag {
  markedAt: string;
  sessionsStruggled: number;
}
```

### ⚠️ 연습 모드에서도 지켜야 할 선 (복습 앱 회귀 방지)

| 절대 금지 | 대신 |
|---|---|
| 망각곡선·SRS 일정 관리 | 사용자가 원할 때만 세션 시작 |
| "오늘 N개 해야 함" 할당 | 세션 길이 매번 사용자 선택 |
| 홈에 "Due/어려움 3개" 뱃지 | 홈은 그대로. 연습 진입은 Day 페이지에서만 |
| "마스터됨" / 숙달 상태 | 어려움 플래그는 없음/있음 2가지뿐 |
| 복습 스테이지 1~5단계 | 단계 없음 |
| 점수 · streak · 레벨 · 뱃지 | 세션 결과만 표시 후 버림 |
| 성취 축하 애니메이션 | 결과는 담담하게 숫자만 |
| 북마크 ⭐ 재도입 | 어려움 표시는 **자동**이지 사용자가 찍는 게 아님 |
| 어려움 점을 레드로 눈에 띄게 | 회색 작은 점, 노트 컨셉 훼손 금지 |

### 핵심 설계 원칙 (복습 앱과의 차이)

1. **사용자가 원할 때만 시작**: 앱이 먼저 "복습할 때입니다!" 알리지 않음
2. **세션은 독립적**: 세션 간에 연결고리 없음 (단, 어려움 플래그만 세션 간 공유)
3. **누적 통계 없음**: 정답률, 세션 수, 날짜별 기록 등 저장 X
4. **노트가 본체, 연습은 부속**: 홈·Day 노트 UI는 연습 모드 없이도 완결됨
5. **어려움 플래그는 "지금 헷갈리는 것"의 임시 표시**: 맞추면 자연 소멸

### 변경된 파일

- `README.md` 5.6 섹션 추가 (연습 모드 기획)
- `DESIGN_GUIDE.md` 5.7~5.11 섹션 추가 (UI 규격)
- `DATA_SCHEMA.md`: `PracticeState`, `PracticeKind`, `PracticeQuestion` 등 타입 + 유틸 함수
- `CURSOR_PROMPT.md`: Phase 4 (연습 모드) 섹션 + 완료 기준 추가
- `curriculum-m2.json`: 변경 없음 (연습 모드는 기존 예문 데이터를 재활용)

---

## v2 — 정리 노트 컨셉

### 프레이밍 변경
| | v1 (폐기) | v2 (현재) |
|---|---|---|
| 제품 컨셉 | 영어 복습 관리 앱 | **영어 학습 정리 노트** |
| 핵심 은유 | 망각곡선·SRS | **노트북 · 요약 시트** |
| 사용 동사 | "복습한다" | "다시 꺼내 본다" |
| 사용 명사 | 복습 대상·스테이지 | **Day · 요약 · 필기** |

### 제거된 기능 (v1에 있었으나 v2에서 삭제, v2.1·v2.2에서도 유지 삭제)
**아래 기능은 코드·UI·데이터 어디에도 존재하지 않아야 함:**

- ❌ 망각곡선 복습 관리 (REVIEW_INTERVALS = [1,3,7,14,30])
- ❌ 그룹별 복습 스테이지·횟수 (`reviewStage`, `reviewCount`)
- ❌ "Due Today" 모드 및 복습 대상 계산
- ❌ 복습 체크 버튼 ("✓ 복습")
- ❌ Mastered 상태
- ❌ 예문 북마크 (⭐ / `starredExamples`) — **v2.1의 어려움 표시와 다름** (자동 vs 수동)
- ❌ "Starred" 모드
- ❌ ~~Exam Mode (플래시카드 시험)~~ → v2.1에서 "연습 모드"로 부활하되 **플래시카드가 아닌 패턴 구분 훈련**
- ❌ "헷갈리는 것 비교" 독립 탭 (대신 Day 요약에 녹여 넣음)
- ❌ 10개월 진도표 그리드 (Month 10개를 한눈에 보는 시각화)
- ❌ 그룹 카드 펼치기/접기 토글
- ❌ 필터바 (Day 필터, 검색 박스, 전체 펼침/접기)
- ❌ 모드 탭 5개 (All / Due / Starred / Compare / Exam)
- ❌ 커스텀 그룹 직접 추가 Dialog
- ❌ Export / Import JSON 기능
- ❌ 월별 주제 편집

### 추가된 기능 (v2 신규)

- ✅ **Day별 "이 날의 핵심" 요약** (`daySummaries` 데이터 필드)
  - `headline`: 한 문장 핵심
  - `keyPoints`: 불릿 리스트 (markdown 강조 지원)
  - `mustRemember`: 꼭 기억할 것 (선택, 📌 강조 박스)
- ✅ **홈 화면 Day 목차** — 각 Day의 headline이 카드에 바로 노출
- ✅ **Day 상세 페이지** — 스크롤 한 번에 그 날 내용 전부 (펼치기 없음)
- ✅ **수업노트 박스 강조 렌더링** — `kind: 'class-note'` 그룹을 Day 상단에 별도 박스로
- ✅ **이전/다음 Day 네비게이션**
- ✅ **"최근 학습" 뱃지** — 마지막으로 본 Day 표시

### 데이터 스키마 변경

**`CurriculumData`에 `daySummaries` 필드 추가:**
```typescript
interface CurriculumData {
  // ... 기존 필드
  daySummaries: Record<number, DaySummary>;  // ← NEW
}

interface DaySummary {  // ← NEW
  dayTitle: string;
  headline: string;
  keyPoints: string[];
  mustRemember?: string[];
}
```

**`AppState` 대폭 간소화:**
```typescript
// v1 (삭제)
interface AppState {
  progress: Record<string, GroupProgress>;  // ❌ 삭제
  monthTopics: Record<number, string>;      // ❌ 삭제
  currentMonth: number;                     // ❌ 삭제 (항상 최신 월)
  customGroups: PatternGroup[];             // ❌ 삭제
}

// v2 (현재)
interface AppState {
  lastViewedDay: { month: number; day: number } | null;
  theme?: 'light' | 'dark' | 'system';
}
```

**PatternGroup에서 제거된 필드:**
- `isCustom` (커스텀 그룹 기능 제거)

**PatternGroup은 그 외엔 동일.** `kind: 'class-note'`, `notes`, `noteSource`, `example.note` 모두 유지.

### 화면 구조 변경

**v1:**
```
App
└── 탭 5개 (All / Due / Starred / Compare / Exam)
    └── 그룹 카드 리스트 (접힘/펼침 토글)
        └── 예문 리스트 (예문별 북마크·듣기)
```

**v2 (v2.2 시점):**
```
App
├── / (홈) — Day 목차 + 최근 학습 + [🎯 전체 연습]
├── /day/[dayNum] (Day 상세)
│   ├── Day 번호 + 주제 헤더
│   ├── [📝 연습 모드] 버튼 (v2.1)
│   ├── 💡 이 날의 핵심 박스 (레드 좌측 세로선)
│   ├── ✏️ 수업노트 박스 (있으면, 옅은 네이비 배경)
│   ├── 일반 그룹 섹션들 (펼쳐진 상태)
│   └── ← 이전/다음 Day → 네비
├── /day/[dayNum]/practice (v2.1 Day별 연습)
└── /practice (v2.2 전체 연습)
```

### 디자인 시스템

**v1 → v2 유지된 것:**
- shadcn/ui 기반
- Pretendard Variable 폰트
- Navy/Silver/Red 팔레트
- 라이트·다크 모드

**v1 → v2 달라진 것:**
- 쓰는 shadcn 컴포넌트 수 대폭 감소 (Dialog, Tabs, Collapsible, Select, Badge 등 불필요)
- 필요한 것: **Button, Sonner** 정도
- 디자인 밀도 ↓ → **여백과 읽는 리듬** 중시
- 모바일에서 **"스크롤 한 번으로 끝나는 노트"** 컨셉

### 유지된 데이터
`curriculum-m2.json`의 예문/필기/수업노트는 모두 그대로 유지되며, v2에서 `daySummaries` 필드만 새로 추가됨. v2.2에서는 Day 5 (TOO ~ TO V · ENOUGH TO V) 데이터가 추가됨.

---

## v1 (폐기, 참고용)

복습 관리 앱으로 기획됨. 망각곡선·플래시카드·북마크 등 학습 관리 기능 중심.
프로토타입 `prototype/english_review.html`에 v1 UI가 남아있으나 **이는 참고용**이며, 비주얼·기능 모두 v2에서는 따르지 말 것.

**v1 프로토타입에서 v2로 가져갈 것:**
- 커리큘럼 데이터 구조 (예문·필기·수업노트 전용 그룹)
- 음성 재생 로직 (Web Speech API)
- 디자인 팔레트 의도 (Navy/Silver/Red, 단 v1 프로토타입은 실제론 다른 팔레트였음)

**v1 프로토타입에서 v2로 가져가지 말 것:**
- 탭 기반 네비게이션
- 카드 펼침/접기 UI
- 복습 체크·북마크·Exam Mode 관련 UI 전부
- 진도표 그리드
