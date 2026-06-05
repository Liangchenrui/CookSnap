"use client";

import { ArrowLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { UserPreferences } from "@/lib/types";

type ArrayPreferenceKey =
  | "tastes"
  | "allergiesOrAvoids"
  | "cuisinePreferences"
  | "cookware"
  | "pantrySeasonings";

type SettingsPage = "overview" | "defaults" | ArrayPreferenceKey;

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

const checklistSections: { key: ArrayPreferenceKey; title: string; options: string[] }[] = [
  { key: "tastes", title: "口味偏好", options: ["清淡", "少油", "微辣", "重辣", "酸甜", "咸鲜", "少糖"] },
  {
    key: "allergiesOrAvoids",
    title: "忌口/避免",
    options: ["不吃香菜", "不吃葱姜蒜", "不吃辣", "花生过敏", "海鲜过敏", "乳制品过敏"]
  },
  { key: "cuisinePreferences", title: "菜系偏好", options: ["中式家常菜", "川湘", "粤式", "东北菜", "江浙菜", "简餐轻食"] },
  { key: "cookware", title: "常用厨具", options: ["炒锅", "不粘锅", "蒸锅", "电饭煲", "空气炸锅", "烤箱", "微波炉", "汤锅"] },
  {
    key: "pantrySeasonings",
    title: "常备调料",
    options: ["盐", "食用油", "生抽", "老抽", "蚝油", "醋", "白糖", "料酒", "淀粉", "豆瓣酱", "辣椒", "花椒", "胡椒粉", "姜", "蒜", "葱"]
  }
];

export function KitchenProfileForm({
  initialValue,
  isFirstRun = true,
  onSave
}: {
  initialValue?: UserPreferences | null;
  isFirstRun?: boolean;
  onSave: (preferences: UserPreferences) => void;
}) {
  const initialPreferences = initialValue || defaultPreferences;
  const [value, setValue] = useState<UserPreferences>(initialPreferences);
  const [activePage, setActivePage] = useState<SettingsPage>("overview");
  const [servingCountInput, setServingCountInput] = useState(String(initialPreferences.servingCount));
  const [customInputs, setCustomInputs] = useState<Record<ArrayPreferenceKey, string>>({
    tastes: "",
    allergiesOrAvoids: "",
    cuisinePreferences: "",
    cookware: "",
    pantrySeasonings: ""
  });

  function saveNextValue(nextValue: UserPreferences) {
    setValue(nextValue);
    onSave(nextValue);
  }

  function toggleArrayValue(key: ArrayPreferenceKey, option: string) {
    const selected = value[key].includes(option);
    saveNextValue({
      ...value,
      [key]: selected ? value[key].filter((item) => item !== option) : [...value[key], option]
    });
  }

  function setAllArrayValues(key: ArrayPreferenceKey, options: string[]) {
    saveNextValue({ ...value, [key]: options });
  }

  function addCustomItem(key: ArrayPreferenceKey) {
    const item = customInputs[key].trim();
    if (!item) {
      return;
    }

    if (value[key].includes(item)) {
      setCustomInputs((current) => ({ ...current, [key]: "" }));
      return;
    }

    saveNextValue({ ...value, [key]: [...value[key], item] });
    setCustomInputs((current) => ({ ...current, [key]: "" }));
  }

  function updateServingCount(rawValue: string) {
    setServingCountInput(rawValue);
    const nextValue = Number(rawValue);
    if (Number.isInteger(nextValue)) {
      saveNextValue({
        ...value,
        servingCount: Math.min(12, Math.max(1, nextValue))
      });
    }
  }

  function renderHeader() {
    if (isFirstRun) {
      return (
        <div>
          <p className="eyebrow">首次设置</p>
          <h1>先记住你的厨房习惯。</h1>
          <p className="lede">这些偏好会影响推荐结果，和每天输入的现有食材分开保存。</p>
        </div>
      );
    }

    return <h1>设置</h1>;
  }

  function renderOverview() {
    return (
      <div className="settings-list">
        <button className="settings-entry" type="button" aria-label="编辑默认条件" onClick={() => setActivePage("defaults")}>
          <span>默认条件</span>
          <ChevronRight aria-hidden="true" size={18} />
        </button>
        {checklistSections.map((section) => (
          <button
            className="settings-entry"
            key={section.key}
            type="button"
            aria-label={`编辑${section.title}`}
            onClick={() => setActivePage(section.key)}
          >
            <span>{section.title}</span>
            <ChevronRight aria-hidden="true" size={18} />
          </button>
        ))}
      </div>
    );
  }

  function renderDefaultsPage() {
    return (
      <section className="settings-section">
        <div className="subpage-header">
          <button className="link-button" type="button" onClick={() => setActivePage("overview")}>
            <ArrowLeft aria-hidden="true" size={18} /> 返回设置
          </button>
          <h2>默认条件</h2>
        </div>
        <div className="settings-controls">
          <label className="field">
            默认人数
            <input
              max={12}
              min={1}
              onChange={(event) => updateServingCount(event.target.value)}
              type="number"
              value={servingCountInput}
            />
          </label>
          <label className="field">
            烹饪水平
            <select
              onChange={(event) => {
                saveNextValue({
                  ...value,
                  cookingSkill: event.target.value as UserPreferences["cookingSkill"]
                });
              }}
              value={value.cookingSkill}
            >
              <option value="beginner">新手</option>
              <option value="normal">普通</option>
              <option value="skilled">熟练</option>
            </select>
          </label>
          <label className="field">
            最长时间
            <select
              onChange={(event) => {
                saveNextValue({
                  ...value,
                  maxCookingTimeMinutes: Number(event.target.value) as UserPreferences["maxCookingTimeMinutes"]
                });
              }}
              value={value.maxCookingTimeMinutes}
            >
              <option value={15}>15 分钟</option>
              <option value={30}>30 分钟</option>
              <option value={45}>45 分钟</option>
              <option value={60}>60 分钟</option>
            </select>
          </label>
        </div>
      </section>
    );
  }

  function renderChecklistPage(section: (typeof checklistSections)[number]) {
    const options = Array.from(new Set([...section.options, ...value[section.key]]));
    const allSelected = options.length > 0 && options.every((option) => value[section.key].includes(option));
    const allSelectionLabel = allSelected ? `取消全选${section.title}` : `全选${section.title}`;

    return (
      <section className="settings-section">
        <div className="subpage-header">
          <button className="link-button" type="button" onClick={() => setActivePage("overview")}>
            <ArrowLeft aria-hidden="true" size={18} /> 返回设置
          </button>
          <h2>{section.title}</h2>
        </div>
        <button
          className="secondary-button section-action"
          onClick={() => setAllArrayValues(section.key, allSelected ? [] : options)}
          type="button"
        >
          {allSelectionLabel}
        </button>
        <div className="checklist-grid">
          {options.map((option) => (
            <label className="check-row" key={option}>
              <input
                checked={value[section.key].includes(option)}
                onChange={() => toggleArrayValue(section.key, option)}
                type="checkbox"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
        <div className="custom-row">
          <label className="sr-only" htmlFor={`${section.key}-custom`}>
            添加{section.title}
          </label>
          <input
            id={`${section.key}-custom`}
            onChange={(event) => {
              setCustomInputs((current) => ({ ...current, [section.key]: event.target.value }));
            }}
            placeholder={`添加${section.title}`}
            value={customInputs[section.key]}
          />
          <button className="secondary-button" onClick={() => addCustomItem(section.key)} type="button">
            添加{section.title}
          </button>
        </div>
      </section>
    );
  }

  function renderActivePage() {
    if (activePage === "overview") {
      return renderOverview();
    }
    if (activePage === "defaults") {
      return renderDefaultsPage();
    }

    const section = checklistSections.find((item) => item.key === activePage);
    return section ? renderChecklistPage(section) : null;
  }

  return (
    <form
      className="stack"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <section className="surface settings-surface">
        {renderHeader()}
        {renderActivePage()}
      </section>
    </form>
  );
}
