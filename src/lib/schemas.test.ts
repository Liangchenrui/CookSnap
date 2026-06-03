import { describe, expect, it } from "vitest";
import {
  parseIngredientsRequestSchema,
  recommendationResponseSchema,
  recommendRecipesRequestSchema,
  userPreferencesSchema
} from "./schemas";
import { makeIngredient, makePreferences, makeRecipe } from "@/test/factories";

describe("shared schemas", () => {
  it("accepts a valid user preference profile", () => {
    const result = userPreferencesSchema.safeParse(makePreferences());
    expect(result.success).toBe(true);
  });

  it("rejects an unsupported cooking skill", () => {
    const result = userPreferencesSchema.safeParse({
      ...makePreferences(),
      cookingSkill: "expert"
    });
    expect(result.success).toBe(false);
  });

  it("accepts a natural-language ingredient parsing request", () => {
    const result = parseIngredientsRequestSchema.safeParse({
      rawText: "鸡蛋 2 个，番茄 3 个"
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty ingredient parsing text", () => {
    const result = parseIngredientsRequestSchema.safeParse({ rawText: "   " });
    expect(result.success).toBe(false);
  });

  it("accepts a recommendation request with ingredients and preferences", () => {
    const result = recommendRecipesRequestSchema.safeParse({
      ingredients: [makeIngredient()],
      preferences: makePreferences()
    });
    expect(result.success).toBe(true);
  });

  it("rejects a recipe with too many missing non-core ingredients", () => {
    const recipe = makeRecipe({
      missingNonCoreIngredients: [
        { name: "葱", optional: true },
        { name: "姜", optional: true },
        { name: "蒜", optional: true }
      ]
    });
    const result = recommendationResponseSchema.safeParse({
      groups: [{ group: "best_match", title: "最匹配", recipes: [recipe] }]
    });
    expect(result.success).toBe(false);
  });

  it("rejects a recipe with fewer than five steps", () => {
    const recipe = makeRecipe({ steps: ["切菜", "炒熟"] });
    const result = recommendationResponseSchema.safeParse({
      groups: [{ group: "best_match", title: "最匹配", recipes: [recipe] }]
    });
    expect(result.success).toBe(false);
  });
});
