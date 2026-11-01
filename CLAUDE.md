# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 현황

`PRD.md`가 기준 문서입니다. 현재는 `create-next-app` 기본 템플릿만 있습니다 (Next.js 16.4.3, React 19, Tailwind CSS 4, TypeScript, ESLint, `src/` 디렉토리, 별칭 `@/*` → `src/*`). Clerk, Drizzle, Neon, Claude, Notion 관련 패키지는 아직 설치하지 않았고, 앱 코드도 작성하지 않았습니다.

## 제품 개요

해외 AI 뉴스를 RSS로 수집하고, Claude API로 한국어 번역·요약·카테고리 분류를 한 뒤 카드 형태로 보여주는 웹 앱입니다. 수집은 **수동 실행만** 지원합니다("뉴스가져오기" 버튼, 자동 스케줄링 없음). 로그인한 사용자만 앱을 사용할 수 있습니다.

기능: Clerk 로그인(F1), 뉴스 가져오기(F2), 번역·요약(F3), 자동 분류(F4), 카테고리 필터(F5), 카테고리 관리(F6), 카드별 "Notion 저장"(F7).

핵심 흐름: 로그인 → 버튼 클릭 → 서버가 RSS 수집 → Claude로 번역·요약·분류 → DB 저장 → 카드 표시(제목, 한국어 요약, 카테고리, 출처, 날짜, 원문 링크) → 카테고리 필터 → 필요 시 Notion에 저장.

범위 외(향후 과제): 자동 스케줄링 수집, RSS 소스 관리 UI, 이메일·메신저 알림, 기사 검색, 즐겨찾기.

## 기술 스택

Next.js App Router · Clerk(로그인) · Neon Postgres · Drizzle ORM · Claude API(번역·요약·분류) · Notion MCP 서버.

## 계획된 구조

```
src/
  app/            layout.tsx (ClerkProvider), page.tsx (카드 목록 + 필터),
                  sign-in/[[...sign-in]], sign-up/[[...sign-up]], categories/page.tsx
    api/          news/fetch (POST: 수집→Claude→저장), news (GET, 카테고리 필터),
                  categories (GET, POST), categories/[id] (PATCH, DELETE),
                  notion/save (POST)
  components/     news/ (NewsCard, NewsList, FetchNewsButton, CategoryFilter),
                  categories/ (CategoryForm, CategoryList), ui/
  db/             index.ts (Neon + drizzle), schema.ts, queries/{articles,categories}.ts
  lib/            rss/{sources,parser}.ts, claude/{client,summarize}.ts,
                  notion/mcp-client.ts, env.ts (환경변수 검증)
  types/
  middleware.ts   Clerk 인증 보호
drizzle/, drizzle.config.ts   마이그레이션
.env.local / .env.example
```

설계 원칙:
- 외부 서비스(RSS, Claude, Notion)는 `lib/` 아래에서 서비스별로 분리한다.
- DB 쿼리는 `db/queries/`로 분리해 API 라우트를 얇게 유지한다.
- RSS 피드 URL은 `lib/rss/sources.ts`에서 관리하며, 소스를 추가하기 쉬운 구조로 한다. 초기 소스는 TechCrunch(AI)와 The Verge(AI)이다.

## 데이터 모델 (초안)

- `categories`: id, name, description(Claude 분류 프롬프트에 사용), created_at, updated_at
- `articles`: id, url(중복 판별 키), source, title_original, title_ko, summary_ko, category_id → categories, published_at, fetched_at, notion_page_id(선택, Notion 저장 여부·위치)
- 사용자 범위(개인용/공유)에 따라 `user_id` 컬럼 추가 여부가 결정된다.

## 미정 사항 (PRD §8, 괄호 안은 현재 추천안)

1. 중복 처리 (URL 기준으로 이미 있는 기사는 건너뜀)
2. 기사당 카테고리 1개 vs 여러 개, 카테고리 삭제 시 처리 ("미분류"로 둠)
3. 초기 카테고리 기본값 제공 여부 (모델/연구, 제품/서비스, 투자/기업, 규제/정책 등)
4. 사용자 범위: 사용자별 저장 vs 공유
5. Notion 저장 대상 DB/페이지와 저장 항목 (제목, 요약, 링크, 카테고리, 날짜)
6. Notion 연동 방식 (Next.js 서버가 MCP 클라이언트로 직접 호출 vs Claude API의 MCP connector)
7. 배포: 로컬 전용 vs Vercel
8. ~~카테고리 관리를 별도 페이지로 할지 모달로 할지~~ → 확정: **모달**. 카테고리 추가는 모달(이름 + 설명)로 구현됨. 수정·삭제(F6)는 아직 미구현.

이 항목들을 확정하기 전에는 사용자에게 확인하고, 임의로 정하지 않는다.

## 명령어

- `npm run dev` — 개발 서버 (http://localhost:3000)
- `npm run build` / `npm run start` — 프로덕션 빌드 / 실행
- `npm run lint` — ESLint (`eslint.config.mjs`의 flat config)
- 테스트 러너는 아직 설정되어 있지 않다.

## 커스텀 명령어

- `/news-workflow [브랜치-이름]` (`.claude/commands/news-workflow.md`) — 새 기능 개발 워크플로우. main 확인 → 브랜치 생성(이름이 없으면 기능을 물어 영어 소문자-하이픈 형식으로 제안) → 개발 시작 안내 → '완료'/'done' 입력 시 변경 파일 목록·커밋 메시지 제안 후 커밋하고 main에 병합 → 작업 요약. push는 요청이 있을 때만 한다.

## UI 가이드

화면·컴포넌트를 작성하거나 수정하기 전에 `ui.md`를 먼저 읽고 따른다. 앱 이름, 레이아웃(카테고리 바 + 뉴스 카드 그리드), Tailwind 디자인 토큰, 컴포넌트별 스타일, 상태 화면, 접근성 규칙이 정리되어 있다.

## Next.js 버전 주의사항

`AGENTS.md`에 따르면 이 Next.js 버전은 기존 관례와 다른 변경점이 있습니다. Next.js 코드(라우팅, 미들웨어, 라우트 핸들러 등)를 작성하기 전에 `node_modules/next/dist/docs/`의 관련 가이드를 먼저 읽으세요.
