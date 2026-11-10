// 카테고리별 파스텔 색. 카테고리 id로 색을 정하므로 DB 변경 없이 항상 같은 색이 나온다.
// Tailwind가 클래스를 찾을 수 있도록 전체 클래스명을 문자열 그대로 적는다.
const PALETTE = [
  "bg-rose-100 text-rose-800 dark:bg-rose-400/20 dark:text-rose-200",
  "bg-sky-100 text-sky-800 dark:bg-sky-400/20 dark:text-sky-200",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/20 dark:text-emerald-200",
  "bg-amber-100 text-amber-800 dark:bg-amber-400/20 dark:text-amber-200",
  "bg-violet-100 text-violet-800 dark:bg-violet-400/20 dark:text-violet-200",
  "bg-pink-100 text-pink-800 dark:bg-pink-400/20 dark:text-pink-200",
  "bg-teal-100 text-teal-800 dark:bg-teal-400/20 dark:text-teal-200",
  "bg-orange-100 text-orange-800 dark:bg-orange-400/20 dark:text-orange-200",
  "bg-indigo-100 text-indigo-800 dark:bg-indigo-400/20 dark:text-indigo-200",
  "bg-lime-100 text-lime-800 dark:bg-lime-400/20 dark:text-lime-200",
];

// 미분류는 중립 회색
const UNCATEGORIZED = "bg-foreground/10 text-foreground/70";

/** 카테고리 id(null = 미분류)에 대응하는 배경·글자색 클래스 */
export function categoryColor(categoryId: number | null): string {
  if (categoryId == null) return UNCATEGORIZED;
  return PALETTE[Math.abs(categoryId) % PALETTE.length];
}
