# AI 뉴스 수집기

해외 AI 뉴스를 RSS로 수집하고, Claude API로 한국어 번역·요약·카테고리 분류를 한 뒤 카드 형태로 보여주는 웹 앱입니다. 마음에 드는 기사는 카드의 버튼으로 Notion에 저장할 수 있습니다.

## 주요 기능

- **로그인** — Clerk 인증, 로그인한 사용자만 사용 가능
- **뉴스 가져오기** — "뉴스가져오기" 버튼을 눌러 수동으로 수집 (자동 스케줄링 없음)
- **번역·요약·분류** — Claude가 제목·요약을 한국어로 만들고 카테고리를 지정
- **카테고리 필터 / 추가** — 카테고리별 보기, 모달로 카테고리 추가 (이름 + 설명)
- **Notion 저장** — 카드별 버튼으로 Notion 데이터베이스에 저장
- URL 기준 중복 기사는 건너뜀, 목록 페이지네이션 지원

## 기술 스택

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Clerk · Neon Postgres · Drizzle ORM · Claude API (`@anthropic-ai/sdk`) · Notion API · rss-parser

## 시작하기

### 1. 설치

```bash
npm install
```

### 2. 환경변수

프로젝트 루트에 `.env.local`을 만들고 아래 값을 채웁니다.

| 변수 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Clerk API 키 |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Clerk 로그인/가입 경로 |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | 로그인/가입 후 이동 경로 |
| `DATABASE_URL`, `DATABASE_URL_POOLED` | Neon Postgres 연결 문자열 |
| `ANTHROPIC_API_KEY` | Claude API 키 |
| `NOTION_API_TOKEN` | Notion 연동(integration) 토큰 |
| `NOTION_DATABASE_ID` | 기사를 저장할 Notion 데이터베이스 ID |

Notion 데이터베이스에는 다음 속성이 있어야 합니다: `제목`(title), `텍스트`(rich text), `출처`(URL), `카테고리`(select), `날짜`(date). 또한 해당 데이터베이스를 Notion 연동에 공유해야 합니다.

### 3. 데이터베이스

```bash
npm run db:migrate        # 마이그레이션 적용
npm run db:seed           # 초기 카테고리 데이터
npm run db:seed:samples   # (선택) 샘플 기사
```

### 4. 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인합니다.

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` / `npm run start` | 프로덕션 빌드 / 실행 |
| `npm run lint` | ESLint |
| `npm run db:generate` | 스키마 변경으로 마이그레이션 생성 |
| `npm run db:migrate` | 마이그레이션 적용 |

## 프로젝트 구조

```
src/
  app/          페이지(홈, dashboard)와 API 라우트
    api/        news/fetch, categories, notion/save
  components/   news/ (카드, 목록, 버튼), ui/
  db/           Drizzle 스키마, 쿼리(queries/)
  lib/          rss/ (소스·파서), claude/, notion/, env.ts
drizzle/        마이그레이션
```

RSS 소스는 `src/lib/rss/sources.ts`에서 관리합니다. 현재 소스는 TechCrunch(AI), The Verge(AI)이며 배열에 한 줄을 추가하면 늘릴 수 있습니다.

## 사용한 플러그인

- frontend-design : UI 품질 향상
- commit-commands : 깃 워크플로 자동화

## 문서

- `PRD.md` — 제품 요구사항
- `ui.md` — UI 가이드
- `CLAUDE.md` / `AGENTS.md` — AI 코딩 도우미용 안내

## 향후 과제

자동 스케줄링 수집, RSS 소스 관리 UI, 알림, 기사 검색, 즐겨찾기, 카테고리 수정·삭제.
