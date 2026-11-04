"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteNewsButton({
  articleId,
  onDeleted,
}: {
  articleId: number;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm("이 뉴스를 삭제할까요? 삭제하면 되돌릴 수 없어요.")) return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/news/${articleId}`, { method: "DELETE" });
      // 이미 없는 기사(404)도 화면에서는 치운다.
      if (!response.ok && response.status !== 404) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "삭제하지 못했어요.");
      }
      onDeleted();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제하지 못했어요.");
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        aria-busy={pending}
        aria-label="뉴스 삭제"
        title="삭제"
        className="-mr-2 -mt-1.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition pointer-fine:opacity-0 pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:opacity-100 hover:bg-slate-100 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-red-400"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="size-4"
        >
          <path d="M5 5l10 10M15 5L5 15" />
        </svg>
      </button>
      {error && (
        <p
          role="alert"
          className="absolute inset-x-5 top-14 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </p>
      )}
    </>
  );
}
