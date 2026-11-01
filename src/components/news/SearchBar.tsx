import Link from "next/link";

// GET 폼이라 JS 없이도 동작한다. '검색' 버튼 클릭과 Enter 키 모두 폼을 제출한다.
// 카테고리 선택은 hidden 입력으로 유지하고, 페이지는 1페이지로 돌아간다.
export default function SearchBar({
  keyword,
  categoryId,
}: {
  keyword?: string;
  categoryId?: number;
}) {
  return (
    <form
      action="/dashboard"
      method="get"
      role="search"
      aria-label="뉴스 검색"
      className="ml-auto flex w-full items-center gap-2 sm:w-72"
    >
      {categoryId !== undefined && (
        <input type="hidden" name="category" value={categoryId} />
      )}
      <input
        type="search"
        name="q"
        defaultValue={keyword}
        key={keyword ?? ""}
        placeholder="키워드로 뉴스 검색"
        aria-label="검색어"
        maxLength={100}
        className="h-9 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
      />
      <button
        type="submit"
        className="inline-flex h-9 items-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-400"
      >
        검색
      </button>
      {keyword && (
        <Link
          href={
            categoryId !== undefined
              ? `/dashboard?category=${categoryId}`
              : "/dashboard"
          }
          className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          초기화
        </Link>
      )}
    </form>
  );
}
