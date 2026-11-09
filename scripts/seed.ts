// 예제 데이터 시드: npx tsx scripts/seed.ts
process.loadEnvFile(".env.local");

const USER_ID = process.env.SEED_USER_ID ?? "user_sample_001";

async function main() {
  const { db } = await import("../src/db");
  const { categories, articles } = await import("../src/db/schema");
  const { and, eq } = await import("drizzle-orm");

  const catData = [
    { name: "LLM", description: "대규모 언어 모델, 챗봇, 모델 출시·성능 비교 관련 뉴스" },
    { name: "이미지·영상", description: "이미지·영상 생성 AI, 멀티모달 모델 관련 뉴스" },
    { name: "로봇", description: "휴머노이드, 산업용 로봇, 피지컬 AI 관련 뉴스" },
    { name: "정책·규제", description: "AI 법안, 저작권, 안전성 규제 관련 뉴스" },
    { name: "비즈니스", description: "투자, 인수합병, 기업 전략, 실적 관련 뉴스" },
  ];

  const existing = await db.select().from(categories).where(eq(categories.userId, USER_ID));
  const idByName = new Map(existing.map((c) => [c.name, c.id]));
  for (const c of catData) {
    if (idByName.has(c.name)) continue;
    const [row] = await db.insert(categories).values({ userId: USER_ID, ...c }).returning();
    idByName.set(row.name, row.id);
  }

  const items = [
    {
      cat: "LLM", source: "TechCrunch AI", date: "2026-11-07T09:00:00Z",
      url: "https://example.com/techcrunch/long-context-model-launch",
      originalTitle: "Startup unveils language model that can read 10 million tokens at once",
      originalSummary: "A new open-weight model claims to process entire codebases in a single prompt while cutting inference costs by 40%.",
      titleKo: "스타트업, 한 번에 1,000만 토큰을 읽는 언어 모델 공개",
      summaryKo: "새로운 오픈 웨이트 모델이 코드베이스 전체를 한 번의 프롬프트로 처리할 수 있다고 밝혔다. 추론 비용도 약 40% 줄였다고 한다.",
    },
    {
      cat: "이미지·영상", source: "The Verge AI", date: "2026-11-06T09:00:00Z",
      url: "https://example.com/verge/text-to-video-90-seconds",
      originalTitle: "New text-to-video tool generates 90-second clips with consistent characters",
      originalSummary: "The update keeps characters and scenes consistent across shots, a long-standing weakness of AI video generators.",
      titleKo: "새 텍스트-투-비디오 도구, 일관된 캐릭터로 90초 영상 생성",
      summaryKo: "이번 업데이트는 장면이 바뀌어도 캐릭터와 배경을 일관되게 유지한다. AI 영상 생성기의 오랜 약점을 보완한 것이다.",
    },
    {
      cat: "로봇", source: "TechCrunch AI", date: "2026-11-05T09:00:00Z",
      url: "https://example.com/techcrunch/humanoid-warehouse-pilot",
      originalTitle: "Humanoid robot maker begins warehouse pilot with a major logistics firm",
      originalSummary: "The pilot will deploy 50 robots to handle sorting and loading tasks over the next six months.",
      titleKo: "휴머노이드 로봇 업체, 대형 물류사와 창고 시범 운영 시작",
      summaryKo: "앞으로 6개월 동안 로봇 50대가 분류와 상차 작업에 투입된다. 이 시범 운영 결과에 따라 상용화 시점이 가늠될 전망이다.",
    },
    {
      cat: "정책·규제", source: "The Verge AI", date: "2026-11-04T09:00:00Z",
      url: "https://example.com/verge/ai-transparency-bill",
      originalTitle: "Lawmakers advance bill requiring disclosure of AI training data sources",
      originalSummary: "The proposal would force developers of large models to publish summaries of the copyrighted material used in training.",
      titleKo: "의원들, AI 학습 데이터 출처 공개 의무화 법안 추진",
      summaryKo: "대형 모델 개발사가 학습에 쓴 저작물의 요약본을 공개하도록 하는 내용이다. 저작권 분쟁이 이어지는 가운데 논의가 속도를 내고 있다.",
    },
    {
      cat: null, source: "TechCrunch AI", date: "2026-11-03T09:00:00Z",
      url: "https://example.com/techcrunch/ai-chip-energy-research",
      originalTitle: "Researchers propose a cooling method that could cut data center energy use",
      originalSummary: "A university team says a new liquid cooling design reduced power draw in AI training clusters by up to 25% in lab tests.",
      titleKo: "연구진, 데이터센터 전력 사용을 줄일 수 있는 냉각 방식 제안",
      summaryKo: "한 대학 연구팀이 새로운 액체 냉각 설계로 AI 학습 클러스터의 전력 소모를 실험실 기준 최대 25% 줄였다고 밝혔다.",
    },
  ];

  await db
    .insert(articles)
    .values(
      items.map(({ cat, date, ...a }) => ({
        userId: USER_ID,
        ...a,
        publishedAt: new Date(date),
        categoryId: cat ? idByName.get(cat)! : null,
      })),
    )
    .onConflictDoNothing({ target: [articles.userId, articles.url] });

  console.log("seed done for", USER_ID);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
