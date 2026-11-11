import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// 서버에서만 사용. 공식 Notion MCP 서버(@notionhq/notion-mcp-server)를
// stdio 자식 프로세스로 띄워 호출한다. 토큰은 서버 환경변수에서만 읽는다.

export type NotionNewsInput = {
  titleKo: string;
  summaryKo: string;
  categoryName: string | null;
  url: string;
  publishedAt: Date | null;
};

const RICH_TEXT_LIMIT = 2000; // Notion rich text 블록 1개 글자 수 제한

const kstDate = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" });

let dataSourceId: string | undefined;

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} 환경변수가 없습니다.`);
  return value;
}

/** MCP 도구 호출 결과(JSON 텍스트)를 파싱한다. 실패하면 예외. */
function parseResult(
  name: string,
  result: Awaited<ReturnType<Client["callTool"]>>,
) {
  const first = Array.isArray(result.content) ? result.content[0] : undefined;
  const text = first && "text" in first ? String(first.text) : "";
  if (result.isError) throw new Error(`${name} 실패: ${text.slice(0, 300)}`);
  return JSON.parse(text) as Record<string, unknown>;
}

async function withNotionClient<T>(fn: (client: Client) => Promise<T>) {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [
      path.join(
        process.cwd(),
        "node_modules/@notionhq/notion-mcp-server/bin/cli.mjs",
      ),
    ],
    env: { ...process.env, NOTION_TOKEN: requireEnv("NOTION_API_TOKEN") } as Record<
      string,
      string
    >,
  });
  const client = new Client({ name: "ai-news-collector", version: "0.1.0" });
  await client.connect(transport);
  try {
    return await fn(client);
  } finally {
    await client.close();
  }
}

/** NOTION_DATABASE(데이터베이스 ID)의 첫 data source ID를 찾는다. */
async function getDataSourceId(client: Client) {
  if (dataSourceId) return dataSourceId;
  const db = parseResult(
    "API-retrieve-a-database",
    await client.callTool({
      name: "API-retrieve-a-database",
      arguments: { database_id: requireEnv("NOTION_DATABASE") },
    }),
  );
  const sources = db.data_sources as { id: string }[] | undefined;
  if (!sources?.[0]) throw new Error("Notion 데이터베이스를 찾지 못했어요.");
  dataSourceId = sources[0].id;
  return dataSourceId;
}

/** 뉴스 1건을 Notion 데이터베이스에 페이지로 저장하고 페이지 ID를 반환한다. */
export async function saveNewsToNotion(news: NotionNewsInput) {
  return withNotionClient(async (client) => {
    const dsId = await getDataSourceId(client);

    // Select 옵션 이름에는 쉼표를 쓸 수 없다.
    const category = (news.categoryName ?? "미분류").replace(/,/g, " ");

    const properties: Record<string, unknown> = {
      제목: { title: [{ text: { content: news.titleKo.slice(0, RICH_TEXT_LIMIT) } }] },
      요약: {
        rich_text: [{ text: { content: news.summaryKo.slice(0, RICH_TEXT_LIMIT) } }],
      },
      카테고리: { select: { name: category } },
      출처: { url: news.url },
    };
    if (news.publishedAt) {
      properties["날짜"] = { date: { start: kstDate.format(news.publishedAt) } };
    }

    const page = parseResult(
      "API-post-page",
      await client.callTool({
        name: "API-post-page",
        arguments: {
          parent: { type: "data_source_id", data_source_id: dsId },
          properties,
        },
      }),
    );
    if (typeof page.id !== "string") throw new Error("Notion 페이지 ID가 없어요.");
    return page.id;
  });
}
