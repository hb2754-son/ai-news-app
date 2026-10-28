export type RssSource = {
  name: string;
  url: string;
};

// 소스를 추가하려면 배열에 한 줄만 더하면 된다.
export const RSS_SOURCES: RssSource[] = [
  {
    name: "TechCrunch",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    name: "The Verge",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
];
