"use client";

import { useState } from "react";
import type { RecommendationHistoryItem, RecipeCard } from "@/lib/types";

export function FavoritesHistory({
  favorites,
  history,
  onRemoveFavorite
}: {
  favorites: RecipeCard[];
  history: RecommendationHistoryItem[];
  onRemoveFavorite: (recipe: RecipeCard) => void;
}) {
  const [tab, setTab] = useState<"favorites" | "history">("favorites");

  return (
    <section className="surface stack">
      <div className="segmented">
        <button className={tab === "favorites" ? "active" : ""} type="button" onClick={() => setTab("favorites")}>
          收藏
        </button>
        <button className={tab === "history" ? "active" : ""} type="button" onClick={() => setTab("history")}>
          历史
        </button>
      </div>
      {tab === "favorites" ? (
        <div className="stack">
          {favorites.length ? (
            favorites.map((recipe) => (
              <article className="compact-card" key={recipe.id}>
                <h3>{recipe.name}</h3>
                <p>{recipe.matchReason}</p>
                <button className="secondary-button" type="button" onClick={() => onRemoveFavorite(recipe)}>
                  取消收藏
                </button>
              </article>
            ))
          ) : (
            <p className="muted">还没有收藏的菜。</p>
          )}
        </div>
      ) : (
        <div className="stack">
          {history.length ? (
            history.map((item) => (
              <article className="compact-card" key={item.id}>
                <h3>{new Date(item.createdAt).toLocaleString("zh-CN")}</h3>
                <p>{item.rawInput}</p>
                <p className="muted">{item.recipes.map((recipe) => recipe.name).join("、")}</p>
              </article>
            ))
          ) : (
            <p className="muted">还没有推荐历史。</p>
          )}
        </div>
      )}
    </section>
  );
}
