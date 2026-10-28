import Parser from "rss-parser";
import type { RssSource } from "@/lib/rss/sources";

export type FeedItem = {
  url: string;
  source: string;
  author: string | null;
  title: string;
  summary: string;
  publishedAt: Date;
};

export type FetchResult = {
  items: FeedItem[];
  failedSources: string[];
};

const SUMMARY_MAX_LENGTH = 300;

const parser = new Parser({
  timeout: 15_000,
  headers: { "User-Agent": "Mozilla/5.0 (compatible; ai-news-collector)" },
});

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string) {
  return text.length > SUMMARY_MAX_LENGTH
    ? `${text.slice(0, SUMMARY_MAX_LENGTH).trimEnd()}…`
    : text;
}

// 같은 기사가 추적 파라미터·해시·끝 슬래시만 달라 중복 저장되지 않도록 URL을 정규화한다.
function normalizeUrl(raw: string) {
  try {
    const url = new URL(raw.trim());
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (key.startsWith("utm_") || key === "guccounter") {
        url.searchParams.delete(key);
      }
    }
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString();
  } catch {
    return raw.trim();
  }
}

async function fetchSource(source: RssSource, since: Date): Promise<FeedItem[]> {
  const feed = await parser.parseURL(source.url);

  return feed.items.flatMap((item) => {
    const publishedAt = new Date(item.isoDate ?? item.pubDate ?? "");
    if (!item.link || !item.title || Number.isNaN(publishedAt.getTime())) return [];
    if (publishedAt < since) return [];

    const summary = truncate(
      stripHtml(item.contentSnippet ?? item.summary ?? item.content ?? ""),
    );
    return [
      {
        url: normalizeUrl(item.link),
        source: source.name,
        author: item.creator ?? null,
        title: item.title.trim(),
        // 번역 전 임시값: RSS 원문 요약을 그대로 쓴다. 비어 있으면 제목으로 대체 (summary_ko NOT NULL)
        summary: summary || item.title.trim(),
        publishedAt,
      },
    ];
  });
}

// 소스 한 곳이 실패해도 나머지는 계속 진행한다.
export async function fetchRecentItems(
  sources: RssSource[],
  hours = 24,
): Promise<FetchResult> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const settled = await Promise.allSettled(
    sources.map((source) => fetchSource(source, since)),
  );

  // 이번 수집분 안에서도 URL이 같은 기사는 하나만 남긴다.
  const byUrl = new Map<string, FeedItem>();
  const failedSources: string[] = [];
  settled.forEach((result, i) => {
    if (result.status === "fulfilled") {
      for (const item of result.value) {
        if (!byUrl.has(item.url)) byUrl.set(item.url, item);
      }
    } else {
      failedSources.push(sources[i].name);
    }
  });
  const items = [...byUrl.values()];

  return { items, failedSources };
}
