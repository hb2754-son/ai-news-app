import { Suspense } from "react";
import { UserButton } from "@clerk/nextjs";
import {
  DashboardContent,
  DashboardSkeleton,
  type DashboardSearchParams,
} from "@/components/dashboard-content";

export default function DashboardPage({
  searchParams,
}: {
  searchParams: DashboardSearchParams;
}) {
  // 비로그인 접근은 proxy.ts가 /sign-in으로 보낸다.
  return (
    <>
      <header className="flex items-center justify-between border-b border-foreground/10 px-4 py-3 md:px-6">
        <h1 className="text-lg font-semibold">AI 뉴스 수집기</h1>
        <UserButton />
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
