import { UserButton } from "@clerk/nextjs";

// 비로그인 접근은 proxy.ts가 /sign-in으로 보낸다.
export default function Home() {
  return (
    <>
      <header className="flex items-center justify-between border-b px-6 py-3">
        <h1 className="text-lg font-semibold">AI 뉴스 수집기</h1>
        <UserButton />
      </header>
      <main className="flex-1 p-6">{/* 뉴스 카드 목록 (구현 예정) */}</main>
    </>
  );
}
