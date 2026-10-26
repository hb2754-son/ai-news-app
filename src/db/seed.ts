import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { categories } from "./schema";

config({ path: ".env.local" });

const defaultCategories = [
  { name: "모델/연구", description: "새로운 AI 모델 공개, 벤치마크, 연구 논문 및 기술 성과" },
  { name: "제품/서비스", description: "AI 기반 제품·서비스 출시, 기능 업데이트, 앱과 플랫폼 소식" },
  { name: "투자/기업", description: "투자 유치, 인수합병, 기업 전략, 실적 및 인사 소식" },
  { name: "규제/정책", description: "AI 관련 법률, 정부 정책, 규제, 윤리·안전 논의" },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL 환경변수가 설정되지 않았습니다.");
  }
  const db = drizzle(neon(process.env.DATABASE_URL));
  await db.insert(categories).values(defaultCategories).onConflictDoNothing();
  console.log("기본 카테고리 시드 완료");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
