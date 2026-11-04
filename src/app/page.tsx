import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import SignInModal from "@/components/auth/SignInModal";

// 로그인 여부는 요청 시점에야 알 수 있으므로 Suspense 안에서 확인한다.
// (Cache Components: 요청 데이터를 Suspense 밖에서 읽으면 빌드가 실패한다.)
async function GuestGate() {
  // 로그인한 사용자는 메인 화면인 대시보드로 보낸다.
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return <SignInModal />;
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-slate-50 font-sans dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            AI 뉴스 수집기
          </h1>
        </div>
      </header>
      <Suspense>
        <GuestGate />
      </Suspense>
    </div>
  );
}
