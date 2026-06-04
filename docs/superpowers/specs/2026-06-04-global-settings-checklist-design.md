# CookSnap Global Settings Checklist Design

Date: 2026-06-04

## Goal

Upgrade the global kitchen settings from a one-click default profile into an editable checklist-based preferences page.

The page should let users quickly describe their common cookware, pantry seasonings, taste preferences, cuisine preferences, avoidances, serving count, skill level, and default cooking time. These settings should improve recipe recommendation quality while staying inside the existing MVP and local-first data model.

## Scope

### In Scope

- A fuller settings page shared by first-run setup and later settings edits.
- Checklist sections for common kitchen preferences.
- Custom item entry for array-based sections.
- A compact selected-preferences summary near the top of the page.
- Local persistence through the existing preferences storage path.
- Continued use of the existing `UserPreferences` shape.

### Out of Scope

- User accounts or cross-device sync.
- Full pantry or fridge inventory management.
- Per-meal temporary overrides.
- Ingredient availability tracking beyond the daily ingredient input.
- New backend preference fields or a changed recommendation API contract.
- Semantic normalization of custom entries such as merging `葱` and `小葱`.

## Product Requirements

### Page Structure

The settings page should start with a short explanation that these preferences affect recommendations and are separate from the daily ingredient input.

Below the explanation, show a selected-preferences summary. The summary should display a small set of currently selected values, such as:

- `清淡`
- `炒锅`
- `生抽`
- `30 分钟`

The summary is informational. Editing happens in the sections below.

The main body is a sectioned checklist:

1. `口味偏好`
2. `忌口/避免`
3. `菜系偏好`
4. `常用厨具`
5. `常备调料`
6. `默认条件`

### Checklist Sections

Each array-based section should render common options as real checkbox rows. Clicking the row toggles the checkbox.

Recommended default option sets:

#### 口味偏好

- 清淡
- 少油
- 微辣
- 重辣
- 酸甜
- 咸鲜
- 少糖

#### 忌口/避免

- 不吃香菜
- 不吃葱姜蒜
- 不吃辣
- 花生过敏
- 海鲜过敏
- 乳制品过敏

#### 菜系偏好

- 中式家常菜
- 川湘
- 粤式
- 东北菜
- 江浙菜
- 简餐轻食

#### 常用厨具

- 炒锅
- 不粘锅
- 蒸锅
- 电饭煲
- 空气炸锅
- 烤箱
- 微波炉
- 汤锅

#### 常备调料

- 盐
- 食用油
- 生抽
- 老抽
- 蚝油
- 醋
- 白糖
- 料酒
- 淀粉
- 豆瓣酱
- 辣椒
- 花椒
- 胡椒粉
- 姜
- 蒜
- 葱

### Custom Items

All array-based sections except `默认条件` should support adding a custom item.

Custom item behavior:

- Trim surrounding whitespace before saving.
- Ignore empty custom items.
- Do not add an exact duplicate already present in the same section.
- Display custom selected items together with preset selected items.
- Allow users to uncheck custom items after adding them.

No semantic merging is required. Similar but non-identical values should remain separate.

### Default Conditions

The `默认条件` section should keep the existing constrained fields:

- Serving count: integer from 1 to 12.
- Cooking skill:
  - `beginner`
  - `normal`
  - `skilled`
- Max cooking time:
  - `15`
  - `30`
  - `45`
  - `60`

The UI can use segmented controls, select controls, or compact buttons as long as the saved values match the existing schema.

## Default Profile

When no saved profile exists, the settings page should start from the current default profile:

```ts
{
  tastes: ["清淡"],
  allergiesOrAvoids: [],
  cuisinePreferences: ["中式家常菜"],
  cookware: ["炒锅"],
  pantrySeasonings: ["盐", "生抽", "食用油"],
  servingCount: 1,
  cookingSkill: "beginner",
  maxCookingTimeMinutes: 30
}
```

Users should be able to save this default profile without changing anything.

## Interaction Model

- The first-run setup and later settings view should use the same form component.
- Selecting or deselecting an item updates local form state immediately.
- Saving writes the complete `UserPreferences` object through the existing `onSave` path.
- If the user entered settings because no profile exists, saving should return them to the home flow.
- If the user entered settings from the app navigation, saving can leave them on the settings view or return them to the prior main view, whichever matches the smallest existing navigation change.
- After a successful save, show a lightweight saved state such as `已保存` or an equivalent button state.

## Data Model

This feature must keep the existing `UserPreferences` shape:

```ts
type UserPreferences = {
  tastes: string[];
  allergiesOrAvoids: string[];
  cuisinePreferences: string[];
  cookware: string[];
  pantrySeasonings: string[];
  servingCount: number;
  cookingSkill: "beginner" | "normal" | "skilled";
  maxCookingTimeMinutes: 15 | 30 | 45 | 60;
};
```

The recommendation request should continue sending `preferences` in the current API contract. No backend schema change is required.

## Error Handling

The settings form should be resilient to normal local form issues:

- Empty custom inputs are ignored.
- Duplicate custom entries in the same section are ignored.
- Invalid numeric serving count should not be saved; the UI should constrain the value before submit.
- Existing storage validation remains responsible for rejecting malformed stored preferences.

## Verification Criteria

### Product Checks

- A new user can save the default kitchen profile in under 1 minute.
- A user can select and deselect common cookware, seasonings, taste preferences, cuisine preferences, and avoidances.
- A user can add a custom item to an array-based section and save it.
- Refreshing the page preserves saved settings.
- Recipe recommendation requests still include the same `preferences` contract.

### Engineering Checks

- Component tests cover submitting the default profile.
- Component tests cover toggling at least one checklist option.
- Component tests cover adding and saving a custom item.
- Component tests cover saving serving count, cooking skill, and max cooking time.
- Existing storage and recommendation request tests continue to pass.

## Risks and Tradeoffs

- More visible options can make first-run setup feel heavier. The summary and defaults mitigate this by letting users save quickly without changing everything.
- Preset lists may not cover every household. Custom items provide a simple escape hatch without expanding the data model.
- Custom entries are literal strings. This keeps implementation simple but means the app will not automatically merge similar words.
- Pantry seasonings affect recommendation quality strongly because the backend treats only configured seasonings as guaranteed. The UI should make this section easy to scan and edit.
