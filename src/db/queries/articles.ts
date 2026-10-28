import { count, desc, eq, inArray, sql } from "drizzle-orm";
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
      categoryId: articles.categoryId,
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

export async function getArticleTotal() {
  const [row] = await db.select({ total: count() }).from(articles);
  return row.total;
}
