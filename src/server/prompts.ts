import type { IngredientItem, UserPreferences } from "@/lib/types";

export type LlmMessage = {
  role: "system" | "user";
  content: string;
};

export function buildIngredientParseMessages(rawText: string): LlmMessage[] {
  return [
    {
      role: "system",
      content:
        'You parse Chinese cooking ingredient text. Return strict JSON only. The JSON shape is {"ingredients":[{"name":"string","amountText":"string optional","note":"string optional"}]}.'
    },
    {
      role: "user",
      content: `Parse this ingredient input into concise ingredient items:\n${rawText}`
    }
  ];
}

export function buildRecipeRecommendationMessages(ingredients: IngredientItem[], preferences: UserPreferences): LlmMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a practical Chinese home-cooking assistant. Return strict JSON only. Do not include markdown. Generate platform search keywords, not platform-derived content."
    },
    {
      role: "user",
      content: [
        "Recommend dishes for the user.",
        'Return JSON with {"groups":[{"group":"best_match|fastest|least_missing","title":"string","recipes":[RecipeCard]}]}.',
        "RecipeCard fields: id, name, group, matchReason, usedIngredients, missingNonCoreIngredients, timeMinutes, difficulty, steps, searchKeywords.",
        "Each recipe must have 5-7 short actionable steps.",
        "Only these pantry seasonings are guaranteed: " + preferences.pantrySeasonings.join(", "),
        "Do not assume other common seasonings are available.",
        "Allow at most 1-2 missing non-core ingredients.",
        "Do not strongly recommend dishes missing a core ingredient.",
        "Prefer Chinese home cooking unless cuisine preferences indicate otherwise.",
        "Respect allergies or avoidances: " + preferences.allergiesOrAvoids.join(", "),
        "Respect cookware: " + preferences.cookware.join(", "),
        "Respect serving count: " + preferences.servingCount,
        "Respect cooking skill: " + preferences.cookingSkill,
        "Respect max cooking time minutes: " + preferences.maxCookingTimeMinutes,
        "Cuisine preferences: " + preferences.cuisinePreferences.join(", "),
        "Taste preferences: " + preferences.tastes.join(", "),
        "Ingredients: " + JSON.stringify(ingredients)
      ].join("\n")
    }
  ];
}
