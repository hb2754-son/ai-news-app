# UI 가이드 — AI 뉴스 수집기

앱 이름은 **AI 뉴스 수집기**이며, 메인 화면은 뉴스를 카드로 보여주는 대시보드다.
스타일은 Tailwind CSS 4 유틸리티 클래스만 사용하고, 깔끔하고 읽기 편한 것을 최우선으로 한다.

## 1. 디자인 원칙

- **읽기 우선**: 본문은 충분한 행간과 여백을 두고, 장식은 최소화한다.
- **차분한 톤**: 무채색(slate) 바탕에 포인트 색 하나(indigo)만 쓴다. 단, 카테고리 구분은 예외로 §4.6의 카테고리 색을 쓴다.
- **일관성**: 간격·모서리·그림자는 아래 토큰만 사용한다.
- **라이트/다크 모두 지원**: `dark:` 변형을 함께 지정한다 (`prefers-color-scheme` 기준).
- **한국어 가독성**: 본문 `leading-relaxed`, 줄바꿈은 `break-keep`을 사용한다.

## 2. 디자인 토큰

| 용도 | 라이트 | 다크 |
|---|---|---|
| 페이지 배경 | `bg-slate-50` | `dark:bg-slate-950` |
| 카드/표면 | `bg-white` | `dark:bg-slate-900` |
| 테두리 | `border-slate-200` | `dark:border-slate-800` |
| 본문 텍스트 | `text-slate-900` | `dark:text-slate-100` |
| 보조 텍스트 | `text-slate-500` | `dark:text-slate-400` |
| 포인트(주요 버튼, 선택된 칩) | `bg-indigo-600 text-white` | `dark:bg-indigo-500` |
| 포인트 hover | `hover:bg-indigo-700` | `dark:hover:bg-indigo-400` |
| 포커스 링 | `focus-visible:ring-2 ring-indigo-500 ring-offset-2` | 동일 |
| 오류/삭제 | `text-red-600` | `dark:text-red-400` |

- 모서리: 카드 `rounded-xl`, 버튼·입력 `rounded-lg`, 칩 `rounded-full`
- 그림자: 카드 `shadow-sm`, hover 시 `hover:shadow-md`
- 전환: `transition-colors` / `transition-shadow` (150ms 기본)
- 폰트: Geist(`font-sans`). 한글은 시스템 폰트로 폴백된다.

> 현재 `globals.css`의 `body`가 `font-family: Arial`을 직접 지정하고 있다. 구현 시 `font-sans`를 쓰도록 정리한다.

### 타이포그래피

| 요소 | 클래스 |
|---|---|
| 앱 이름(헤더) | `text-lg font-bold tracking-tight` |
| 페이지 제목 | `text-2xl font-bold tracking-tight` |
| 카드 제목 | `text-base font-semibold leading-snug` |
| 카드 요약 | `text-sm leading-relaxed text-slate-600 dark:text-slate-300` |
| 메타(출처·날짜) | `text-xs text-slate-500 dark:text-slate-400` |

## 3. 레이아웃

```
┌──────────────────────────────────────────────────────┐
│ Header: AI 뉴스 수집기            [뉴스 가져오기] [👤] │  sticky, 높이 56~64px
├──────────────────────────────────────────────────────┤
│  최신 AI 뉴스                          (건수 · 마지막 수집) │
│                                                      │
│  [전체] [모델/연구] [제품/서비스] [투자/기업] … [+ 추가]  │  카테고리 바
│                                                      │
│  ┌────────┐ ┌────────┐ ┌────────┐                    │
│  │  카드  │ │  카드  │ │  카드  │                    │  반응형 그리드
│  └────────┘ └────────┘ └────────┘                    │
└──────────────────────────────────────────────────────┘
```

- 컨테이너: `mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8`
- 페이지 세로 간격: `py-8`, 섹션 간 `space-y-6`
- 카드 그리드: `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`
- 헤더: `sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80`

## 4. 컴포넌트

### 4.1 헤더

- 좌측: 앱 이름 **AI 뉴스 수집기** (홈 링크).
- 우측: `FetchNewsButton`(뉴스 가져오기) + Clerk `UserButton`.
- 모바일에서는 버튼 라벨을 유지하고 앱 이름만 `truncate` 처리한다.

### 4.2 카테고리 바 (`CategoryFilter`)

뉴스 카드 목록 **바로 위**에 한 줄로 배치한다. 가장 앞에 "전체", 가장 끝에 "카테고리 추가" 버튼을 둔다.

```
[전체] [모델/연구] [제품/서비스] [투자/기업] [규제/정책] [+ 카테고리 추가]
```

- 컨테이너: `flex flex-wrap items-center gap-2`
  (칩이 많아지면 줄바꿈. 모바일에서 가로 스크롤을 원하면 `flex-nowrap overflow-x-auto pb-1`로 대체)
- 칩(기본): `rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800`
- 칩(선택됨): `border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700`, `aria-pressed="true"`
- 칩 안에 기사 수를 작은 숫자로 표시할 수 있다: `ml-1.5 text-xs opacity-70`
- **카테고리 추가 버튼** (목록의 맨 끝):
  - `inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-3.5 py-1.5 text-sm font-medium text-slate-500 hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-400`
  - 아이콘 `+` + 라벨 "카테고리 추가". 필터 칩과 구분되도록 **점선 테두리**를 쓴다.
  - 클릭하면 **모달**(`components/categories/AddCategoryButton`, 네이티브 `<dialog>`)이 열려 이름(필수)과 설명(선택)을 입력받는다. 설명은 Claude 분류 프롬프트에 쓰인다. 저장하면 `POST /api/categories` 호출 후 목록을 새로고침한다.
