import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { insertArticles } from "@/db/queries";
import { fetchFeed, filterRecent, type FeedArticle } from "@/lib/rss";
import { NEWS_SOURCES } from "@/lib/sources";

// 이 시간(시간 단위) 이내에 발행된 기사만 가져온다.
const RECENT_HOURS = 96;

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
    const inserted = await insertArticles(userId, unique);
    return NextResponse.json({
      inserted,
      skipped: unique.length - inserted,
      failedSources,
    });
  } catch (e) {
    console.error("기사 저장 실패", e);
    return NextResponse.json({ error: "기사를 저장하지 못했어요." }, { status: 500 });
  }
}
