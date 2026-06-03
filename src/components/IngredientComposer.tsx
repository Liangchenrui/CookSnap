"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { IngredientItem } from "@/lib/types";

export function IngredientComposer({
  parseIngredients,
  onRecommend
}: {
  parseIngredients: (rawText: string) => Promise<IngredientItem[]>;
  onRecommend: (rawText: string, ingredients: IngredientItem[]) => void;
}) {
  const [rawText, setRawText] = useState("");
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState("");

  async function handleParse() {
    setError("");
    setIsParsing(true);
    try {
      const parsed = await parseIngredients(rawText);
      setIngredients(parsed);
    } catch {
      setError("食材解析失败，请换一种说法。");
    } finally {
      setIsParsing(false);
    }
  }

  function updateIngredient(id: string, patch: Partial<IngredientItem>) {
    setIngredients((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  return (
    <section className="surface stack">
      <div>
        <p className="eyebrow">今天做什么</p>
        <h1>输入家里现有食材。</h1>
      </div>
      <label className="field">
        <span>现有食材</span>
        <textarea
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          rows={4}
          placeholder="例如：鸡蛋 2 个，番茄 3 个，还有一点青菜"
        />
      </label>
      <button className="secondary-button" type="button" disabled={!rawText.trim() || isParsing} onClick={handleParse}>
        {isParsing ? "解析中" : "解析食材"}
      </button>
      {error ? <p className="error-text">{error}</p> : null}
      {ingredients.length ? (
        <div className="tag-editor">
          {ingredients.map((item) => (
            <div className="tag-row" key={item.id}>
              <input
                aria-label={`${item.name} 名称`}
                value={item.name}
                onChange={(event) => updateIngredient(item.id, { name: event.target.value })}
              />
              <input
                aria-label={`${item.name} 数量`}
                value={item.amountText || ""}
                onChange={(event) => updateIngredient(item.id, { amountText: event.target.value })}
                placeholder="数量"
              />
              <button
                aria-label={`删除 ${item.name}`}
                className="icon-button"
                type="button"
                onClick={() => setIngredients((items) => items.filter((existing) => existing.id !== item.id))}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <button
        className="primary-button"
        type="button"
        disabled={!ingredients.length}
        onClick={() => onRecommend(rawText, ingredients)}
      >
        生成推荐
      </button>
    </section>
  );
}
