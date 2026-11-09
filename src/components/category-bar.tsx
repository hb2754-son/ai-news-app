import Link from "next/link";

type CategoryBarProps = {
  categories: { id: number; name: string }[];
  /** undefined = 전체, "none" = 미분류, 그 외 = 카테고리 id 문자열 */
  selected?: string;
};

const chipBase =
  "rounded-full border px-3 py-1.5 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";
const chipOn = "border-foreground bg-foreground text-background";
const chipOff =
  "border-foreground/20 text-foreground/75 hover:border-foreground/50 hover:text-foreground";

export function CategoryBar({ categories, selected }: CategoryBarProps) {
  const items = [
    { key: undefined, label: "전체", href: "/dashboard" },
    ...categories.map((c) => ({
      key: String(c.id),
      label: c.name,
      href: `/dashboard?category=${c.id}`,
    })),
    { key: "none", label: "미분류", href: "/dashboard?category=none" },
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
            className={`${chipBase} ${active ? chipOn : chipOff}`}
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
