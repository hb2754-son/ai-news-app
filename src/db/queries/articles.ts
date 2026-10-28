import { count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

export const ARTICLES_PER_PAGE = 9;

// 최신순: 발행일 내림차순(발행일 없는 기사는 뒤로), 같으면 수집 시각 내림차순
// 페이지 사이에 순서가 흔들리지 않도록 마지막에 id로 한 번 더 정렬한다.
export async function getArticles(categoryId?: number, page = 1) {
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
    .orderBy(
      sql`${articles.publishedAt} desc nulls last`,
      desc(articles.fetchedAt),
      desc(articles.id),
    )
    .limit(ARTICLES_PER_PAGE)
    .offset((page - 1) * ARTICLES_PER_PAGE);
}

// 카테고리 필터가 적용된 전체 기사 수 (페이지 수 계산용)
export async function getArticleCount(categoryId?: number) {
  const [row] = await db
    .select({ total: count() })
    .from(articles)
    .where(categoryId === undefined ? undefined : eq(articles.categoryId, categoryId));
  return row.total;
}

export type ArticleListItem = Awaited<ReturnType<typeof getArticles>>[number];

// url이 이미 있는 기사는 건너뛰고, 새로 저장된 건수를 반환한다.
// 번역 전 단계라 title_ko / summary_ko는 원문 값으로 임시 채운다.
export async function insertArticles(
  items: {
    url: string;
    source: string;
    author: string | null;
    title: string;
    summary: string;
    publishedAt: Date;
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
        titleKo: item.title,
        summaryKo: item.summary,
        publishedAt: item.publishedAt,
      })),
    )
    .onConflictDoNothing({ target: articles.url })
    .returning({ id: articles.id });

  return inserted.length;
}

export async function getArticleTotal() {
  const [row] = await db.select({ total: count() }).from(articles);
  return row.total;
}
