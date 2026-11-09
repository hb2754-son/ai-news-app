import { and, desc, eq, isNull, sql } from "drizzle-orm";
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

/** categoryId: undefined = 전체, null = 미분류, number = 해당 카테고리 */
export async function getArticlesWithCategory(
  userId: string,
  categoryId?: number | null,
) {
  const filter =
    categoryId === undefined
      ? undefined
      : categoryId === null
        ? isNull(articles.categoryId)
        : eq(articles.categoryId, categoryId);

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
    .where(and(eq(articles.userId, userId), filter))
    // 최신순. 발행일이 없는 기사는 뒤로, 같은 시각이면 나중에 저장된 것이 먼저.
    .orderBy(sql`${articles.publishedAt} desc nulls last`, desc(articles.id));
}
