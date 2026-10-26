import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { articles, categories } from "./schema";
import { sampleArticles } from "./sample-articles";

config({ path: ".env.local" });

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL 환경변수가 설정되지 않았습니다.");
  }
  const db = drizzle(neon(process.env.DATABASE_URL));

  const rows = await db.select().from(categories);
  const categoryIds = new Map(rows.map((c) => [c.name, c.id]));

  const values = sampleArticles.map(({ categoryName, ...article }) => {
    const categoryId = categoryIds.get(categoryName);
    if (categoryId === undefined) {
      throw new Error(`카테고리를 찾을 수 없습니다: ${categoryName}`);
    }
    return { ...article, categoryId };
  });

  await db.insert(articles).values(values).onConflictDoNothing();
  console.log("샘플 기사 시드 완료");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
