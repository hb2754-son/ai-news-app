type NewsCardProps = {
  url: string;
  source: string;
  titleKo: string;
  summaryKo: string;
  publishedAt: Date | null;
  categoryName: string | null;
};

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Seoul",
});

export function NewsCard({
  url,
  source,
  titleKo,
  summaryKo,
  publishedAt,
  categoryName,
}: NewsCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-full flex-col gap-3 rounded-lg border border-foreground/10 p-5 transition hover:border-foreground/30 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-foreground/60">
        <span className="rounded-full bg-foreground/10 px-2 py-0.5 font-medium text-foreground/80">
          {categoryName ?? "미분류"}
        </span>
        <span>{source}</span>
        {publishedAt && (
          <>
            <span aria-hidden>·</span>
            <time dateTime={publishedAt.toISOString()}>
              {dateFormat.format(publishedAt)}
            </time>
          </>
        )}
      </div>
      <h2 className="line-clamp-2 text-base font-semibold leading-snug">
        {titleKo}
      </h2>
      <p className="line-clamp-4 text-sm leading-relaxed text-foreground/75">
        {summaryKo}
      </p>
      <span className="sr-only">(새 탭에서 원문 열기)</span>
    </a>
  );
}
