import { and, count, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "./index";
import { articles, categories } from "./schema";

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

/** 조건에 맞는 기사 전체 개수 (페이지 수 계산용) */
export async function countArticles(
  userId: string,
  categoryId?: number | null,
) {
  const [row] = await db
    .select({ total: count() })
    .from(articles)
    .where(and(eq(articles.userId, userId), categoryFilter(categoryId)));
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
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(and(eq(articles.userId, userId), categoryFilter(categoryId)))
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
