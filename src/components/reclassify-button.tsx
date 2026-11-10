"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReclassifyButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    error: boolean;
    text: string;
  } | null>(null);

  async function handleClick() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/news/reclassify", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        throw new Error(data?.error ?? "재분류하지 못했어요.");
      }
      setMessage({ error: false, text: `${data.reclassified}건을 분류했어요.` });
      router.refresh();
    } catch (e) {
      setMessage({
        error: true,
        text: e instanceof Error ? e.message : "재분류하지 못했어요.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <p
        role="status"
        className={`text-sm ${message?.error ? "text-red-600" : "text-foreground/70"}`}
      >
        {message?.text}
      </p>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-full border border-foreground/20 px-3 py-1.5 text-sm transition hover:border-foreground/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "재분류 중…" : "미분류 재분류"}
      </button>
    </div>
  );
}
