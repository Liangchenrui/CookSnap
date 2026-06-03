export type CookingSkill = "beginner" | "normal" | "skilled";
export type MaxCookingTimeMinutes = 15 | 30 | 45 | 60;
export type RecipeGroupKey = "best_match" | "fastest" | "least_missing";
export type RecipeDifficulty = "easy" | "medium" | "hard";

export type UserPreferences = {
  tastes: string[];
  allergiesOrAvoids: string[];
  cuisinePreferences: string[];
  cookware: string[];
  pantrySeasonings: string[];
  servingCount: number;
  cookingSkill: CookingSkill;
  maxCookingTimeMinutes: MaxCookingTimeMinutes;
};

export type IngredientItem = {
  id: string;
  name: string;
  amountText?: string;
  note?: string;
};

export type MissingNonCoreIngredient = {
  name: string;
  optional: boolean;
  substitute?: string;
};

export type RecipeCard = {
  id: string;
  name: string;
  group: RecipeGroupKey;
  matchReason: string;
  usedIngredients: string[];
  missingNonCoreIngredients: MissingNonCoreIngredient[];
  timeMinutes: number;
  difficulty: RecipeDifficulty;
  steps: string[];
  searchKeywords: {
    xiaohongshu: string;
    douyin: string;
  };
};

export type RecipeGroup = {
  group: RecipeGroupKey;
  title: string;
  recipes: RecipeCard[];
};

export type RecommendationResponse = {
  groups: RecipeGroup[];
};

export type RecommendationHistoryItem = {
  id: string;
  createdAt: string;
  rawInput: string;
  ingredients: IngredientItem[];
  recipes: RecipeCard[];
};
