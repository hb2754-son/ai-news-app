import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL 환경 변수가 설정되어 있지 않습니다.");
}

// 서버에서만 import할 것 (클라이언트 컴포넌트에서 사용 금지).
const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });
