import { XMLParser } from "fast-xml-parser";
import type { NewsSource } from "./sources";

export type FeedArticle = {
  url: string;
  source: string;
  originalTitle: string;
  originalSummary: string;
  publishedAt: Date | null;
};

const FETCH_TIMEOUT_MS = 10_000;
const MAX_ITEMS_PER_SOURCE = 30;
const SUMMARY_MAX_LENGTH = 1000;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  // 항목이 1개여도 배열로 받는다.
  isArray: (name) => name === "item" || name === "entry" || name === "link",
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Node = any;

/** 문자열 또는 { "#text": ... } 형태의 노드에서 텍스트를 꺼낸다. */
function text(node: Node): string {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (typeof node === "object" && "#text" in node) return text(node["#text"]);
  return "";
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

/** RSS의 <link>는 문자열, Atom의 <link>는 href 속성을 가진다. */
function extractLink(links: Node): string {
  const list: Node[] = Array.isArray(links) ? links : links ? [links] : [];
  for (const l of list) {
    if (typeof l === "string") return l.trim();
  }
  const alt =
    list.find((l) => l?.["@_rel"] === "alternate") ??
    list.find((l) => l?.["@_href"] && !l?.["@_rel"]);
  return String(alt?.["@_href"] ?? "").trim();
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalize(item: Node, source: string): FeedArticle | null {
  const url = extractLink(item.link);
  const title = stripHtml(text(item.title));
  if (!url || !title) return null;

  const rawSummary =
    text(item.description) ||
    text(item.summary) ||
    text(item.content) ||
    text(item["media:group"]?.["media:description"]); // YouTube
  const summary = stripHtml(rawSummary).slice(0, SUMMARY_MAX_LENGTH);

  const publishedAt = parseDate(
    text(item.pubDate) || text(item.published) || text(item.updated),
  );

  return {
    url,
    source,
    originalTitle: title,
    originalSummary: summary,
    publishedAt,
  };
}

/** 한 소스의 RSS/Atom 피드를 가져와 정규화한다. 실패하면 예외를 던진다. */
export async function fetchFeed(source: NewsSource): Promise<FeedArticle[]> {
  const res = await fetch(source.url, {
    headers: { "User-Agent": "ai-news-collector/0.1" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`${source.name}: HTTP ${res.status}`);
  }

  const xml = await res.text();
  const doc = parser.parse(xml);
  const items: Node[] = doc?.rss?.channel?.item ?? doc?.feed?.entry ?? [];

  return items
    .slice(0, MAX_ITEMS_PER_SOURCE)
    .map((item) => normalize(item, source.name))
    .filter((a): a is FeedArticle => a !== null);
}

/** 지난 hours시간 이내에 발행된 기사만 남긴다. 발행일이 없으면 제외한다. */
export function filterRecent(
  articles: FeedArticle[],
  hours = 24,
  now = Date.now(),
): FeedArticle[] {
  const threshold = now - hours * 60 * 60 * 1000;
  return articles.filter(
    (a) => a.publishedAt !== null && a.publishedAt.getTime() >= threshold,
  );
}
