"use client";

import type { UserPreferences } from "@/lib/types";

const defaultPreferences: UserPreferences = {
  tastes: ["清淡"],
  allergiesOrAvoids: [],
  cuisinePreferences: ["中式家常菜"],
  cookware: ["炒锅"],
  pantrySeasonings: ["盐", "生抽", "食用油"],
  servingCount: 1,
  cookingSkill: "beginner",
  maxCookingTimeMinutes: 30
};

export function KitchenProfileForm({
  initialValue,
  onSave
}: {
  initialValue?: UserPreferences | null;
  onSave: (preferences: UserPreferences) => void;
}) {
  const value = initialValue || defaultPreferences;

  return (
    <form
      className="stack"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(value);
      }}
    >
      <section className="surface">
        <p className="eyebrow">首次设置</p>
        <h1>先记住你的厨房习惯。</h1>
        <p className="lede">默认按中式家常菜、新手、30 分钟内推荐。以后可以在设置里修改。</p>
        <div className="chip-grid" aria-label="默认厨房画像">
          {["清淡", "中式家常菜", "炒锅", "盐", "生抽", "食用油", "1 人份", "30 分钟"].map((item) => (
            <span className="chip" key={item}>
              {item}
            </span>
          ))}
        </div>
        <button className="primary-button" type="submit">
          保存厨房画像
        </button>
      </section>
    </form>
  );
}
