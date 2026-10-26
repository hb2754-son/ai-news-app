import Link from "next/link";

type CategoryItem = { id: number; name: string; articleCount: number };

const chipBase =
  "inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2";
const chipIdle =
  "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";
const chipActive =
  "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 dark:border-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400";

export default function CategoryFilter({
  categories,
  total,
  selectedId,
}: {
  categories: CategoryItem[];
  total: number;
  selectedId?: number;
}) {
  return (
    <div
      role="group"
      aria-label="카테고리 필터"
      className="flex flex-wrap items-center gap-2"
    >
      <Link
        href="/dashboard"
        aria-current={selectedId === undefined ? "true" : undefined}
        className={`${chipBase} ${selectedId === undefined ? chipActive : chipIdle}`}
      >
        전체
        <span className="ml-1.5 text-xs opacity-70">{total}</span>
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/dashboard?category=${category.id}`}
          aria-current={selectedId === category.id ? "true" : undefined}
          className={`${chipBase} ${selectedId === category.id ? chipActive : chipIdle}`}
        >
          {category.name}
          <span className="ml-1.5 text-xs opacity-70">
            {category.articleCount}
          </span>
        </Link>
      ))}
      {/* 동작(페이지 vs 모달)은 PRD §8 미정 사항이라 확정 후 연결한다. */}
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-3.5 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:border-indigo-500 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:text-slate-400 dark:hover:border-indigo-400 dark:hover:text-indigo-400"
      >
        <span aria-hidden="true">+</span> 카테고리 추가
      </button>
    </div>
  );
}
