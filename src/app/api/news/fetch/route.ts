import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { findExistingUrls, getCategories, insertArticles } from "@/db/queries";
import { translateAndClassify } from "@/lib/claude";
import { fetchFeed, filterRecent, type FeedArticle } from "@/lib/rss";
import { NEWS_SOURCES } from "@/lib/sources";

// 이 시간(시간 단위) 이내에 발행된 기사만 가져온다.
const RECENT_HOURS = 96;
// 한 번에 Claude로 처리하는 새 기사 수 상한 (타임아웃·비용). 나머지는 다음 클릭 때 처리.
const MAX_NEW_PER_RUN = 20;

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 소스 하나가 실패해도 나머지는 처리한다.
  const results = await Promise.allSettled(NEWS_SOURCES.map(fetchFeed));

  const collected: FeedArticle[] = [];
  const failedSources: string[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      collected.push(...filterRecent(r.value, RECENT_HOURS));
    } else {
      console.error(`RSS 수집 실패 (${NEWS_SOURCES[i].name})`, r.reason);
      failedSources.push(NEWS_SOURCES[i].name);
    }
  });

  // 같은 url이 한 번에 두 번 들어오지 않도록 정리
  const unique = [...new Map(collected.map((a) => [a.url, a])).values()];

  try {
    // 저장 전에 이미 있는 URL을 걸러 Claude 호출을 줄인다.
    const existing = await findExistingUrls(userId, unique.map((a) => a.url));
    const fresh = unique.filter((a) => !existing.has(a.url));
    const targets = fresh
      .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0))
      .slice(0, MAX_NEW_PER_RUN);

    const cats = await getCategories(userId);
    const processed = await translateAndClassify(
      targets,
      cats.map((c) => ({ id: c.id, name: c.name, description: c.description })),
    );

    // Claude 처리에 실패한 기사는 저장하지 않는다. (다음 가져오기에서 재시도)
    const rows = targets.flatMap((a) => {
      const p = processed.get(a.url);
      return p ? [{ ...a, ...p }] : [];
    });
    const inserted = await insertArticles(userId, rows);

    return NextResponse.json({
      inserted,
      skipped: unique.length - fresh.length,
      failed: targets.length - rows.length,
      remaining: fresh.length - targets.length,
      failedSources,
    });
  } catch (e) {
    console.error("뉴스 처리 실패", e);
    return NextResponse.json({ error: "뉴스를 처리하지 못했어요." }, { status: 500 });
  }
}
