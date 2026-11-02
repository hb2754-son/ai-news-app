import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { deleteArticle } from "@/db/queries/articles";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  try {
    const deleted = await deleteArticle(id);
    if (!deleted) {
      return Response.json({ error: "기사를 찾을 수 없어요." }, { status: 404 });
    }
    revalidatePath("/dashboard");
    return Response.json({ id });
  } catch (error) {
    console.error("[news/delete]", error);
    return Response.json(
      { error: "기사를 삭제하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
