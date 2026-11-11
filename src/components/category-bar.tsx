import Link from "next/link";
import { categoryColor } from "@/lib/category-colors";

type CategoryBarProps = {
  categories: { id: number; name: string }[];
  /** undefined = 전체, "none" = 미분류, 그 외 = 카테고리 id 문자열 */
  selected?: string;
  /** 검색어. 있으면 카테고리를 바꿔도 검색어를 유지한다. */
  keyword?: string;
};

const chipBase =
  "rounded-full border px-3 py-1.5 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";
// 전체 칩: 선택 시 색 반전
const allOn = "border-foreground bg-foreground text-background";
const allOff =
  "border-foreground/20 text-foreground/75 hover:border-foreground/50 hover:text-foreground";
// 카테고리 칩: 파스텔 배경, 선택 시 테두리·굵은 글씨로 강조
const tintOn = "border-foreground font-semibold";
const tintOff = "border-transparent hover:border-foreground/40";

export function CategoryBar({ categories, selected, keyword }: CategoryBarProps) {
  const q = keyword ? `q=${encodeURIComponent(keyword)}` : "";
  const items: {
    key: string | undefined;
    label: string;
    href: string;
    color: string | null; // null = 전체 칩
  }[] = [
    { key: undefined, label: "전체", href: q ? `/dashboard?${q}` : "/dashboard",
      color: null },
    ...categories.map((c) => ({
      key: String(c.id),
      label: c.name,
      href: `/dashboard?category=${c.id}${q && `&${q}`}`,
      color: categoryColor(c.id),
    })),
    {
      key: "none",
      label: "미분류",
      href: `/dashboard?category=none${q && `&${q}`}`,
      color: categoryColor(null),
    },
  ];

  return (
    <nav aria-label="카테고리" className="flex flex-wrap items-center gap-2">
      {items.map((item) => {
        const active = item.key === selected;
        return (
          <Link
            key={item.key ?? "all"}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`${chipBase} ${
              item.color
                ? `${item.color} ${active ? tintOn : tintOff}`
                : active
                  ? allOn
                  : allOff
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      <Link
        href="/categories"
        className={`${chipBase} border-dashed border-foreground/30 text-foreground/60 hover:border-foreground/60 hover:text-foreground`}
      >
        + 카테고리 추가
      </Link>
    </nav>
  );
}
