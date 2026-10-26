import { Show, SignIn } from "@clerk/nextjs";

// 비로그인 상태에서 화면 전체를 덮는 로그인 모달. 닫을 수 없다.
export default function SignInModal() {
  return (
    <Show when="signed-out">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="로그인"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      >
        <SignIn routing="hash" />
      </div>
    </Show>
  );
}
