"use client";

import { ExternalLink, Heart } from "lucide-react";
import { buildDouyinSearchUrl, buildXiaohongshuSearchUrl } from "@/lib/searchLinks";
import type { RecipeCard, RecipeGroup } from "@/lib/types";

export function RecipeGroups({
  groups,
  favoriteIds,
  onToggleFavorite
}: {
  groups: RecipeGroup[];
  favoriteIds: Set<string>;
  onToggleFavorite: (recipe: RecipeCard) => void;
}) {
  return (
    <section className="stack">
      {groups.map((group) => (
        <div className="surface stack" key={group.group}>
          <h2>{group.title}</h2>
          {group.recipes.map((recipe) => (
            <article className="recipe-card" key={recipe.id}>
              <div className="recipe-card-header">
                <div>
                  <h3>{recipe.name}</h3>
                  <p>{recipe.matchReason}</p>
                </div>
                <button
                  aria-label={favoriteIds.has(recipe.id) ? `取消收藏 ${recipe.name}` : `收藏 ${recipe.name}`}
                  className="icon-button"
                  type="button"
                  onClick={() => onToggleFavorite(recipe)}
                >
                  <Heart size={18} fill={favoriteIds.has(recipe.id) ? "currentColor" : "none"} />
                </button>
              </div>
              <div className="meta-line">
                <span>{recipe.timeMinutes} 分钟</span>
                <span>{recipe.difficulty}</span>
                <span>用到：{recipe.usedIngredients.join("、")}</span>
              </div>
              {recipe.missingNonCoreIngredients.length ? (
                <p className="missing-line">
                  缺：
                  {recipe.missingNonCoreIngredients
                    .map((item) => `${item.name}${item.substitute ? ` 可用 ${item.substitute}` : ""}`)
                    .join("；")}
                </p>
              ) : null}
              <ol>
                {recipe.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <div className="button-row">
                <a className="link-button" href={buildXiaohongshuSearchUrl(recipe.searchKeywords.xiaohongshu)} target="_blank">
                  小红书 <ExternalLink size={16} />
                </a>
                <a className="link-button" href={buildDouyinSearchUrl(recipe.searchKeywords.douyin)} target="_blank">
                  抖音 <ExternalLink size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>
      ))}
    </section>
  );
}
