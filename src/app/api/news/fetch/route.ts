import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getExistingUrls, insertArticles } from "@/db/queries/articles";
import { getAllCategories } from "@/db/queries/categories";
import { enrichArticles } from "@/lib/claude/summarize";
import { fetchRecentItems } from "@/lib/rss/parser";
import { RSS_SOURCES } from "@/lib/rss/sources";

// Claude 배치 호출이 순차로 실행되므로 기본 제한보다 넉넉하게 둔다.
export const maxDuration = 60;

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const { items, failedSources } = await fetchRecentItems(RSS_SOURCES, 24);

    // 모든 소스가 실패한 경우만 오류로 처리한다.
    if (items.length === 0 && failedSources.length === RSS_SOURCES.length) {
      return Response.json(
        { error: "모든 RSS 소스를 불러오지 못했어요.", failedSources },
        { status: 502 },
      );
    }

    // 이미 저장된 기사는 Claude를 호출하지 않는다.
    const existing = await getExistingUrls(items.map((item) => item.url));
    const newItems = items.filter((item) => !existing.has(item.url));

    const categories = await getAllCategories();
    const enriched = await enrichArticles(newItems, categories);
    const categoryIdByName = new Map(categories.map((c) => [c.name, c.id]));

    const inserted = await insertArticles(
      newItems.map((item, i) => {
        const result = enriched[i];
        if (!result) return item;
        return {
          ...item,
          titleKo: result.titleKo,
          summaryKo: result.summaryKo,
          categoryId: result.categoryName
            ? (categoryIdByName.get(result.categoryName) ?? null)
            : null,
        };
      }),
    );
    revalidatePath("/dashboard");

    return Response.json({
      fetched: items.length,
      inserted,
      skipped: items.length - inserted,
      enrichFailed: enriched.filter((r) => !r).length,
      failedSources,
    });
  } catch (error) {
    console.error("[news/fetch]", error);
    return Response.json(
      { error: "뉴스를 가져오는 중 문제가 생겼어요." },
      { status: 500 },
    );
  }
}
