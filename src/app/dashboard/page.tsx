import type { Metadata } from "next";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import CategoryFilter from "@/components/news/CategoryFilter";
import NewsList from "@/components/news/NewsList";
import { getArticles, getArticleTotal } from "@/db/queries/articles";
import { getCategoriesWithCounts } from "@/db/queries/categories";

export const metadata: Metadata = {
  title: "대시보드 · AI 뉴스 수집기",
};

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const { category } = await searchParams;
  const parsed = typeof category === "string" ? Number(category) : NaN;
  const selectedId = Number.isInteger(parsed) ? parsed : undefined;

  const [categories, total, articles] = await Promise.all([
    getCategoriesWithCounts(),
    getArticleTotal(),
    getArticles(selectedId),
  ]);

  return (
    <div className="flex flex-1 flex-col bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="truncate text-lg font-bold tracking-tight"
          >
            AI 뉴스 수집기
          </Link>
          <UserButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">최신 AI 뉴스</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {articles.length}건
          </p>
        </div>
        <CategoryFilter
          categories={categories}
          total={total}
          selectedId={selectedId}
        />
        <NewsList articles={articles} filtered={selectedId !== undefined} />
      </main>
    </div>
  );
}
