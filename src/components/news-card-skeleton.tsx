/** 뉴스 카드와 같은 레이아웃의 로딩 자리표시 카드 */
export function NewsCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full animate-pulse flex-col gap-3 rounded-lg border border-foreground/10 p-5"
    >
      {/* 카테고리 배지 · 출처 */}
      <div className="flex items-center gap-2">
        <div className="h-5 w-16 rounded-full bg-foreground/10" />
        <div className="h-3 w-20 rounded bg-foreground/10" />
      </div>
      {/* 제목 2줄 */}
      <div className="space-y-2">
        <div className="h-5 w-full rounded bg-foreground/10" />
        <div className="h-5 w-3/4 rounded bg-foreground/10" />
      </div>
      {/* 요약 4줄 */}
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-foreground/10" />
        <div className="h-3 w-full rounded bg-foreground/10" />
        <div className="h-3 w-full rounded bg-foreground/10" />
        <div className="h-3 w-2/3 rounded bg-foreground/10" />
      </div>
      {/* 발행일 · 버튼 */}
      <div className="mt-auto flex items-center justify-between pt-2">
        <div className="h-3 w-24 rounded bg-foreground/10" />
        <div className="h-3 w-28 rounded bg-foreground/10" />
      </div>
    </div>
  );
}
