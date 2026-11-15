import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Notion MCP 서버는 코드에서 import하지 않고 자식 프로세스로 실행하므로
  // 파일 추적이 놓친다. 배포 함수에 명시적으로 포함시킨다.
  outputFileTracingIncludes: {
    "/api/notion/save": [
      "./node_modules/@notionhq/notion-mcp-server/bin/**/*",
      // 서버 시작 시 읽는 OpenAPI 스펙. 없으면 프로세스가 바로 종료된다.
      "./node_modules/@notionhq/notion-mcp-server/scripts/notion-openapi.json",
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
