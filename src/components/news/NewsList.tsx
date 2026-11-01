import Link from "next/link";
import type { ArticleListItem } from "@/db/queries/articles";
import NewsCard from "./NewsCard";

export default function NewsList({
  articles,
  filtered,
  keyword,
}: {
  articles: ArticleListItem[];
  filtered: boolean;
  keyword?: string;
}) {
  if (articles.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700">
        {keyword ? (
          <>
            <p className="font-medium text-slate-900 dark:text-slate-100">
              ‘{keyword}’에 해당하는 기사가 없어요
            </p>
            <Link
              href="/dashboard"
              className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              전체 보기
            </Link>
          </>
        ) : filtered ? (
          <>
            <p className="font-medium text-slate-900 dark:text-slate-100">
              이 카테고리에는 기사가 없어요
            </p>
            <Link
              href="/dashboard"
              className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              전체 보기
            </Link>
          </>
        ) : (
          <>
            <p className="font-medium text-slate-900 dark:text-slate-100">
              아직 수집된 뉴스가 없어요
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              ‘뉴스 가져오기’ 버튼을 눌러 최신 기사를 불러오세요.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  );
}
