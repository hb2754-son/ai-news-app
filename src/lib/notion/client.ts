import { requireEnv } from "@/lib/env";

const NOTION_VERSION = "2022-06-28";
const TEXT_MAX = 2000; // Notion rich_text 한 덩어리의 길이 제한

export type NotionNewsInput = {
  title: string;
  summary: string;
  url: string;
  category: string | null;
  date: Date;
};

// 'AI 뉴스 북마크' 데이터베이스에 기사 1건을 페이지로 만들고 페이지 id를 돌려준다.
// 속성: 제목(title) · 텍스트(rich text) · 출처(url) · 카테고리(select) · 날짜(date)
export async function createNewsPage(input: NotionNewsInput): Promise<string> {
  const token = requireEnv("NOTION_API_TOKEN");
  const databaseId = requireEnv("NOTION_DATABASE_ID");

  const properties: Record<string, unknown> = {
    제목: { title: [{ text: { content: input.title.slice(0, TEXT_MAX) } }] },
    텍스트: { rich_text: [{ text: { content: input.summary.slice(0, TEXT_MAX) } }] },
    출처: { url: input.url },
    날짜: { date: { start: input.date.toISOString() } },
  };
  if (input.category) {
    properties["카테고리"] = { select: { name: input.category.replaceAll(",", " ") } };
  }

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ parent: { database_id: databaseId }, properties }),
  });

  if (!response.ok) {
    throw new Error(`Notion API ${response.status}: ${await response.text()}`);
  }
  const page: { id: string } = await response.json();
  return page.id;
}
