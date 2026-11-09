import Link from "next/link";

type PaginationProps = {
  page: number;
  totalPages: number;
  /** 페이지 번호를 받아 이동할 경로를 만든다. (카테고리 등 다른 쿼리는 유지) */
  hrefForPage: (page: number) => string;
};

const base =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";
const on = "border-foreground bg-foreground text-background";
const off =
  "border-foreground/20 text-foreground/75 hover:border-foreground/50 hover:text-foreground";
const disabled = "border-foreground/10 text-foreground/30";

/** 현재 페이지 주변만 보여준다: 1 … 4 5 [6] 7 8 … 20 */
function pageItems(page: number, total: number): (number | "gap")[] {
  const set = new Set<number>([1, total, page - 1, page, page + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const items: (number | "gap")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) items.push("gap");
    items.push(n);
  });
  return items;
}

/** href가 null이면 비활성(현재 위치에서 더 갈 수 없음) 상태로 보여준다. */
function NavButton({ label, href }: { label: string; href: string | null }) {
  if (href === null) {
    return (
      <span aria-disabled="true" className={`${base} ${disabled}`}>
        {label}
      </span>
    );
  }
  return (
    <Link href={href} className={`${base} ${off}`}>
      {label}
    </Link>
  );
}

export function Pagination({ page, totalPages, hrefForPage }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="페이지"
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
    >
      <NavButton label="처음" href={page > 1 ? hrefForPage(1) : null} />
      <NavButton label="이전" href={page > 1 ? hrefForPage(page - 1) : null} />

      {pageItems(page, totalPages).map((item, i) =>
        item === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-foreground/40">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefForPage(item)}
            aria-current={item === page ? "page" : undefined}
            className={`${base} ${item === page ? on : off}`}
          >
            {item}
          </Link>
        ),
      )}

      <NavButton
        label="다음"
        href={page < totalPages ? hrefForPage(page + 1) : null}
      />
      <NavButton
        label="끝"
        href={page < totalPages ? hrefForPage(totalPages) : null}
      />
    </nav>
  );
}
