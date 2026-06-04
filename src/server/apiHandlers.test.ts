import { describe, expect, it, vi } from "vitest";
import { makeIngredient, makePreferences, makeRecipe } from "@/test/factories";
import { handleParseIngredients, handleRecommendRecipes } from "./apiHandlers";
import type { LlmClient } from "./llmClient";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": crypto.randomUUID() },
    body: JSON.stringify(body)
  });
}

describe("API handlers", () => {
  it("parses ingredients and assigns ids", async () => {
    const llm: LlmClient = {
      completeJson: vi.fn().mockResolvedValue({
        json: { ingredients: [{ name: "鸡蛋", amountText: "2 个" }] },
        model: "deepseek-v4-flash"
      })
    };

    const response = await handleParseIngredients(jsonRequest({ rawText: "鸡蛋 2 个" }), { llm });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ingredients[0]).toMatchObject({ name: "鸡蛋", amountText: "2 个" });
    expect(body.ingredients[0].id).toEqual(expect.any(String));
  });

  it("does not accept empty parse requests", async () => {
    const response = await handleParseIngredients(jsonRequest({ rawText: " " }));
    expect(response.status).toBe(400);
  });

  it("retries malformed recommendation JSON once", async () => {
    const validRecipe = makeRecipe();
    const llm: LlmClient = {
      completeJson: vi
        .fn()
        .mockResolvedValueOnce({ json: { groups: [] }, model: "deepseek-v4-flash" })
        .mockResolvedValueOnce({
          json: { groups: [{ group: "best_match", title: "最匹配", recipes: [validRecipe] }] },
          model: "deepseek-v4-flash"
        })
    };

    const response = await handleRecommendRecipes(
      jsonRequest({ ingredients: [makeIngredient()], preferences: makePreferences() }),
      { llm }
    );

    expect(response.status).toBe(200);
    expect(llm.completeJson).toHaveBeenCalledTimes(2);
  });

  it("logs recommendation schema issues without raw model output", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const llm: LlmClient = {
      completeJson: vi.fn().mockResolvedValue({
        json: {
          groups: [
            {
              group: "best_match",
              title: "最匹配",
              recipes: [{ name: "番茄炒蛋", difficulty: "简单" }]
            }
          ]
        },
        model: "deepseek-v4-flash"
      })
    };

    const response = await handleRecommendRecipes(
      jsonRequest({ ingredients: [makeIngredient()], preferences: makePreferences() }),
      { llm }
    );

    expect(response.status).toBe(502);
    const logged = JSON.parse(String(spy.mock.calls.at(-1)?.[1]));
    expect(logged).toMatchObject({
      endpoint: "/api/recommend-recipes",
      errorType: "schema_error",
      schemaIssues: expect.arrayContaining([
        expect.objectContaining({
          path: expect.stringContaining("id")
        })
      ])
    });
    expect(JSON.stringify(logged)).not.toContain("番茄炒蛋");
    expect(JSON.stringify(logged)).not.toContain("简单");

    spy.mockRestore();
  });

  it("normalizes common recommendation field variants from the model", async () => {
    const llm: LlmClient = {
      completeJson: vi.fn().mockResolvedValue({
        json: {
          groups: [
            {
              group: "best_match",
              title: "最匹配",
              recipes: [
                {
                  id: 1,
                  name: "番茄炒蛋",
                  group: "best_match",
                  matchReason: "食材匹配，做法简单。",
                  usedIngredients: ["鸡蛋", "番茄"],
                  missingNonCoreIngredients: [],
                  timeMinutes: 15,
                  difficulty: "简单",
                  steps: ["打蛋", "切番茄", "炒鸡蛋", "炒番茄", "合炒调味"],
                  searchKeywords: "番茄炒蛋 家常 做法"
                }
              ]
            }
          ]
        },
        model: "deepseek-v4-flash"
      })
    };

    const response = await handleRecommendRecipes(
      jsonRequest({ ingredients: [makeIngredient()], preferences: makePreferences() }),
      { llm }
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.groups[0].recipes[0]).toMatchObject({
      id: "1",
      difficulty: "easy",
      searchKeywords: {
        xiaohongshu: "番茄炒蛋 家常 做法",
        douyin: "番茄炒蛋 家常 做法"
      }
    });
  });
});
