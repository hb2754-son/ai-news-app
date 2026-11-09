import { redirect } from "next/navigation";

// 메인 화면은 대시보드다. 비로그인 접근은 proxy.ts가 /sign-in으로 보낸다.
export default function Home() {
  redirect("/dashboard");
}
