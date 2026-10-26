import { count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

// 최신순: 발행일 내림차순(발행일 없는 기사는 뒤로), 같으면 수집 시각 내림차순
export async function getArticles(categoryId?: number) {
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
      categoryName: categories.name,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(categoryId === undefined ? undefined : eq(articles.categoryId, categoryId))
    .orderBy(sql`${articles.publishedAt} desc nulls last`, desc(articles.fetchedAt));
}

export type ArticleListItem = Awaited<ReturnType<typeof getArticles>>[number];

export async function getArticleTotal() {
  const [row] = await db.select({ total: count() }).from(articles);
  return row.total;
}
