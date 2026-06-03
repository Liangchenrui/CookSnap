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
});
