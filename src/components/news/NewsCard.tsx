import type { ArticleListItem } from "@/db/queries/articles";
import { getCategoryColor } from "@/components/ui/category-color";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// YYYY.MM.DD (한국 시간)
function formatDate(date: Date) {
  return dateFormatter.format(date).replace(/\. /g, ".").replace(/\.$/, "");
}

export default function NewsCard({ article }: { article: ArticleListItem }) {
  const date = article.publishedAt ?? article.fetchedAt;

  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(article.categoryId).badge}`}
        >
          {article.categoryName ?? "미분류"}
        </span>
        <span className="truncate text-xs text-slate-500 dark:text-slate-400">
          {article.source}
        </span>
      </div>
      <h3
        title={article.titleOriginal}
        className="mt-3 line-clamp-2 break-keep text-base font-semibold leading-snug text-slate-900 dark:text-slate-100"
      >
        {article.titleKo}
      </h3>
      <p className="mt-2 line-clamp-4 break-keep text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {article.summaryKo}
      </p>
      <div className="mt-auto flex items-center justify-between pt-4">
        <time
          dateTime={date.toISOString()}
          className="text-xs text-slate-500 dark:text-slate-400"
        >
          {formatDate(date)}
        </time>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded text-sm font-medium text-indigo-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:text-indigo-400"
        >
          원문 보기 ↗
        </a>
      </div>
    </article>
  );
}
