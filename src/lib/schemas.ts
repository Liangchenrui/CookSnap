import { z } from "zod";

export const cookingSkillSchema = z.enum(["beginner", "normal", "skilled"]);
export const maxCookingTimeMinutesSchema = z.union([z.literal(15), z.literal(30), z.literal(45), z.literal(60)]);
export const recipeGroupKeySchema = z.enum(["best_match", "fastest", "least_missing"]);
export const recipeDifficultySchema = z.enum(["easy", "medium", "hard"]);

const trimmedString = z.string().trim().min(1);

export const userPreferencesSchema = z.object({
  tastes: z.array(trimmedString),
  allergiesOrAvoids: z.array(trimmedString),
  cuisinePreferences: z.array(trimmedString),
  cookware: z.array(trimmedString),
  pantrySeasonings: z.array(trimmedString),
  servingCount: z.number().int().min(1).max(12),
  cookingSkill: cookingSkillSchema,
  maxCookingTimeMinutes: maxCookingTimeMinutesSchema
});

export const ingredientItemSchema = z.object({
  id: trimmedString,
  name: trimmedString,
  amountText: z.string().trim().optional(),
  note: z.string().trim().optional()
});

export const parseIngredientsRequestSchema = z.object({
  rawText: trimmedString.max(500)
});

export const parseIngredientsResponseSchema = z.object({
  ingredients: z.array(ingredientItemSchema).min(1).max(30)
});

export const missingNonCoreIngredientSchema = z.object({
  name: trimmedString,
  optional: z.boolean(),
  substitute: z.string().trim().optional()
});

export const recipeCardSchema = z.object({
  id: trimmedString,
  name: trimmedString,
  group: recipeGroupKeySchema,
  matchReason: trimmedString,
  usedIngredients: z.array(trimmedString).min(1),
  missingNonCoreIngredients: z.array(missingNonCoreIngredientSchema).max(2),
  timeMinutes: z.number().int().min(1).max(240),
  difficulty: recipeDifficultySchema,
  steps: z.array(trimmedString).min(5).max(7),
  searchKeywords: z.object({
    xiaohongshu: trimmedString,
    douyin: trimmedString
  })
});

export const recipeGroupSchema = z.object({
  group: recipeGroupKeySchema,
  title: trimmedString,
  recipes: z.array(recipeCardSchema)
});

export const recommendationResponseSchema = z.object({
  groups: z.array(recipeGroupSchema).min(1)
});

export const recommendRecipesRequestSchema = z.object({
  ingredients: z.array(ingredientItemSchema).min(1).max(30),
  preferences: userPreferencesSchema
});

export type ParseIngredientsRequest = z.infer<typeof parseIngredientsRequestSchema>;
export type ParseIngredientsResponse = z.infer<typeof parseIngredientsResponseSchema>;
export type RecommendRecipesRequest = z.infer<typeof recommendRecipesRequestSchema>;
export type RecommendationResponseSchemaType = z.infer<typeof recommendationResponseSchema>;
