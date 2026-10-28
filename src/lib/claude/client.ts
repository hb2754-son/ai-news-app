import Anthropic from "@anthropic-ai/sdk";
import { requireEnv } from "@/lib/env";

// 번역·요약·분류는 가벼운 작업이라 Haiku를 쓴다. 모델을 바꿀 때는 여기만 수정한다.
export const CLAUDE_MODEL = "claude-haiku-5-5";

let client: Anthropic | null = null;

export function getClaudeClient() {
  client ??= new Anthropic({ apiKey: requireEnv("ANTHROPIC_API_KEY") });
  return client;
}
