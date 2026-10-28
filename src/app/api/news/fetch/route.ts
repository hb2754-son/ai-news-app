import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { insertArticles } from "@/db/queries/articles";
import { fetchRecentItems } from "@/lib/rss/parser";
import { RSS_SOURCES } from "@/lib/rss/sources";

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

    const inserted = await insertArticles(items);
    revalidatePath("/dashboard");

    return Response.json({
      fetched: items.length,
      inserted,
      skipped: items.length - inserted,
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
