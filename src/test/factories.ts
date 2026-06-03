import type { IngredientItem, RecipeCard, UserPreferences } from "@/lib/types";

export function makePreferences(overrides: Partial<UserPreferences> = {}): UserPreferences {
  return {
    tastes: ["清淡"],
    allergiesOrAvoids: [],
    cuisinePreferences: ["中式家常菜"],
    cookware: ["炒锅"],
    pantrySeasonings: ["盐", "生抽", "食用油"],
    servingCount: 1,
    cookingSkill: "beginner",
    maxCookingTimeMinutes: 30,
    ...overrides
  };
}

export function makeIngredient(overrides: Partial<IngredientItem> = {}): IngredientItem {
  return {
    id: "ingredient-1",
    name: "鸡蛋",
    amountText: "2 个",
    ...overrides
  };
}

export function makeRecipe(overrides: Partial<RecipeCard> = {}): RecipeCard {
  return {
    id: "recipe-1",
    name: "番茄炒蛋",
    group: "best_match",
    matchReason: "主要食材都已具备，做法简单。",
    usedIngredients: ["鸡蛋", "番茄"],
    missingNonCoreIngredients: [],
    timeMinutes: 15,
    difficulty: "easy",
    steps: ["打蛋", "切番茄", "炒鸡蛋", "炒番茄", "合炒调味"],
    searchKeywords: {
      xiaohongshu: "番茄炒蛋 家常 新手 做法",
      douyin: "番茄炒蛋 新手 教程"
    },
    ...overrides
  };
}
