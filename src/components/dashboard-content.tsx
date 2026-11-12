import { auth } from "@clerk/nextjs/server";
import { CategoryBar } from "@/components/category-bar";
import { ReclassifyButton } from "@/components/reclassify-button";
import { NewsCard } from "@/components/news-card";
import { SearchForm } from "@/components/search-form";
import { Pagination } from "@/components/pagination";
import {
  countArticles,
  getArticlesWithCategory,
  getCategories,
} from "@/db/queries";

const PAGE_SIZE = 9;

export type DashboardSearchParams = Promise<{
  category?: string | string[];
  q?: string | string[];
  page?: string | string[];
}>;

// 로그인 정보·쿼리·DB 등 요청 시점 데이터에 의존하므로
// 호출하는 쪽에서 <Suspense>로 감싸야 한다.
export async function DashboardContent({
  searchParams,
}: {
  searchParams: DashboardSearchParams;
}) {
  const { userId } = await auth.protect();
  const { category, page: rawPage, q: rawQ } = await searchParams;

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

  const qStr = Array.isArray(rawQ) ? rawQ[0] : rawQ;
  const keyword = qStr?.trim().slice(0, 100) || undefined;

  // 배지는 필터·검색과 무관한 전체 개수, 페이지 수는 필터 결과 기준.
  const [allCount, total] = await Promise.all([
    countArticles(userId),
    countArticles(userId, filter, keyword),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // 잘못된 값(숫자 아님, 범위 밖)은 가장 가까운 유효 페이지로 맞춘다.
  const pageStr = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const requested = Number.parseInt(pageStr ?? "1", 10);
  const page = Math.min(
    Math.max(Number.isNaN(requested) ? 1 : requested, 1),
    totalPages,
  );

  const news = await getArticlesWithCategory(
    userId,
    filter,
    PAGE_SIZE,
    (page - 1) * PAGE_SIZE,
    keyword,
  );

  function hrefForPage(p: number) {
    const params = new URLSearchParams();
    if (selected) params.set("category", selected);
    if (keyword) params.set("q", keyword);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/dashboard?${qs}` : "/dashboard";
  }

  return (
    <>
      <p className="mb-4 inline-flex items-center rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-xs font-medium text-foreground/70">
        총 {allCount.toLocaleString("ko-KR")}개의 뉴스
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CategoryBar
          categories={categories}
          selected={selected}
          keyword={keyword}
        />
        <SearchForm keyword={keyword} category={selected} />
      </div>
      {categories.length > 0 && (
        <div className="mt-3 flex justify-end">
          <ReclassifyButton />
        </div>
      )}

      {news.length === 0 ? (
        <p className="mt-16 text-center text-sm text-foreground/60">
          {keyword
            ? `'${keyword}'에 대한 검색 결과가 없어요.`
            : selected
              ? "이 카테고리에 뉴스가 없어요."
              : "아직 가져온 뉴스가 없어요."}
        </p>
      ) : (
        <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {news.map((n) => (
            <li key={n.id}>
              <NewsCard
                id={n.id}
                saved={n.saved}
                url={n.url}
                source={n.source}
                titleKo={n.titleKo}
                summaryKo={n.summaryKo}
                publishedAt={n.publishedAt}
                categoryId={n.categoryId}
                categoryName={n.categoryName}
              />
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        hrefForPage={hrefForPage}
      />
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