- 선택 상태는 URL 쿼리(`?category=<id>`)로 관리해 새로고침·공유에도 유지한다.

### 4.3 뉴스 카드 (`NewsCard`)

```
┌───────────────────────────────┐
│ [카테고리]            TechCrunch│  ← 상단: 카테고리 배지 · 출처
│ 한국어 제목 (최대 2줄)          │
│ 한국어 요약 (최대 3~4줄)        │
│                               │
│ 2026.10.27     [원문 ↗][Notion]│  ← 하단: 날짜 · 액션
└───────────────────────────────┘
```

- 컨테이너: `flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900`
- 카테고리 배지: `rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300`
  (미분류는 `bg-slate-100 text-slate-600`)
- 제목: `mt-3 line-clamp-2 text-base font-semibold leading-snug`
- 요약: `mt-2 line-clamp-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300`
- 하단 영역: `mt-auto flex items-center justify-between pt-4` — 카드 높이가 달라도 하단이 정렬된다.
- 원문 링크: 텍스트 링크, `target="_blank" rel="noopener noreferrer"`
- **Notion 저장** 버튼: 보조 버튼 스타일. 저장 완료 시 "저장됨"(비활성)으로 바뀐다.
- 영어 원제는 카드에 노출하지 않고, 필요하면 제목에 `title` 속성(툴팁)으로만 제공한다.

### 4.4 버튼

| 종류 | 클래스 |
|---|---|
| 주요(뉴스 가져오기) | `inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed` |
| 보조 | `rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200` |
| 텍스트 링크 | `text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400` |

- 터치 영역은 최소 36px 높이를 확보한다.
- 모든 버튼에 `focus-visible` 링을 적용한다.

### 4.5 상태 화면

- **로딩(수집 중)**: 버튼에 스피너 + "가져오는 중…", `disabled` 처리. 목록은 카드 스켈레톤(`animate-pulse`, `bg-slate-200 dark:bg-slate-800`)을 보여준다. 수집은 Claude 호출로 시간이 걸리므로 진행 중임을 분명히 알린다.
- **빈 상태**: 카드 영역 중앙에 점선 테두리 박스 — "아직 수집된 뉴스가 없어요" + 보조 문구 "‘뉴스 가져오기’ 버튼을 눌러 최신 기사를 불러오세요."
- **필터 결과 없음**: "이 카테고리에는 기사가 없어요" + "전체 보기" 링크.
- **오류**: `rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700` (다크: `dark:border-red-900 dark:bg-red-950 dark:text-red-300`) 배너 + 재시도 안내.
- **완료 알림**: 수집 후 "새 기사 N건을 가져왔어요" 토스트 또는 헤더 아래 인라인 메시지.

### 4.6 카테고리 색

카테고리는 색으로 구분한다. 색은 `components/ui/category-color.ts`의 `getCategoryColor(categoryId)` 한 곳에서 관리한다.

- 팔레트 6색(sky, emerald, amber, rose, violet, teal)을 카테고리 **id 순서대로** 돌려 쓴다. 카테고리를 추가해도 자동으로 색이 배정된다.
- 미분류는 slate(무채색).
- 카드 배지: `bg-{color}-50 text-{color}-700` (다크: `dark:bg-{color}-950 dark:text-{color}-300`)
- 필터 칩: 앞에 색 점(`size-2 rounded-full`)을 두고, 선택되면 `bg-{color}-700 text-white`로 채운다. 점은 장식이므로 `aria-hidden`이며, 선택 상태는 색뿐 아니라 `aria-current`와 채움으로도 구분한다.
- 클래스 이름은 Tailwind가 정적으로 찾을 수 있도록 `category-color.ts`에 전부 문자열로 적는다. 새 색을 추가할 때도 같은 방식을 따른다.

## 5. 반응형

| 구간 | 그리드 | 비고 |
|---|---|---|
| 기본(< 640px) | 1열 | 카테고리 칩 줄바꿈 |
| `sm`(≥ 640px) | 2열 | |
| `lg`(≥ 1024px) | 3열 | 컨테이너 최대 `max-w-6xl` |

## 6. 접근성

- 본문 대비 WCAG AA(4.5:1) 이상. 보조 텍스트는 `slate-500` 이상으로 연하게 하지 않는다.
- 카테고리 칩은 `<button>` + `aria-pressed`, 칩 묶음은 `role="group" aria-label="카테고리 필터"`.
- 아이콘만 있는 버튼에는 `aria-label`을 둔다. 로딩 상태는 `aria-busy` / `aria-live="polite"`로 알린다.
- 키보드 포커스가 항상 보이게 하고, 색만으로 상태를 구분하지 않는다(선택 칩은 `aria-pressed` + 색 + 채움).

## 7. 구현 메모

- 서버 컴포넌트를 기본으로 하고, 상호작용이 필요한 `FetchNewsButton`, `CategoryFilter`, Notion 저장 버튼만 `"use client"`로 둔다.
- 컴포넌트 위치는 CLAUDE.md의 계획된 구조를 따른다: `components/news/{NewsCard,NewsList,FetchNewsButton,CategoryFilter}`, `components/categories/`, `components/ui/`.
- 공통 클래스 조합(버튼, 배지)은 `components/ui/`의 작은 컴포넌트로 묶어 중복을 피한다.
- 날짜 표기는 `YYYY.MM.DD` (한국 시간 기준).
