import { and, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

export const ARTICLES_PER_PAGE = 9;

// 카테고리·키워드 조건. 키워드는 한국어 제목·요약·영어 원제에서 대소문자 구분 없이 찾는다.
function buildWhere(categoryId?: number, keyword?: string) {
  const conditions = [];
  if (categoryId !== undefined) conditions.push(eq(articles.categoryId, categoryId));
  if (keyword) {
    // LIKE 와일드카드(% _ \)는 글자 그대로 검색되도록 이스케이프한다.
    const pattern = `%${keyword.replace(/[\\%_]/g, "\\$&")}%`;
    conditions.push(
      or(
        ilike(articles.titleKo, pattern),
        ilike(articles.summaryKo, pattern),
        ilike(articles.titleOriginal, pattern),
      ),
    );
  }
  return conditions.length > 0 ? and(...conditions) : undefined;
}

// 최신순: 발행일 내림차순(발행일 없는 기사는 뒤로), 같으면 수집 시각 내림차순
// 페이지 사이에 순서가 흔들리지 않도록 마지막에 id로 한 번 더 정렬한다.
export async function getArticles(categoryId?: number, page = 1, keyword?: string) {
  return db
    .select({
      id: articles.id,
      url: articles.url,
      source: articles.source,
      titleOriginal: articles.titleOriginal,
      titleKo: articles.titleKo,
      summaryKo: articles.summaryKo,
      publishedAt: articles.publishedAt,
      fetchedAt: articles.fetchedAt,
      categoryId: articles.categoryId,
      categoryName: categories.name,
      notionPageId: articles.notionPageId,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(buildWhere(categoryId, keyword))
    .orderBy(
      sql`${articles.publishedAt} desc nulls last`,
      desc(articles.fetchedAt),
      desc(articles.id),
    )
    .limit(ARTICLES_PER_PAGE)
    .offset((page - 1) * ARTICLES_PER_PAGE);
}

// 카테고리 필터가 적용된 전체 기사 수 (페이지 수 계산용)
export async function getArticleCount(categoryId?: number, keyword?: string) {
  const [row] = await db
    .select({ total: count() })
    .from(articles)
    .where(buildWhere(categoryId, keyword));
  return row.total;
}

export type ArticleListItem = Awaited<ReturnType<typeof getArticles>>[number];

// 주어진 url 중 이미 저장된 것만 돌려준다 (Claude 호출 전에 신규 기사만 추리는 용도)
export async function getExistingUrls(urls: string[]) {
  if (urls.length === 0) return new Set<string>();
  const rows = await db
    .select({ url: articles.url })
    .from(articles)
    .where(inArray(articles.url, urls));
  return new Set(rows.map((row) => row.url));
}

// url이 이미 있는 기사는 건너뛰고, 새로 저장된 건수를 반환한다.
// titleKo / summaryKo / categoryId가 없으면(번역 실패) 원문 값과 미분류로 임시 저장한다.
export async function insertArticles(
  items: {
    url: string;
    source: string;
    author: string | null;
    title: string;
    summary: string;
    publishedAt: Date;
    titleKo?: string;
    summaryKo?: string;
    categoryId?: number | null;
  }[],
) {
  if (items.length === 0) return 0;

  const inserted = await db
    .insert(articles)
    .values(
      items.map((item) => ({
        url: item.url,
        source: item.source,
        author: item.author,
        titleOriginal: item.title,
        titleKo: item.titleKo ?? item.title,
        summaryKo: item.summaryKo ?? item.summary,
        categoryId: item.categoryId ?? null,
        publishedAt: item.publishedAt,
      })),
    )
    .onConflictDoNothing({ target: articles.url })
    .returning({ id: articles.id });

  return inserted.length;
}

// Notion 저장용: 기사 1건과 카테고리 이름
export async function getArticleForNotion(id: number) {
  const [row] = await db
    .select({
      id: articles.id,
      url: articles.url,
      titleKo: articles.titleKo,
      summaryKo: articles.summaryKo,
      publishedAt: articles.publishedAt,
      fetchedAt: articles.fetchedAt,
      categoryName: categories.name,
      notionPageId: articles.notionPageId,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.id, id));
  return row ?? null;
}

export async function setNotionPageId(id: number, notionPageId: string) {
  await db.update(articles).set({ notionPageId }).where(eq(articles.id, id));
}

export async function getArticleTotal() {
  const [row] = await db.select({ total: count() }).from(articles);
  return row.total;
}

// 기사 1건 삭제. 삭제된 행이 있으면 true.
export async function deleteArticle(id: number) {
  const deleted = await db
    .delete(articles)
    .where(eq(articles.id, id))
    .returning({ id: articles.id });
  return deleted.length > 0;
}
