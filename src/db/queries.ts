import { and, count, desc, eq, isNull, sql } from "drizzle-orm";
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
};

/**
 * 새 기사만 저장하고 실제로 저장된 개수를 반환한다. ((userId, url) 중복은 건너뜀)
 * 번역 전이므로 titleKo/summaryKo는 원문으로 채운다. categoryId는 null(미분류).
 */
export async function insertArticles(userId: string, rows: NewArticle[]) {
  if (rows.length === 0) return 0;

  const inserted = await db
    .insert(articles)
    .values(
      rows.map((r) => ({
        userId,
        url: r.url,
        source: r.source,
        originalTitle: r.originalTitle,
        originalSummary: r.originalSummary,
        titleKo: r.originalTitle,
        summaryKo: r.originalSummary,
        publishedAt: r.publishedAt,
      })),
    )
    .onConflictDoNothing({ target: [articles.userId, articles.url] })
    .returning({ id: articles.id });

  return inserted.length;
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
