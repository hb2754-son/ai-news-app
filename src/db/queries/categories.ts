import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

// Claude 분류 프롬프트에 쓰는 카테고리 목록 (이름 + 설명)
export async function getAllCategories() {
  return db
    .select({ id: categories.id, name: categories.name, description: categories.description })
    .from(categories)
    .orderBy(categories.id);
}

// 같은 이름의 카테고리가 이미 있으면 null을 돌려준다.
export async function createCategory(input: { name: string; description: string }) {
  const [row] = await db
    .insert(categories)
    .values(input)
    .onConflictDoNothing({ target: categories.name })
    .returning({ id: categories.id, name: categories.name });
  return row ?? null;
}

export async function getCategoriesWithCounts() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      articleCount: count(articles.id),
    })
    .from(categories)
    .leftJoin(articles, eq(articles.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(categories.id);
}
