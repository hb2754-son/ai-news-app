import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const categories = pgTable(
  "categories",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id").notNull(),
    name: text().notNull(),
    description: text().notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("categories_user_idx").on(t.userId)],
);

export const articles = pgTable(
  "articles",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id").notNull(),
    url: text().notNull(),
    source: text().notNull(),
    originalTitle: text("original_title").notNull(),
    originalSummary: text("original_summary").notNull().default(""),
    titleKo: text("title_ko").notNull(),
    summaryKo: text("summary_ko").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    // null = '미분류'. 카테고리 삭제 시 null로 전환.
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("articles_user_url_uq").on(t.userId, t.url),
    index("articles_user_published_idx").on(t.userId, t.publishedAt),
    index("articles_category_idx").on(t.categoryId),
  ],
);

export const notionConnections = pgTable("notion_connections", {
  userId: text("user_id").primaryKey(),
  // 아래 토큰은 TOKEN_ENCRYPTION_KEY로 암호화한 값만 저장한다.
  accessTokenEnc: text("access_token_enc").notNull(),
  refreshTokenEnc: text("refresh_token_enc"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  // 저장 대상 (데이터베이스 vs 페이지는 미정)
  targetType: text("target_type"),
  targetId: text("target_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const savedToNotion = pgTable(
  "saved_to_notion",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    articleId: integer("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    notionPageId: text("notion_page_id").notNull(),
    savedAt: timestamp("saved_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("saved_to_notion_article_uq").on(t.articleId),
    index("saved_to_notion_user_idx").on(t.userId),
  ],
);

export type Category = typeof categories.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type NotionConnection = typeof notionConnections.$inferSelect;
export type SavedToNotion = typeof savedToNotion.$inferSelect;
