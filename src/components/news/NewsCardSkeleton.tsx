export default function NewsCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full animate-pulse flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
      <div className="mt-4 space-y-2">
        <div className="h-5 w-full rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="mt-3 space-y-2.5">
        <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="space-y-1.5">
          <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-8 w-28 rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}
