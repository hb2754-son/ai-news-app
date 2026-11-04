"use client";

import { useState } from "react";
import type { ArticleListItem } from "@/db/queries/articles";
import { getCategoryColor } from "@/components/ui/category-color";
import DeleteNewsButton from "./DeleteNewsButton";
import SaveNewsButton from "./SaveNewsButton";

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
  const [deleted, setDeleted] = useState(false);
  if (deleted) return null;

  const date = article.publishedAt ?? article.fetchedAt;

  const color = getCategoryColor(article.categoryId);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-6 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:shadow-black/40">
      {/* 카테고리 색 선: hover 시 왼쪽에서 오른쪽으로 그어진다 */}
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-within:scale-x-100 motion-reduce:transition-none ${color.dot}`}
      />
      <div className="flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${color.badge}`}
        >
          {article.categoryName ?? "미분류"}
        </span>
        <DeleteNewsButton
          articleId={article.id}
          onDeleted={() => setDeleted(true)}
        />
      </div>
      <h3
        title={article.titleOriginal}
        className="mt-4 line-clamp-2 break-keep text-lg font-semibold leading-snug tracking-tight text-slate-900 dark:text-slate-50"
      >
        {article.titleKo}
      </h3>
      <p className="mt-2.5 line-clamp-4 break-keep text-sm leading-7 text-slate-600 dark:text-slate-300">
        {article.summaryKo}
      </p>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="flex min-w-0 flex-col gap-0.5 text-xs">
          <span className="truncate font-medium text-slate-700 dark:text-slate-200">
            {article.source}
          </span>
          <time
            dateTime={date.toISOString()}
            className="tabular-nums text-slate-500 dark:text-slate-400"
          >
            {formatDate(date)}
          </time>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded px-1 text-sm font-medium text-indigo-600 hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:text-indigo-400"
          >
            원문 보기 ↗
          </a>
          <SaveNewsButton
            articleId={article.id}
            saved={article.notionPageId !== null}
          />
        </div>
      </div>
    </article>
  );
}
