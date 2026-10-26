import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

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
