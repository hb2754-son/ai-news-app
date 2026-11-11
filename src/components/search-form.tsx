import Link from "next/link";

type SearchFormProps = {
  keyword?: string;
  /** 선택된 카테고리. 검색해도 유지한다. */
  category?: string;
};

/**
 * 키워드 검색 폼. GET 폼이라 '검색' 버튼 클릭과 Enter 키 모두 같은 방식으로
 * /dashboard?q=... 로 이동한다. (페이지는 1로 초기화)
 */
export function SearchForm({ keyword, category }: SearchFormProps) {
  return (
    <form
      // 검색어가 바뀌거나 초기화되면 입력창을 새로 만들어 값을 비운다.
      key={keyword ?? ""}
      action="/dashboard"
      method="get"
      role="search"
      className="flex w-full items-center gap-2 sm:w-auto"
    >
      {category && <input type="hidden" name="category" value={category} />}
      <input
        type="search"
        name="q"
        defaultValue={keyword}
        maxLength={100}
        placeholder="키워드로 뉴스 검색"
        aria-label="뉴스 검색어"
        className="h-9 min-w-0 flex-1 sm:w-64 sm:flex-none rounded-lg border border-foreground/20 bg-background px-3 text-sm placeholder:text-foreground/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      />
      <button
        type="submit"
        className="h-9 shrink-0 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        검색
      </button>
      {keyword && (
        <Link
          href={category ? `/dashboard?category=${category}` : "/dashboard"}
          className="shrink-0 text-sm text-foreground/60 hover:text-foreground"
        >
          초기화
        </Link>
      )}
    </form>
  );
}
