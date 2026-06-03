import { afterEach, describe, expect, it, vi } from "vitest";
import { createLlmClient, extractJsonObject } from "./llmClient";

describe("LLM JSON client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("extracts JSON from plain content", () => {
    expect(extractJsonObject('{"ok":true}')).toEqual({ ok: true });
  });

  it("extracts JSON from fenced content", () => {
    expect(extractJsonObject('```json\n{"ok":true}\n```')).toEqual({ ok: true });
  });

  it("calls the OpenAI-compatible endpoint without exposing food data outside the request body", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "{\"ok\":true}" } }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 }
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = createLlmClient({
      LLM_BASE_URL: "https://api.deepseek.com",
      LLM_MODEL: "deepseek-v4-flash",
      LLM_API_KEY: "secret-key"
    });

    const result = await client.completeJson([{ role: "user", content: "return json" }]);
    expect(result.json).toEqual({ ok: true });
    expect(result.model).toBe("deepseek-v4-flash");
    expect(result.tokenUsage).toEqual({ prompt: 10, completion: 5, total: 15 });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.deepseek.com/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer secret-key"
        })
      })
    );
  });
});
