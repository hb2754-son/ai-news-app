"use client";

import { useState } from "react";

export function SaveToNotionButton({
  articleId,
  saved: initialSaved,
}: {
  articleId: number;
  saved: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/notion/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "저장하지 못했어요.");
      }
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장하지 못했어요.");
    } finally {
      setPending(false);
    }
  }

  return (
    // 카드 전체 링크 오버레이(after:absolute) 위에 놓이도록 relative z-10
    <span className="relative z-10 flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={save}
        disabled={saved || pending}
        className="rounded-md border border-foreground/20 px-2.5 py-1 text-xs font-medium text-foreground/80 transition hover:border-foreground/40 hover:bg-foreground/5 disabled:cursor-default disabled:opacity-60 disabled:hover:border-foreground/20 disabled:hover:bg-transparent"
      >
        {saved ? "저장됨" : pending ? "저장 중…" : "뉴스 저장"}
      </button>
      {error && (
        <span role="alert" className="text-xs text-red-600">
          {error}
        </span>
      )}
    </span>
  );
}
