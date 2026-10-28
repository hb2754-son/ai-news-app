import Link from "next/link";
import AddCategoryButton from "@/components/categories/AddCategoryButton";
import { getCategoryColor } from "@/components/ui/category-color";

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
      {categories.map((category) => {
        const color = getCategoryColor(category.id);
        const isActive = selectedId === category.id;
        return (
          <Link
            key={category.id}
            href={`/dashboard?category=${category.id}`}
            aria-current={isActive ? "true" : undefined}
            className={`${chipBase} ${isActive ? color.active : chipIdle}`}
          >
            <span
              aria-hidden="true"
              className={`mr-1.5 size-2 rounded-full ${isActive ? "bg-white" : color.dot}`}
            />
            {category.name}
            <span className="ml-1.5 text-xs opacity-70">
              {category.articleCount}
            </span>
          </Link>
        );
      })}
      <AddCategoryButton />
    </div>
  );
}
