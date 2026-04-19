# CHANGELOG

이 프로젝트는 이전에 "영어 복습 관리 앱" 컨셉으로 기획되었다가 **"영어 학습 정리 노트"** 컨셉으로 **전면 재설계**됨. 이 문서는 Cursor/개발자가 이전 문서나 코드 샘플과 혼동하지 않도록 **바뀐 점을 명시**.

---

## v2 (현재) — 정리 노트 컨셉

### 프레이밍 변경
| | v1 (폐기) | v2 (현재) |
|---|---|---|
| 제품 컨셉 | 영어 복습 관리 앱 | **영어 학습 정리 노트** |
| 핵심 은유 | 망각곡선·SRS | **노트북 · 요약 시트** |
| 사용 동사 | "복습한다" | "다시 꺼내 본다" |
| 사용 명사 | 복습 대상·스테이지 | **Day · 요약 · 필기** |

### 제거된 기능 (v1에 있었으나 v2에서 삭제)
**아래 기능은 코드·UI·데이터 어디에도 존재하지 않아야 함:**

- ❌ 망각곡선 복습 관리 (REVIEW_INTERVALS = [1,3,7,14,30])
- ❌ 그룹별 복습 스테이지·횟수 (`reviewStage`, `reviewCount`)
- ❌ "Due Today" 모드 및 복습 대상 계산
- ❌ 복습 체크 버튼 ("✓ 복습")
- ❌ Mastered 상태
- ❌ 예문 북마크 (⭐ / `starredExamples`)
- ❌ "Starred" 모드
- ❌ Exam Mode (플래시카드 시험)
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

**v2:**
```
App
├── / (홈) — Day 목차 + 최근 학습
└── /day/[dayNum] (Day 상세)
    ├── Day 번호 + 주제 헤더
    ├── 💡 이 날의 핵심 박스 (레드 좌측 세로선)
    ├── ✏️ 수업노트 박스 (있으면, 옅은 네이비 배경)
    ├── 일반 그룹 섹션들 (펼쳐진 상태)
    └── ← 이전/다음 Day → 네비
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
`curriculum-m2.json`의 **예문 281개, 그룹 29개, 필기 55+ 메모**는 모두 그대로. 데이터는 건드릴 필요 없고, `daySummaries` 필드만 새로 추가됨.

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
