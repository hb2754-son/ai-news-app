# AI 뉴스 수집기

해외 AI 뉴스를 RSS로 수집하고, Claude가 한국어로 번역·요약·카테고리 분류해 카드 목록으로 보여주는 다중 사용자 웹 앱입니다. 마음에 드는 뉴스는 버튼 한 번으로 Notion 데이터베이스에 저장할 수 있습니다.

## 주요 기능

- **로그인(Clerk)**: 로그인/회원가입을 제외한 모든 페이지와 API는 인증이 필요합니다. 데이터는 사용자별로 분리됩니다.
- **뉴스 가져오기**: 버튼을 눌렀을 때만 RSS를 수집합니다(자동 스케줄 없음). 이미 저장된 URL은 건너뛰고 새 기사만 Claude로 처리하며, 소스나 기사 하나가 실패해도 나머지는 계속 처리합니다.
- **번역·요약·분류**: 제목과 요약을 한국어로 만들고, 사용자가 정의한 카테고리 중 하나로 분류합니다(없으면 '미분류').
- **카드 목록**: 한국어 제목·요약, 출처, 발행일, 카테고리를 최신순으로 보여주며 카테고리 필터와 페이지 나눔을 지원합니다. 카드를 누르면 원문이 새 탭에서 열립니다.
- **카테고리 관리**: 추가, 수정(이름·설명), 삭제. 삭제해도 뉴스는 '미분류'로 남고, '재분류' 버튼으로 Claude가 다시 분류합니다.
- **Notion 저장**: 카드의 "뉴스 저장" 버튼을 누르면 Notion MCP 서버를 통해 데이터베이스에 저장하고, 저장된 카드는 "저장됨"으로 표시됩니다.

## 뉴스 소스

`src/lib/sources.ts`에서 관리합니다.

| 소스 | 형식 |
|---|---|
| TechCrunch AI | RSS |
| The Verge AI | RSS |
| 슈카월드 | YouTube 채널 피드(Atom) |

## 기술 스택

- [Next.js](https://nextjs.org) 16 (App Router) · React 19 · Tailwind CSS 4
- [Clerk](https://clerk.com) — 인증
- [Neon](https://neon.tech) Postgres + [Drizzle ORM](https://orm.drizzle.team)
- Claude API (`@anthropic-ai/sdk`) — 번역·요약·분류
- `fast-xml-parser` — RSS/Atom 파싱
- Notion MCP 서버(`@notionhq/notion-mcp-server`) + `@modelcontextprotocol/sdk` — Notion 저장

## 시작하기

### 1. 설치

```bash
npm install
```

### 2. 환경 변수

프로젝트 루트에 `.env.local`을 만들고 아래 값을 채웁니다. 이 파일은 커밋하지 않습니다.

| 변수 | 설명 |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 공개 키 |
| `CLERK_SECRET_KEY` | Clerk 시크릿 키 |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | 로그인 경로 (`/sign-in`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | 회원가입 경로 (`/sign-up`) |
| `DATABASE_URL` | Neon Postgres 연결 문자열 |
| `ANTHROPIC_API_KEY` | Claude API 키 |
| `NOTION_API_TOKEN` | Notion 내부 통합(Integration) 토큰 |
| `NOTION_DATABASE` | 뉴스를 저장할 Notion 데이터베이스 ID |

### 3. Notion 데이터베이스 준비

1. Notion에서 내부 통합을 만들고 토큰을 `NOTION_API_TOKEN`에 넣습니다.
2. 저장용 데이터베이스를 만들고 해당 통합에 연결(공유)한 뒤, 데이터베이스 ID를 `NOTION_DATABASE`에 넣습니다.
3. 데이터베이스에 아래 속성이 **이 이름 그대로** 있어야 합니다.

| 속성 | 타입 | 값 |
|---|---|---|
| 제목 | Title | 한국어 제목 |
| 요약 | Rich text | 한국어 요약 |
| 카테고리 | Select | 카테고리 이름 (없으면 "미분류") |
| 출처 | URL | 기사 원문 주소 |
| 날짜 | Date | 발행일 |

### 4. 데이터베이스 마이그레이션

```bash
npx drizzle-kit migrate
```

예제 데이터가 필요하면 `npx tsx scripts/seed.ts`로 시드할 수 있습니다.

### 5. 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에 접속하면 로그인 페이지로 이동합니다.

## 명령어

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 |
| `npm run lint` | ESLint |

## 폴더 구조

```
src/
├─ app/
│  ├─ dashboard/        메인 화면(카드 목록)
│  ├─ categories/       카테고리 관리
│  ├─ sign-in, sign-up/ Clerk 인증 화면
│  └─ api/
│     ├─ news/fetch        RSS 수집 → Claude 처리 → DB 저장
│     ├─ news/reclassify   미분류 뉴스 재분류
│     └─ notion/save       뉴스를 Notion에 저장
├─ components/          뉴스 카드, 카테고리 바, 버튼 등 UI
├─ lib/                 rss, sources, claude, notion-mcp, actions/
├─ db/                  Drizzle 스키마와 쿼리
└─ proxy.ts             Clerk 인증 보호
drizzle/                마이그레이션
```

## 참고

- 모든 DB 쿼리는 Clerk `userId`로 필터링하고, Claude·Notion·DB 키는 서버에서만 사용합니다.
- Notion 저장은 `NOTION_API_TOKEN` 하나로 지정한 데이터베이스 하나에 저장하는 구조입니다. 로그인한 모든 사용자의 뉴스가 같은 데이터베이스로 들어갑니다.
- Notion MCP 서버를 자식 프로세스로 실행하므로, 서버리스 환경(예: Vercel)에서는 동작하지 않을 수 있습니다.
- RSS는 발췌만 제공하는 경우가 있어 요약은 발췌 기준입니다.
- 자세한 요구사항은 [PRD.md](./PRD.md), UI 가이드는 [ui.md](./ui.md)를 참고하세요.
