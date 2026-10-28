"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  CATEGORY_DESCRIPTION_MAX,
  CATEGORY_NAME_MAX,
} from "@/lib/category-limits";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

export default function AddCategoryButton() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function open() {
    setError(null);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error);

      setName("");
      setDescription("");
      close();
      router.refresh();
    } catch (err) {
      setError(
        (err instanceof Error && err.message) ||
          "카테고리를 추가하지 못했어요. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-3.5 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:border-indigo-500 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:text-slate-400 dark:hover:border-indigo-400 dark:hover:text-indigo-400"
      >
        <span aria-hidden="true">+</span> 카테고리 추가
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="add-category-title"
        className="m-auto w-[calc(100vw-2rem)] max-w-md rounded-xl border border-slate-200 bg-white p-0 text-slate-900 shadow-lg backdrop:bg-slate-950/50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
      >
        <form onSubmit={handleSubmit} className="p-6">
          <h2 id="add-category-title" className="text-lg font-bold tracking-tight">
            카테고리 추가
          </h2>

          <label className="mt-5 block text-sm font-medium">
            이름
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={CATEGORY_NAME_MAX}
              required
              placeholder="예: 오픈소스"
              className={inputClass}
            />
          </label>

          <label className="mt-4 block text-sm font-medium">
            설명 <span className="font-normal text-slate-500 dark:text-slate-400">(선택)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={CATEGORY_DESCRIPTION_MAX}
              rows={3}
              placeholder="어떤 기사가 이 카테고리에 들어가야 하는지 적어 주세요. Claude가 기사를 분류할 때 기준으로 씁니다."
              className={inputClass}
            />
          </label>

          <div role="alert" aria-live="polite">
            {error && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                {error}
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={close}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "추가하는 중…" : "추가"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
