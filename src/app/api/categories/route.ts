import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createCategory } from "@/db/queries/categories";
import { CATEGORY_DESCRIPTION_MAX, CATEGORY_NAME_MAX } from "@/lib/category-limits";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let body: { name?: unknown; description?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";

  if (!name) {
    return Response.json({ error: "카테고리 이름을 입력해 주세요." }, { status: 400 });
  }
  if (name.length > CATEGORY_NAME_MAX) {
    return Response.json(
      { error: `이름은 ${CATEGORY_NAME_MAX}자 이하로 입력해 주세요.` },
      { status: 400 },
    );
  }
  if (description.length > CATEGORY_DESCRIPTION_MAX) {
    return Response.json(
      { error: `설명은 ${CATEGORY_DESCRIPTION_MAX}자 이하로 입력해 주세요.` },
      { status: 400 },
    );
  }

  try {
    const created = await createCategory({ name, description });
    if (!created) {
      return Response.json({ error: "이미 있는 카테고리 이름이에요." }, { status: 409 });
    }
    revalidatePath("/dashboard");
    return Response.json(created, { status: 201 });
  } catch (error) {
    console.error("[categories]", error);
    return Response.json(
      { error: "카테고리를 추가하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
