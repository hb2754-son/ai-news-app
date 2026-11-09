import { auth } from "@clerk/nextjs/server";
import { CategoryBar } from "@/components/category-bar";
import { NewsCard } from "@/components/news-card";
import { getArticlesWithCategory, getCategories } from "@/db/queries";

export type DashboardSearchParams = Promise<{
  category?: string | string[];
}>;

// 로그인 정보·쿼리·DB 등 요청 시점 데이터에 의존하므로
// 호출하는 쪽에서 <Suspense>로 감싸야 한다.
export async function DashboardContent({
  searchParams,
}: {
  searchParams: DashboardSearchParams;
}) {
  const { userId } = await auth.protect();
  const { category } = await searchParams;

  const categories = await getCategories(userId);

  // 유효하지 않은 값(없는 id 등)은 '전체'로 취급한다.
  const raw = Array.isArray(category) ? category[0] : category;
  let selected: string | undefined;
  let filter: number | null | undefined;
  if (raw === "none") {
    selected = "none";
    filter = null;
  } else if (raw && categories.some((c) => String(c.id) === raw)) {
    selected = raw;
    filter = Number(raw);
  }

  const news = await getArticlesWithCategory(userId, filter);

  return (
    <>
      <CategoryBar categories={categories} selected={selected} />

      {news.length === 0 ? (
        <p className="mt-16 text-center text-sm text-foreground/60">
          {selected
            ? "이 카테고리에 뉴스가 없어요."
            : "아직 가져온 뉴스가 없어요."}
        </p>
      ) : (
        <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {news.map((n) => (
            <li key={n.id}>
              <NewsCard
                url={n.url}
                source={n.source}
                titleKo={n.titleKo}
                summaryKo={n.summaryKo}
                publishedAt={n.publishedAt}
                categoryName={n.categoryName}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="불러오는 중">
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-20 animate-pulse rounded-full bg-foreground/10"
          />
        ))}
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-44 animate-pulse rounded-lg border border-foreground/10 bg-foreground/5"
          />
        ))}
      </div>
    </div>
  );
}
