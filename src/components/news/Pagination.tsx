import Link from "next/link";

const itemBase =
  "inline-flex min-w-9 items-center justify-center rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2";
const itemIdle =
  "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";
const itemActive =
  "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-500 dark:bg-indigo-500";
const itemDisabled =
  "cursor-not-allowed border-slate-200 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600";

const SIBLINGS = 2; // 현재 페이지 양옆에 보여줄 번호 수

// 첫·마지막 페이지는 항상 보이고, 현재 페이지 앞뒤 2개씩만 보여준다.
// 예) 100페이지 중 50 → 1 … 48 49 [50] 51 52 … 100
function getPageItems(current: number, totalPages: number) {
  const pages = new Set([1, totalPages]);
  for (let p = current - SIBLINGS; p <= current + SIBLINGS; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }
  const sorted = [...pages].sort((a, b) => a - b);

  const items: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    // 앞 번호와 이어지지 않을 때만 "…"를 넣는다. 이어지면 생략한다.
    if (i > 0 && p - sorted[i - 1] > 1) items.push("gap");
    items.push(p);
  });
  return items;
}

export default function Pagination({
  page,
  totalPages,
  categoryId,
}: {
  page: number;
  totalPages: number;
  categoryId?: number;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) => {
    const params = new URLSearchParams();
    if (categoryId !== undefined) params.set("category", String(categoryId));
    if (target > 1) params.set("page", String(target));
    const query = params.toString();
    return query ? `/dashboard?${query}` : "/dashboard";
  };

  return (
    <nav
      aria-label="페이지 이동"
      className="flex flex-wrap items-center justify-center gap-2 pt-2"
    >
      {page > 1 ? (
        <>
          <Link href={hrefFor(1)} className={`${itemBase} ${itemIdle}`}>
            처음
          </Link>
          <Link href={hrefFor(page - 1)} className={`${itemBase} ${itemIdle}`}>
            이전
          </Link>
        </>
      ) : (
        <>
          <span aria-disabled="true" className={`${itemBase} ${itemDisabled}`}>
            처음
          </span>
          <span aria-disabled="true" className={`${itemBase} ${itemDisabled}`}>
            이전
          </span>
        </>
      )}

      {getPageItems(page, totalPages).map((item, i) =>
        item === "gap" ? (
          <span
            key={`gap-${i}`}
            aria-hidden="true"
            className="px-1 text-sm text-slate-500 dark:text-slate-400"
          >
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefFor(item)}
            aria-label={`${item}페이지`}
            aria-current={item === page ? "page" : undefined}
            className={`${itemBase} ${item === page ? itemActive : itemIdle}`}
          >
            {item}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <>
          <Link href={hrefFor(page + 1)} className={`${itemBase} ${itemIdle}`}>
            다음
          </Link>
          <Link
            href={hrefFor(totalPages)}
            className={`${itemBase} ${itemIdle}`}
          >
            끝
          </Link>
        </>
      ) : (
        <>
          <span aria-disabled="true" className={`${itemBase} ${itemDisabled}`}>
            다음
          </span>
          <span aria-disabled="true" className={`${itemBase} ${itemDisabled}`}>
            끝
          </span>
        </>
      )}
    </nav>
  );
}
