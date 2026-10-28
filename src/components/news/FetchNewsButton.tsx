"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type FetchResponse = {
  inserted?: number;
  failedSources?: string[];
  error?: string;
};

type Status =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export default function FetchNewsButton() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const loading = status.type === "loading";

  async function handleClick() {
    setStatus({ type: "loading" });
    try {
      const res = await fetch("/api/news/fetch", { method: "POST" });
      const data: FetchResponse = await res.json();
      if (!res.ok) throw new Error(data.error);

      const failed = data.failedSources?.length
        ? ` (${data.failedSources.join(", ")} 불러오기 실패)`
        : "";
      setStatus({
        type: "success",
        message: `새 기사 ${data.inserted ?? 0}건을 가져왔어요${failed}`,
      });
      router.refresh();
    } catch (error) {
      setStatus({
        type: "error",
        message:
          (error instanceof Error && error.message) ||
          "뉴스를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.",
      });
    }
  }

  return (
    <div className="relative flex items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-busy={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading && (
          <svg
            className="size-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              className="opacity-25"
            />
            <path
              d="M4 12a8 8 0 018-8"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        )}
        {loading ? "가져오는 중…" : "뉴스 가져오기"}
      </button>
      <div role="status" aria-live="polite">
        {(status.type === "success" || status.type === "error") && (
          <p
            className={
              "absolute top-full right-0 mt-2 w-max max-w-[calc(100vw-2rem)] rounded-lg border px-4 py-3 text-sm shadow-sm " +
              (status.type === "error"
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200")
            }
          >
            {status.message}
          </p>
        )}
      </div>
    </div>
  );
}
