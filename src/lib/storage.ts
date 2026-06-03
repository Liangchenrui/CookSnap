import { z } from "zod";
import { ingredientItemSchema, recipeCardSchema, userPreferencesSchema } from "./schemas";
import type { RecommendationHistoryItem, RecipeCard, UserPreferences } from "./types";

const PREFERENCES_KEY = "cookforfree.preferences";
const HISTORY_KEY = "cookforfree.history";
const FAVORITES_KEY = "cookforfree.favorites";
const HISTORY_LIMIT = 20;

const historyItemSchema = z.object({
  id: z.string().trim().min(1),
  createdAt: z.string().trim().min(1),
  rawInput: z.string(),
  ingredients: z.array(ingredientItemSchema),
  recipes: z.array(recipeCardSchema)
});

function hasLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson(key: string): unknown {
  if (!hasLocalStorage()) {
    return null;
  }
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (!hasLocalStorage()) {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadPreferences(): UserPreferences | null {
  const result = userPreferencesSchema.safeParse(readJson(PREFERENCES_KEY));
  return result.success ? result.data : null;
}

export function savePreferences(preferences: UserPreferences) {
  writeJson(PREFERENCES_KEY, preferences);
}

export function loadHistory(): RecommendationHistoryItem[] {
  const raw = readJson(HISTORY_KEY);
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.flatMap((item) => {
    const result = historyItemSchema.safeParse(item);
    return result.success ? [result.data] : [];
  });
}

export function addHistoryItem(item: RecommendationHistoryItem) {
  const next = [item, ...loadHistory().filter((existing) => existing.id !== item.id)].slice(0, HISTORY_LIMIT);
  writeJson(HISTORY_KEY, next);
}

export function loadFavorites(): RecipeCard[] {
  const raw = readJson(FAVORITES_KEY);
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.flatMap((item) => {
    const result = recipeCardSchema.safeParse(item);
    return result.success ? [result.data] : [];
  });
}

export function toggleFavorite(recipe: RecipeCard) {
  const favorites = loadFavorites();
  const exists = favorites.some((item) => item.id === recipe.id);
  writeJson(FAVORITES_KEY, exists ? favorites.filter((item) => item.id !== recipe.id) : [recipe, ...favorites]);
}

export function clearLocalData() {
  if (!hasLocalStorage()) {
    return;
  }
  window.localStorage.removeItem(PREFERENCES_KEY);
  window.localStorage.removeItem(HISTORY_KEY);
  window.localStorage.removeItem(FAVORITES_KEY);
}
