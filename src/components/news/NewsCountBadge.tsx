// 지금까지 수집된 뉴스 총 개수를 보여주는 배지 (서버 컴포넌트)
export default function NewsCountBadge({ total }: { total: number }) {
  return (
    <span
      aria-live="polite"
      className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
    >
      총 {total.toLocaleString("ko-KR")}개의 뉴스
    </span>
  );
}
