# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

해외 AI 뉴스를 RSS로 수집하고, Claude가 한국어로 번역·요약·카테고리 분류해 카드 목록으로 보여주는 다중 사용자 웹 앱. 사용자는 원하는 뉴스를 Notion에 저장할 수 있다. 상세 요구사항은 `PRD.md`(한국어)가 기준이며, 현재는 `create-next-app` 뼈대와 의존성만 설치된 상태로 앱 코드는 아직 없다.

## UI 가이드

화면 구성, 카드·카테고리 바 스타일 등 UI를 만들거나 수정할 때는 `ui.md`를 먼저 읽고 따른다.

## 명령어

- `npm run dev` / `npm run build` / `npm run start`
- `npm run lint` (ESLint)
- 테스트 러너는 아직 없다.
- `drizzle-kit`은 설치만 됐고 `drizzle.config.ts`와 `drizzle/` 마이그레이션은 아직 없다.

## Next.js 버전 주의

Next.js 16.4.5 / React 19.3. `AGENTS.md`에 따르면 학습된 지식과 API·규칙·파일 구조가 다를 수 있으므로, 코드를 쓰기 전에 `node_modules/next/dist/docs/`의 관련 문서를 먼저 읽는다. PRD의 `src/middleware.ts` 경로 등도 그대로 믿지 말고 확인한다. `AGENTS.md`의 해당 블록은 `next dev`가 다시 생성한다.

## 기술 스택

Next.js(App Router) · Clerk(인증) · Neon Postgres + Drizzle ORM · Claude API(` xanthropic-ai/sdk`) · Notion MCP 서버(`@modelcontextprotocol/sdk`, 사용자별 OAuth) · RSS 파싱 `fast-xml-parser`.

## 핵심 흐름

로그인(Clerk) → "뉴스 가져오기" 클릭 → RSS 수집 → 새 기사만 Claude로 번역·요약·분류 → DB 저장 → 카드 목록 표시 → 카테고리 필터 → 카드의 "Notion 저장".

## 기능 규칙 (수용 기준 포함)

- **인증**: sign-in, sign-up을 제외한 모든 페이지와 API는 인증 필요. 비로그인으로 `/` 접근 시 로그인 페이지로 이동.
- **뉴스 가져오기**: 버튼 클릭 시에만 수집(자동 스케줄 없음). 사용자 기준으로 URL이 이미 저장된 기사는 건너뛰고 새 기사만 Claude 호출. 진행 중 로딩과 완료/실패 메시지 표시. 같은 기사를 두 번 가져와도 중복 저장 금지, 기사 하나가 실패해도 나머지는 저장, 소스 하나가 실패해도 다른 소스는 처리.
- **Claude 처리**: 제목·요약을 한국어로 번역·요약하고, 사용자의 카테고리 중 하나로 분류(없으면 '미분류'). 카테고리 설명을 분류 프롬프트에 활용. 모든 호출은 서버에서만.
- **카드 목록**: 한국어 제목·요약, 출처, 발행일, 카테고리, 원문 링크, "Notion 저장" 버튼. 최신순. 카드 클릭 시 원문을 새 탭으로 연다.
- **카테고리**: 추가/수정(이름·설명)/삭제, 필터. 삭제해도 뉴스는 사라지지 않고 '미분류'로 이동. '재분류' 버튼으로 미분류 뉴스를 Claude로 재분류.
- **Notion 저장**: 설정 화면에서 OAuth 연동 1회. 저장은 Notion MCP 서버 경유. 저장 내용은 한국어 제목, 요약, 카테고리, 출처, 원문 링크, 발행일. 이미 저장한 뉴스는 "저장됨" 표시. 미연동 상태에서 누르면 연동 안내.

## 뉴스 소스

`src/lib/sources.ts` 한 곳에서만 관리한다. 현재 TechCrunch AI, The Verge AI, 슈카월드(YouTube) 세 곳(URL은 PRD §5). 구현 시 URL 유효성을 재확인한다.

## 데이터 모델 (초안)

- `categories`: id, userId, name, description, createdAt
- `articles`: id, userId, url, source, originalTitle, originalSummary, titleKo, summaryKo, publishedAt, categoryId(nullable), createdAt. `(userId, url)` 유니크. `categoryId` null = '미분류', 카테고리 삭제 시 `ON DELETE SET NULL`.
- `notion_connections`: userId, 토큰 정보(암호화 저장), 만료 시각, 저장 대상 정보
- `saved_to_notion`: articleId, userId, notionPageId, savedAt

## 목표 폴더 구조

`src/app`(page, sign-in/sign-up, categories, settings, `api/news/{fetch,reclassify}`, `api/notion/{connect,callback,save}`), `src/components`(news-card, news-list, category-filter, category-form, fetch-news-button), `src/lib`(rss, sources, claude, notion-mcp, actions/), `src/db`(index, schema, queries), Clerk 보호용 middleware, `drizzle/`, `drizzle.config.ts`.

## 비기능 요구사항

- **데이터 분리**: 모든 쿼리는 Clerk `userId`로 필터링.
- **보안**: Claude/Notion/DB 키와 OAuth 토큰은 서버에서만 사용, 클라이언트에 노출 금지. 토큰은 암호화 저장(`TOKEN_ENCRYPTION_KEY`). `.env.local`은 커밋 금지.
- **비용**: URL 중복 제거로 불필요한 Claude 호출을 막고, 경량 모델 사용을 검토.
- **타임아웃**: 서버리스 시간 제한을 고려해 한 번에 처리하는 기사 수를 제한하거나 병렬 처리.
- **Notion MCP 위험**: 사용자별 토큰 관리·갱신이 가장 복잡하다. 연동 상태를 명확히 보여주고 만료 시 재연동을 안내. 필요하면 공식 Notion API로 재검토.
- RSS는 발췌만 제공할 수 있으므로 초기에는 발췌 기준으로 요약한다.

## 범위 밖

자동 스케줄 수집, 푸시/이메일 알림, 뉴스 검색, 북마크, 읽음 표시, 소스 추가·삭제 UI.

## 미정 사항

기본 카테고리 목록(예: LLM, 이미지·영상, 로봇, 정책·규제, 비즈니스), Notion 저장 구조(데이터베이스 vs 페이지), 배포 환경(Vercel 등).

## 환경 변수

`.env.local`에 Clerk 키, `DATABASE_URL`, `ANTHROPIC_API_KEY`, Notion OAuth 값, `TOKEN_ENCRYPTION_KEY`가 정의돼 있다(일부는 비어 있음). `.env.example`은 의도적으로 두지 않았다.
