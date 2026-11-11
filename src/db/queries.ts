import {
  and,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  or,
  sql,
} from "drizzle-orm";
import { db } from "./index";
import { articles, categories, savedToNotion } from "./schema";

// 서버에서만 사용. 모든 쿼리는 userId로 필터링한다.

export async function getCategories(userId: string) {
  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.createdAt, categories.id);
}

export type NewArticle = {
  url: string;
  source: string;
  originalTitle: string;
  originalSummary: string;
  publishedAt: Date | null;
  titleKo: string;
  summaryKo: string;
  categoryId: number | null;
};

/** 이미 저장된 URL만 골라 돌려준다. (Claude 호출 전 중복 제거용) */
export async function findExistingUrls(userId: string, urls: string[]) {
  if (urls.length === 0) return new Set<string>();
  const rows = await db
    .select({ url: articles.url })
    .from(articles)
    .where(and(eq(articles.userId, userId), inArray(articles.url, urls)));
  return new Set(rows.map((r) => r.url));
}

/**
 * 번역·분류가 끝난 기사를 저장하고 실제로 저장된 개수를 반환한다.
 * ((userId, url) 중복은 건너뜀)
 */
export async function insertArticles(userId: string, rows: NewArticle[]) {
  if (rows.length === 0) return 0;

  const inserted = await db
    .insert(articles)
    .values(rows.map((r) => ({ userId, ...r })))
    .onConflictDoNothing({ target: [articles.userId, articles.url] })
    .returning({ id: articles.id });

  return inserted.length;
}

/** 미분류(categoryId null) 기사. 재분류 입력용. */
export async function getUnclassifiedArticles(userId: string, limit: number) {
  return db
    .select({
      id: articles.id,
      url: articles.url,
      source: articles.source,
      originalTitle: articles.originalTitle,
      originalSummary: articles.originalSummary,
    })
    .from(articles)
    .where(and(eq(articles.userId, userId), isNull(articles.categoryId)))
    .orderBy(sql`${articles.publishedAt} desc nulls last`, desc(articles.id))
    .limit(limit);
}

export async function updateArticleCategory(
  userId: string,
  articleId: number,
  categoryId: number,
) {
  await db
    .update(articles)
    .set({ categoryId })
    .where(and(eq(articles.id, articleId), eq(articles.userId, userId)));
}

function categoryFilter(categoryId?: number | null) {
  return categoryId === undefined
    ? undefined
    : categoryId === null
      ? isNull(articles.categoryId)
      : eq(articles.categoryId, categoryId);
}

/** 키워드 검색: 한국어 제목·요약, 원문 제목·요약 중 하나라도 포함하면 일치 (대소문자 무시) */
function keywordFilter(keyword?: string) {
  if (!keyword) return undefined;
  const pattern = `%${keyword.replace(/[\\%_]/g, "\\$&")}%`;
  return or(
    ilike(articles.titleKo, pattern),
    ilike(articles.summaryKo, pattern),
    ilike(articles.originalTitle, pattern),
    ilike(articles.originalSummary, pattern),
  );
}

/** 조건에 맞는 기사 전체 개수 (페이지 수 계산용) */
export async function countArticles(
  userId: string,
  categoryId?: number | null,
  keyword?: string,
) {
  const [row] = await db
    .select({ total: count() })
    .from(articles)
    .where(
      and(
        eq(articles.userId, userId),
        categoryFilter(categoryId),
        keywordFilter(keyword),
      ),
    );
  return row.total;
}

/**
 * categoryId: undefined = 전체, null = 미분류, number = 해당 카테고리
 * limit/offset: 페이지네이션
 */
export async function getArticlesWithCategory(
  userId: string,
  categoryId: number | null | undefined,
  limit: number,
  offset: number,
  keyword?: string,
) {
  return db
    .select({
      id: articles.id,
      url: articles.url,
      source: articles.source,
      titleKo: articles.titleKo,
      summaryKo: articles.summaryKo,
      publishedAt: articles.publishedAt,
      categoryId: articles.categoryId,
      categoryName: categories.name,
      saved: sql<boolean>`${savedToNotion.id} is not null`,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(savedToNotion, eq(savedToNotion.articleId, articles.id))
    .where(
      and(
        eq(articles.userId, userId),
        categoryFilter(categoryId),
        keywordFilter(keyword),
      ),
    )
    // 최신순. 발행일이 없는 기사는 뒤로, 같은 시각이면 나중에 저장된 것이 먼저.
    .orderBy(sql`${articles.publishedAt} desc nulls last`, desc(articles.id))
    .limit(limit)
    .offset(offset);
}

export async function createCategory(
  userId: string,
  name: string,
  description: string,
) {
  await db.insert(categories).values({ userId, name, description });
}

export async function updateCategory(
  userId: string,
  id: number,
  name: string,
  description: string,
) {
  await db
    .update(categories)
    .set({ name, description })
    .where(and(eq(categories.id, id), eq(categories.userId, userId)));
}

/** 삭제하면 해당 기사의 categoryId는 FK(ON DELETE SET NULL)로 null(미분류)이 된다. */
export async function deleteCategory(userId: string, id: number) {
  await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)));
}

/** Notion 저장용 기사 조회 (본인 기사만) + 이미 저장했는지 여부 */
export async function getArticleForNotion(userId: string, articleId: number) {
  const [row] = await db
    .select({
      id: articles.id,
      url: articles.url,
      titleKo: articles.titleKo,
      summaryKo: articles.summaryKo,
      publishedAt: articles.publishedAt,
      categoryName: categories.name,
      savedPageId: savedToNotion.notionPageId,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(savedToNotion, eq(savedToNotion.articleId, articles.id))
    .where(and(eq(articles.id, articleId), eq(articles.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function markSavedToNotion(
  userId: string,
  articleId: number,
  notionPageId: string,
) {
  await db
    .insert(savedToNotion)
    .values({ userId, articleId, notionPageId })
    .onConflictDoNothing({ target: savedToNotion.articleId });
}
