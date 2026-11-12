"use client";

import { useState, useTransition } from "react";
import { deleteArticleAction } from "@/lib/actions/articles";

export function DeleteNewsButton({ articleId }: { articleId: number }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove() {
    setError(null);
    startTransition(async () => {
      try {
        // 액션이 /dashboard를 revalidate하므로 목록에서도 사라진다.
        await deleteArticleAction(articleId);
      } catch {
        setError("삭제하지 못했어요.");
      }
    });
  }

  return (
    // 카드 전체 링크 오버레이(after:absolute) 위에 놓이도록 z-10
    <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        aria-label="뉴스 삭제"
        title="삭제"
        className="flex size-7 items-center justify-center rounded-md text-foreground/50 transition hover:bg-foreground/10 hover:text-foreground disabled:opacity-40"
      >
        <svg
          viewBox="0 0 16 16"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
      {error && (
        <span role="alert" className="text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
