import { Suspense } from "react";
import { Show, UserButton } from "@clerk/nextjs";
import SignInModal from "@/components/auth/SignInModal";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">
          AI 뉴스 수집기
        </h1>
        <Suspense>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </Suspense>
      </header>
      <main className="flex-1 px-6 py-8">
        <Suspense>
          <Show when="signed-in">
            <p className="text-zinc-600 dark:text-zinc-400">
              로그인되었습니다. 뉴스 카드가 여기에 표시됩니다.
            </p>
          </Show>
        </Suspense>
      </main>
      <Suspense>
        <SignInModal />
      </Suspense>
    </div>
  );
}
