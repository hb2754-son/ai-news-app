import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getArticleForNotion, setNotionPageId } from "@/db/queries/articles";
import { createNewsPage } from "@/lib/notion/client";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let body: { articleId?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }
  const articleId = Number(body.articleId);
  if (!Number.isInteger(articleId) || articleId <= 0) {
    return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  const article = await getArticleForNotion(articleId);
  if (!article) {
    return Response.json({ error: "기사를 찾을 수 없어요." }, { status: 404 });
  }
  // 이미 저장된 기사는 Notion에 중복 생성하지 않는다.
  if (article.notionPageId) {
    return Response.json({ notionPageId: article.notionPageId });
  }

  try {
    const notionPageId = await createNewsPage({
      title: article.titleKo,
      summary: article.summaryKo,
      url: article.url,
      category: article.categoryName,
      date: article.publishedAt ?? article.fetchedAt,
    });
    await setNotionPageId(article.id, notionPageId);
    revalidatePath("/dashboard");
    return Response.json({ notionPageId }, { status: 201 });
  } catch (error) {
    console.error("[notion/save]", error);
    return Response.json(
      { error: "Notion에 저장하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
