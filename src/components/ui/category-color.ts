// 카테고리별 색상. 카테고리 id로 색을 고르므로, 새로 추가한 카테고리도 자동으로 색이 배정된다.
// Tailwind가 클래스를 정적으로 찾아야 하므로 클래스 이름은 전부 문자열로 적어 둔다.
type CategoryColor = {
  badge: string; // 카드의 카테고리 배지
  dot: string; // 필터 칩 앞의 색 점
  active: string; // 선택된 필터 칩 (흰 글자 대비 AA를 위해 700 이상)
};

const PALETTE: CategoryColor[] = [
  {
    badge: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    dot: "bg-sky-500",
    active: "border-sky-700 bg-sky-700 text-white hover:bg-sky-800",
  },
  {
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    dot: "bg-emerald-500",
    active: "border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800",
  },
  {
    badge: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    dot: "bg-amber-500",
    active: "border-amber-700 bg-amber-700 text-white hover:bg-amber-800",
  },
  {
    badge: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    dot: "bg-rose-500",
    active: "border-rose-700 bg-rose-700 text-white hover:bg-rose-800",
  },
  {
    badge: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    dot: "bg-violet-500",
    active: "border-violet-700 bg-violet-700 text-white hover:bg-violet-800",
  },
  {
    badge: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
    dot: "bg-teal-500",
    active: "border-teal-700 bg-teal-700 text-white hover:bg-teal-800",
  },
];

// 미분류
const NEUTRAL: CategoryColor = {
  badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  dot: "bg-slate-400",
  active: "border-slate-700 bg-slate-700 text-white hover:bg-slate-800",
};

export function getCategoryColor(categoryId: number | null | undefined): CategoryColor {
  if (categoryId == null) return NEUTRAL;
  return PALETTE[categoryId % PALETTE.length];
}
