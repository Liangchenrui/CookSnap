"use client";

import { Settings, Soup, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { FavoritesHistory } from "@/components/FavoritesHistory";
import { IngredientComposer } from "@/components/IngredientComposer";
import { KitchenProfileForm } from "@/components/KitchenProfileForm";
import { RecipeGroups } from "@/components/RecipeGroups";
import {
  addHistoryItem,
  loadFavorites,
  loadHistory,
  loadPreferences,
  savePreferences,
  toggleFavorite
} from "@/lib/storage";
import type { IngredientItem, RecipeCard, RecipeGroup, RecommendationHistoryItem, UserPreferences } from "@/lib/types";

type ActiveTab = "home" | "saved" | "settings";

export default function HomePage() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(() => loadPreferences());
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [groups, setGroups] = useState<RecipeGroup[]>([]);
  const [favorites, setFavorites] = useState<RecipeCard[]>(() => loadFavorites());
  const [history, setHistory] = useState<RecommendationHistoryItem[]>(() => loadHistory());
  const [isRecommending, setIsRecommending] = useState(false);
  const [error, setError] = useState("");

  const favoriteIds = useMemo(() => new Set(favorites.map((recipe) => recipe.id)), [favorites]);

  async function parseIngredients(rawText: string) {
    const response = await fetch("/api/parse-ingredients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawText })
    });
    if (!response.ok) {
      throw new Error("parse failed");
    }
    const body = await response.json();
    return body.ingredients as IngredientItem[];
  }

  async function recommend(rawText: string, ingredients: IngredientItem[]) {
    if (!preferences) {
      setActiveTab("settings");
      return;
    }
    setError("");
    setIsRecommending(true);
    try {
      const response = await fetch("/api/recommend-recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, preferences })
      });
      if (!response.ok) {
        throw new Error("recommendation failed");
      }
      const body = (await response.json()) as { groups: RecipeGroup[] };
      setGroups(body.groups);
      const item = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        rawInput: rawText,
        ingredients,
        recipes: body.groups.flatMap((group) => group.recipes)
      };
      addHistoryItem(item);
      setHistory(loadHistory());
    } catch {
      setError("推荐生成失败，请稍后重试或换一种食材描述。");
    } finally {
      setIsRecommending(false);
    }
  }

  function saveProfile(next: UserPreferences) {
    savePreferences(next);
    setPreferences(next);
    setActiveTab("home");
  }

  function handleFavorite(recipe: RecipeCard) {
    toggleFavorite(recipe);
    setFavorites(loadFavorites());
  }

  if (!preferences || activeTab === "settings") {
    return (
      <main className="app-shell">
        <KitchenProfileForm initialValue={preferences} onSave={saveProfile} />
      </main>
    );
  }

  return (
    <main className="app-shell with-nav">
      {activeTab === "home" ? (
        <div className="stack">
          <IngredientComposer parseIngredients={parseIngredients} onRecommend={recommend} />
          {isRecommending ? <p className="muted">正在生成推荐...</p> : null}
          {error ? <p className="error-text">{error}</p> : null}
          {groups.length ? <RecipeGroups groups={groups} favoriteIds={favoriteIds} onToggleFavorite={handleFavorite} /> : null}
        </div>
      ) : (
        <FavoritesHistory favorites={favorites} history={history} onRemoveFavorite={handleFavorite} />
      )}
      <nav className="bottom-nav" aria-label="主导航">
        <button className={activeTab === "home" ? "active" : ""} type="button" onClick={() => setActiveTab("home")}>
          <Soup size={18} /> 今天做什么
        </button>
        <button className={activeTab === "saved" ? "active" : ""} type="button" onClick={() => setActiveTab("saved")}>
          <Star size={18} /> 收藏
        </button>
        <button type="button" onClick={() => setActiveTab("settings")}>
          <Settings size={18} /> 设置
        </button>
      </nav>
    </main>
  );
}
