# PRD: AI 뉴스 수집기

## 1. 개요 및 목표
해외 AI 뉴스를 RSS로 수집하고, Claude가 한국어로 번역·요약·카테고리 분류한 결과를 카드 형태로 보여주는 웹 앱이다. 사용자는 원하는 뉴스를 Notion에 저장할 수 있다.

**목표**
- 영어 AI 뉴스를 빠르게 훑어볼 수 있는 한국어 요약 피드 제공
- 관심 주제별(카테고리)로 뉴스를 골라 보기
- 읽을 만한 뉴스를 Notion으로 손쉽게 보관

## 2. 대상 사용자
- 해외 AI 동향을 한국어로 빠르게 파악하고 싶은 사용자
- 다중 사용자 앱이다. 카테고리, 뉴스, Notion 연동은 모두 사용자별로 분리한다.

## 3. 핵심 사용자 흐름
1. 앱 실행 → 로그인(Clerk). 미로그인 시 메인 화면 접근 불가
2. "뉴스 가져오기" 버튼 클릭 → RSS 수집
3. Claude가 각 기사를 한국어로 번역·요약하고 카테고리를 자동 분류
4. 결과를 DB에 저장하고 카드 목록으로 표시
5. 카테고리 필터로 원하는 뉴스만 보기
6. 카드의 "Notion 저장" 버튼으로 선택한 뉴스를 Notion에 저장

## 4. 기능 요구사항

### 4.1 인증
- Clerk 기반 회원가입/로그인
- 모든 페이지와 API는 인증 필요 (sign-in, sign-up 제외)
- **수용 기준**: 비로그인 상태로 `/` 접근 시 로그인 페이지로 이동한다.

### 4.2 뉴스 가져오기
- "뉴스 가져오기" 버튼 클릭 시에만 수집한다(자동 스케줄 없음).
- 소스별 RSS를 가져와 사용자 기준으로 URL이 이미 저장된 기사는 건너뛴다.
- 새 기사만 Claude로 번역·요약·분류한다.
- 진행 중 로딩 상태와 완료/실패 메시지를 표시한다.
- **수용 기준**: 같은 기사를 두 번 가져와도 중복 저장되지 않고, 기사 하나가 실패해도 나머지는 저장된다.

### 4.3 번역/요약/분류 (Claude API)
- 제목과 요약을 한국어로 번역·요약한다.
- 사용자의 카테고리 목록 중 하나로 분류하고, 맞는 카테고리가 없으면 '미분류'로 둔다.
- 모든 Claude 호출은 서버에서만 수행한다.

### 4.4 뉴스 카드 목록
- 카드 표시 항목: 한국어 제목, 한국어 요약, 출처, 발행일, 카테고리, 원문 링크, "Notion 저장" 버튼
- 최신순 정렬
- **수용 기준**: 카드를 누르면 원문이 새 탭으로 열린다.

### 4.5 카테고리 관리
- 카테고리 추가, 수정(이름·설명), 삭제를 지원한다.
- 카테고리 필터로 해당 카테고리의 뉴스만 볼 수 있다.
- 카테고리를 삭제하면 해당 뉴스는 '미분류'로 이동한다.
- '재분류' 버튼으로 미분류 뉴스를 Claude로 다시 분류한다.
- 카테고리 설명은 Claude 분류 정확도를 높이는 데 사용한다.
- **수용 기준**: 카테고리 삭제 후에도 뉴스는 사라지지 않고 '미분류'에 보인다.

### 4.6 Notion 저장
- 설정 화면에서 Notion 연동(OAuth)을 한 번 수행한다.
- 카드의 "Notion 저장" 버튼으로 해당 뉴스를 Notion에 저장한다. 저장은 Notion MCP 서버를 통한다.
- 저장 내용: 한국어 제목, 요약, 카테고리, 출처, 원문 링크, 발행일
- 이미 저장한 뉴스는 버튼에 "저장됨"으로 표시한다.
- Notion 미연동 상태에서 버튼을 누르면 연동 안내를 보여준다.

## 5. 뉴스 소스 (RSS)
| 소스 | URL |
|---|---|
| TechCrunch AI | https://techcrunch.com/category/artificial-intelligence/feed/ |
| The Verge AI | https://www.theverge.com/rss/ai-artificial-intelligence/index.xml |
| 슈카월드 | https://www.youtube.com/feeds/videos.xml?channel_id=UCsJ6RuBiTVWRX156FVbeaGg |

※ 구현 시 URL 유효성을 재확인한다. 소스 목록은 코드에서 한 곳(`sources.ts`)으로 관리한다.

