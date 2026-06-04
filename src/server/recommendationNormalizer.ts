import type { RecipeDifficulty, RecipeGroupKey } from "@/lib/types";

const DIFFICULTY_ALIASES: Record<string, RecipeDifficulty> = {
  easy: "easy",
  beginner: "easy",
  simple: "easy",
  "简单": "easy",
  "容易": "easy",
  "新手": "easy",
  medium: "medium",
  normal: "medium",
  moderate: "medium",
  "中等": "medium",
  "普通": "medium",
  hard: "hard",
  difficult: "hard",
  advanced: "hard",
  "困难": "hard",
  "较难": "hard",
  "难": "hard"
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeDifficulty(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }
  return DIFFICULTY_ALIASES[value.trim().toLowerCase()] ?? value;
}

function normalizeSearchKeywords(value: unknown) {
  if (typeof value === "string") {
    return {
      xiaohongshu: value,
      douyin: value
    };
  }
  if (Array.isArray(value)) {
    const text = value.filter((item): item is string => typeof item === "string").join(" ");
    return text ? { xiaohongshu: text, douyin: text } : value;
  }
  return value;
}

function normalizeRecipe(recipe: unknown, group: RecipeGroupKey | undefined) {
  if (!isRecord(recipe)) {
    return recipe;
  }

  return {
    ...recipe,
    id: recipe.id === undefined ? recipe.id : String(recipe.id),
    group: recipe.group ?? group,
    difficulty: normalizeDifficulty(recipe.difficulty),
    searchKeywords: normalizeSearchKeywords(recipe.searchKeywords),
    missingNonCoreIngredients: recipe.missingNonCoreIngredients ?? []
  };
}

function normalizeGroup(group: unknown) {
  if (!isRecord(group)) {
    return group;
  }

  const groupKey = typeof group.group === "string" ? (group.group as RecipeGroupKey) : undefined;

  return {
    ...group,
    recipes: Array.isArray(group.recipes) ? group.recipes.map((recipe) => normalizeRecipe(recipe, groupKey)) : group.recipes
  };
}

export function normalizeRecommendationJson(value: unknown) {
  if (!isRecord(value) || !Array.isArray(value.groups)) {
    return value;
  }

  return {
    ...value,
    groups: value.groups.map(normalizeGroup)
  };
}
