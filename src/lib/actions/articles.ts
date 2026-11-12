"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { deleteArticle } from "@/db/queries";

export async function deleteArticleAction(articleId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!Number.isInteger(articleId)) throw new Error("Invalid article id");

  try {
    await deleteArticle(userId, articleId);
  } catch (error) {
    console.error("기사 삭제 실패:", error);
    throw new Error("뉴스를 삭제하지 못했어요.");
  }
  revalidatePath("/dashboard");
}
