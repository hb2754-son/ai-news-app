import { categoryColor } from "@/lib/category-colors";

type NewsCardProps = {
  url: string;
  source: string;
  titleKo: string;
  summaryKo: string;
  publishedAt: Date | null;
  categoryId: number | null;
  categoryName: string | null;
};

const dateParts = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  timeZone: "Asia/Seoul",
});

/** YYYY년 M월 DD일 (한국 시간 기준) */
function formatDate(date: Date) {
  const get = (type: string) =>
    dateParts.formatToParts(date).find((p) => p.type === type)?.value ?? "";
  return `${get("year")}년 ${get("month")}월 ${get("day").padStart(2, "0")}일`;
}

export function NewsCard({
  url,
  source,
  titleKo,
  summaryKo,
  publishedAt,
  categoryId,
  categoryName,
}: NewsCardProps) {
  return (
    <article className="relative flex h-full flex-col gap-3 rounded-lg border border-foreground/10 p-5 transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-foreground hover:border-foreground/30 hover:shadow-sm">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-foreground/60">
        <span className={`rounded-full px-2 py-0.5 font-medium ${categoryColor(categoryId)}`}>
          {categoryName ?? "미분류"}
        </span>
        <span>{source}</span>
      </div>
      <h2 className="line-clamp-2 text-base font-semibold leading-snug">
        {titleKo}
      </h2>
      <p className="line-clamp-4 text-sm leading-relaxed text-foreground/75">
        {summaryKo}
      </p>
      <div className="mt-auto flex items-center justify-between pt-2 text-xs text-foreground/60">
        {publishedAt ? (
          <time dateTime={publishedAt.toISOString()}>
            {formatDate(publishedAt)}
          </time>
        ) : (
          <span />
        )}
        {/* 카드 전체를 클릭 영역으로 확장(after:absolute) — 새 탭으로 원문 열기 */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground/80 underline-offset-2 outline-none after:absolute after:inset-0 hover:underline"
        >
          원문보기
          <span className="sr-only"> (새 탭에서 열기)</span>
        </a>
      </div>
    </article>
  );
}
