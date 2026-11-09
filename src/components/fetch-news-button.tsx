"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Message = { kind: "ok" | "error"; text: string };

export function FetchNewsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  async function handleClick() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/news/fetch", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        throw new Error(data?.error ?? "뉴스를 가져오지 못했어요.");
      }

      const failed: string[] = data.failedSources ?? [];
      let text = `새 뉴스 ${data.inserted}건 저장`;
      if (data.skipped > 0) text += ` (${data.skipped}건은 이미 있음)`;
      if (failed.length > 0) text += ` · 가져오기 실패: ${failed.join(", ")}`;

      setMessage({ kind: failed.length > 0 ? "error" : "ok", text });
      router.refresh();
    } catch (e) {
      setMessage({
        kind: "error",
        text: e instanceof Error ? e.message : "뉴스를 가져오지 못했어요.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <p
        role="status"
        className={`text-sm ${message?.kind === "error" ? "text-red-600" : "text-foreground/70"}`}
      >
        {message?.text}
      </p>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-full bg-foreground px-4 py-1.5 text-sm text-background transition hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "가져오는 중…" : "뉴스 가져오기"}
      </button>
    </div>
  );
}
