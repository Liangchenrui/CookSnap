import type { TokenUsage } from "./logging";
import type { LlmMessage } from "./prompts";

export type LlmClientEnv = {
  LLM_BASE_URL?: string;
  LLM_MODEL?: string;
  LLM_API_KEY?: string;
};

export type LlmJsonResult = {
  json: unknown;
  model: string;
  tokenUsage?: TokenUsage;
};

export type LlmClient = {
  completeJson(messages: LlmMessage[]): Promise<LlmJsonResult>;
};

export function extractJsonObject(content: string): unknown {
  const trimmed = content.trim();
  const unfenced = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(unfenced);
}

export function createLlmClient(
  env: LlmClientEnv = {
    LLM_BASE_URL: process.env.LLM_BASE_URL,
    LLM_MODEL: process.env.LLM_MODEL,
    LLM_API_KEY: process.env.LLM_API_KEY
  }
): LlmClient {
  const baseUrl = env.LLM_BASE_URL?.replace(/\/$/, "") || "https://api.deepseek.com";
  const model = env.LLM_MODEL || "deepseek-v4-flash";
  const apiKey = env.LLM_API_KEY;

  return {
    async completeJson(messages) {
      if (!apiKey) {
        throw new Error("LLM_API_KEY is not configured");
      }

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.3,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`LLM request failed with status ${response.status}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content !== "string") {
        throw new Error("LLM response did not include message content");
      }

      return {
        json: extractJsonObject(content),
        model,
        tokenUsage: data?.usage
          ? {
              prompt: data.usage.prompt_tokens,
              completion: data.usage.completion_tokens,
              total: data.usage.total_tokens
            }
          : undefined
      };
    }
  };
}
