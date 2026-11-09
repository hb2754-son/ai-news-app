// 뉴스 소스는 이 파일에서만 관리한다.
export type NewsSource = {
  name: string;
  url: string;
};

export const NEWS_SOURCES: NewsSource[] = [
  {
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    name: "The Verge AI",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
  {
    // YouTube 채널 피드(Atom). 요약은 media:group의 media:description에 있다.
    name: "슈카월드",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCsJ6RuBiTVWRX156FVbeaGg",
  },
];
