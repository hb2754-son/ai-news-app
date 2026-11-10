import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getCategories,
  getUnclassifiedArticles,
  updateArticleCategory,
} from "@/db/queries";
import { classifyOnly } from "@/lib/claude";

// 한 번에 재분류하는 미분류 기사 수 상한
const MAX_PER_RUN = 40;

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cats = await getCategories(userId);
    if (cats.length === 0) {
      return NextResponse.json({ reclassified: 0, remaining: 0 });
    }

    const targets = await getUnclassifiedArticles(userId, MAX_PER_RUN);
    const result = await classifyOnly(
      targets,
      cats.map((c) => ({ id: c.id, name: c.name, description: c.description })),
    );

    let reclassified = 0;
    for (const a of targets) {
      const categoryId = result.get(a.url);
      if (categoryId != null) {
        await updateArticleCategory(userId, a.id, categoryId);
        reclassified++;
      }
    }

    return NextResponse.json({ reclassified, checked: targets.length });
  } catch (e) {
    console.error("재분류 실패", e);
    return NextResponse.json({ error: "재분류하지 못했어요." }, { status: 500 });
  }
}
