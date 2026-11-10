import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { getCategories } from "@/db/queries";
import {
  addCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/lib/actions/categories";

const input =
  "w-full rounded-md border border-foreground/20 bg-background px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";
const btn =
  "rounded-full border border-foreground/20 px-3 py-1 text-sm transition hover:border-foreground/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

async function CategoryList() {
  const { userId } = await auth.protect();
  const categories = await getCategories(userId);

  return (
    <>
      <form
        action={addCategoryAction}
        className="grid gap-3 rounded-lg border border-foreground/10 p-5"
      >
        <h2 className="text-base font-semibold">카테고리 추가</h2>
        <input
          name="name"
          required
          maxLength={30}
          placeholder="이름 (예: LLM)"
          className={input}
        />
        <textarea
          name="description"
          maxLength={200}
          rows={2}
          placeholder="설명 (Claude가 분류할 때 참고해요. 예: 대규모 언어모델, 챗봇 관련 소식)"
          className={input}
        />
        <button
          type="submit"
          className="justify-self-start rounded-full bg-foreground px-4 py-1.5 text-sm text-background transition hover:opacity-85"
        >
          추가
        </button>
      </form>

      {categories.length === 0 ? (
        <p className="mt-10 text-center text-sm text-foreground/60">
          아직 카테고리가 없어요. 카테고리를 만들면 뉴스를 가져올 때 자동으로
          분류돼요.
        </p>
      ) : (
        <ul className="mt-6 grid gap-3">
          {categories.map((c) => (
            <li
              key={c.id}
              className="rounded-lg border border-foreground/10 p-5"
            >
              <form action={updateCategoryAction} className="grid gap-3">
                <input type="hidden" name="id" value={c.id} />
                <input
                  name="name"
                  required
                  maxLength={30}
                  defaultValue={c.name}
                  aria-label="이름"
                  className={`${input} font-semibold`}
                />
                <textarea
                  name="description"
                  maxLength={200}
                  rows={2}
                  defaultValue={c.description}
                  aria-label="설명"
                  className={input}
                />
                <div className="flex gap-2">
                  <button type="submit" className={btn}>
                    저장
                  </button>
                  <button
                    type="submit"
                    formAction={deleteCategoryAction}
                    formNoValidate
                    className={`${btn} text-red-600`}
                  >
                    삭제
                  </button>
                </div>
              </form>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-foreground/60">
        카테고리를 삭제해도 뉴스는 사라지지 않고 &apos;미분류&apos;로 이동해요.
      </p>
    </>
  );
}

export default function CategoriesPage() {
  return (
    <>
      <header className="flex items-center justify-between border-b border-foreground/10 px-4 py-3 md:px-6">
        <h1 className="text-lg font-semibold">카테고리 관리</h1>
        <Link href="/dashboard" className={btn}>
          ← 뉴스로 돌아가기
        </Link>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 md:px-6">
        <Suspense
          fallback={<p className="text-sm text-foreground/60">불러오는 중…</p>}
        >
          <CategoryList />
        </Suspense>
      </main>
    </>
  );
}