## 6. 기술 스택
| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js (App Router) |
| 인증 | Clerk |
| 데이터베이스 | Neon (Postgres) + Drizzle ORM |
| 번역/요약/분류 | Claude API |
| Notion 저장 | Notion MCP 서버 (사용자별 OAuth) |

## 7. 데이터 모델
구현: `src/db/schema.ts` (Drizzle). 컬럼은 DB에서 snake_case로 저장된다.
- **categories**: id(identity), userId, name, description(기본 빈 문자열), createdAt
  - `userId` 인덱스
- **articles**: id(identity), userId, url, source, originalTitle, originalSummary(기본 빈 문자열), titleKo, summaryKo, publishedAt(nullable), categoryId(nullable), createdAt
  - `(userId, url)` 유니크
  - `(userId, publishedAt)` 인덱스(최신순 조회), `categoryId` 인덱스
  - categoryId가 null이면 '미분류'. 카테고리 삭제 시 `ON DELETE SET NULL`
  - RSS에 발행일이 없는 항목이 있을 수 있어 publishedAt은 null 허용
- **notion_connections**: userId(PK, 사용자당 1개), accessTokenEnc, refreshTokenEnc(nullable), expiresAt(nullable), targetType, targetId(둘 다 nullable, 저장 구조 미정), createdAt, updatedAt
  - 토큰은 `TOKEN_ENCRYPTION_KEY`로 암호화한 값만 저장
- **saved_to_notion**: id(identity), articleId(FK, `ON DELETE CASCADE`), userId, notionPageId, savedAt
  - `articleId` 유니크(기사당 한 번만 저장), `userId` 인덱스

## 8. 프로젝트 폴더 구조
```
ai-news-collector/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                      # 카드 목록 + 카테고리 필터
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   ├── sign-up/[[...sign-up]]/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── settings/page.tsx             # Notion 연동
│   │   └── api/
│   │       ├── news/fetch/route.ts
│   │       ├── news/reclassify/route.ts
│   │       ├── notion/connect/route.ts
│   │       ├── notion/callback/route.ts
│   │       └── notion/save/route.ts
│   ├── components/                       # news-card, news-list, category-filter, category-form, fetch-news-button
│   ├── lib/                              # rss.ts, sources.ts, claude.ts, notion-mcp.ts, actions/
│   ├── db/                               # index.ts, schema.ts, queries.ts
│   └── middleware.ts                     # Clerk 인증 보호
├── drizzle/                              # 마이그레이션
├── drizzle.config.ts
├── .env.local / .env.example
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 9. 비기능 요구사항
- **보안**: Claude, Notion, DB 키와 OAuth 토큰은 서버에서만 사용하고 클라이언트에 노출하지 않는다. `.env.local`은 커밋하지 않는다.
- **데이터 분리**: 모든 쿼리는 Clerk `userId`로 필터링한다.
- **비용 관리**: URL 기준 중복 제거로 불필요한 Claude 호출을 막는다.
- **안정성**: 기사 단위로 실패를 격리하고, 소스 하나가 실패해도 다른 소스는 처리한다.
- **타임아웃**: 서버리스 실행 시간 제한을 고려해 한 번에 처리하는 기사 수를 제한하거나 병렬 처리한다.

## 10. 위험 요소
| 위험 | 대응 |
|---|---|
| Notion MCP는 사용자별 OAuth 토큰 관리·갱신이 필요해 가장 복잡하다 | 설정 화면에서 연동 상태를 명확히 보여주고, 토큰 만료 시 재연동을 안내한다. 필요하면 공식 Notion API 사용을 재검토한다. |
| RSS가 전문 대신 발췌만 제공할 수 있어 요약 품질에 한계가 있다 | 초기에는 RSS 발췌 기준으로 요약하고, 품질을 보고 본문 수집을 검토한다. |
| 기사 수가 많으면 Claude 호출 비용·시간이 늘어난다 | 중복 제거, 한 번에 처리하는 기사 수 제한, 경량 모델 사용을 검토한다. |
| 서버리스 함수 시간 제한 | 기사 수 제한 또는 분할 처리 |

## 11. 범위 밖 (현재 버전)
- 자동 스케줄 수집, 푸시/이메일 알림
- 뉴스 검색, 북마크, 읽음 표시
- 소스 추가·삭제 UI (소스는 코드로 관리)

## 12. 미정 사항
- 기본 카테고리 목록 (예: LLM, 이미지·영상, 로봇, 정책·규제, 비즈니스)
- Notion 저장 구조 (특정 데이터베이스에 저장할지, 페이지로 만들지)
- 배포 환경 (Vercel 등)
