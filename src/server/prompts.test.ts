import { describe, expect, it } from "vitest";
import { makeIngredient, makePreferences } from "@/test/factories";
import { buildIngredientParseMessages, buildRecipeRecommendationMessages } from "./prompts";

describe("LLM prompts", () => {
  it("asks ingredient parsing to return JSON only", () => {
    const messages = buildIngredientParseMessages("鸡蛋 2 个，番茄 3 个");
    const content = messages.map((message) => message.content).join("\n");
    expect(content).toContain("JSON");
    expect(content).toContain("ingredients");
    expect(content).toContain("鸡蛋 2 个");
  });

  it("includes pantry seasonings as the only guaranteed seasonings", () => {
    const messages = buildRecipeRecommendationMessages([makeIngredient()], makePreferences());
    const content = messages.map((message) => message.content).join("\n");
    expect(content).toContain("Only these pantry seasonings are guaranteed");
    expect(content).toContain("盐");
    expect(content).toContain("at most 1-2 missing non-core ingredients");
  });
});
