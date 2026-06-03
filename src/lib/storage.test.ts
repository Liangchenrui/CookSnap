import { beforeEach, describe, expect, it } from "vitest";
import { makeIngredient, makePreferences, makeRecipe } from "@/test/factories";
import {
  addHistoryItem,
  clearLocalData,
  loadFavorites,
  loadHistory,
  loadPreferences,
  savePreferences,
  toggleFavorite
} from "./storage";

describe("local storage helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and loads preferences", () => {
    const preferences = makePreferences({ tastes: ["少油"] });
    savePreferences(preferences);
    expect(loadPreferences()).toEqual(preferences);
  });

  it("returns null for invalid stored preferences", () => {
    localStorage.setItem("cookforfree.preferences", JSON.stringify({ tastes: "bad" }));
    expect(loadPreferences()).toBeNull();
  });

  it("prepends history and limits it to 20 entries", () => {
    for (let index = 0; index < 25; index += 1) {
      addHistoryItem({
        id: `history-${index}`,
        createdAt: `2026-06-03T00:${String(index).padStart(2, "0")}:00.000Z`,
        rawInput: "鸡蛋 2 个",
        ingredients: [makeIngredient({ id: `ingredient-${index}` })],
        recipes: [makeRecipe({ id: `recipe-${index}` })]
      });
    }
    const history = loadHistory();
    expect(history).toHaveLength(20);
    expect(history[0]?.id).toBe("history-24");
  });

  it("toggles favorites by recipe id", () => {
    const recipe = makeRecipe();
    toggleFavorite(recipe);
    expect(loadFavorites()).toEqual([recipe]);
    toggleFavorite(recipe);
    expect(loadFavorites()).toEqual([]);
  });

  it("clears all local app data", () => {
    savePreferences(makePreferences());
    toggleFavorite(makeRecipe());
    clearLocalData();
    expect(loadPreferences()).toBeNull();
    expect(loadFavorites()).toEqual([]);
    expect(loadHistory()).toEqual([]);
  });
});
