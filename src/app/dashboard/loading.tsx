import NewsCardSkeleton from "@/components/news/NewsCardSkeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-1 flex-col bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <span className="truncate text-lg font-bold tracking-tight">
            AI 뉴스 수집기
          </span>
        </div>
      </header>
      <main
        aria-busy="true"
        aria-live="polite"
        className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-8 sm:px-6 lg:px-8"
      >
        <h2 className="text-2xl font-bold tracking-tight">최신 AI 뉴스</h2>
        <p className="sr-only">뉴스를 불러오는 중…</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
