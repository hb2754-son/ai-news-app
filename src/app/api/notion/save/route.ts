import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getArticleForNotion, markSavedToNotion } from "@/db/queries";
import { saveNewsToNotion } from "@/lib/notion-mcp";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const articleId = Number(body?.articleId);
  if (!Number.isInteger(articleId)) {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  try {
    const article = await getArticleForNotion(userId, articleId);
    if (!article) {
      return NextResponse.json({ error: "뉴스를 찾지 못했어요." }, { status: 404 });
    }
    // 이미 저장한 뉴스는 다시 만들지 않는다.
    if (article.savedPageId) {
      return NextResponse.json({ saved: true });
    }

    const pageId = await saveNewsToNotion(article);
    await markSavedToNotion(userId, articleId, pageId);
    return NextResponse.json({ saved: true });
  } catch (e) {
    console.error("Notion 저장 실패", e);
    return NextResponse.json(
      { error: "Notion에 저장하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
