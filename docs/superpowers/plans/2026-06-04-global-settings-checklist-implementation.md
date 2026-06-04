# Global Settings Checklist Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the one-click default kitchen profile with a checklist-based settings form that saves the existing `UserPreferences` shape.

**Architecture:** Keep the change scoped to the existing client form. `KitchenProfileForm.tsx` owns local form state, preset section definitions, custom item addition, and submit normalization; existing page/storage/API flows continue receiving the same `UserPreferences` object.

**Tech Stack:** Next.js App Router, React client component state, TypeScript domain types, Testing Library, Vitest, existing CSS classes in `src/app/globals.css`.

---

## File Structure

- Modify `src/components/KitchenProfileForm.test.tsx`: expand focused component tests for default submit, checkbox toggling, custom items, and default-condition controls.
- Modify `src/components/KitchenProfileForm.tsx`: replace static default chips with controlled checklist form state while keeping the same props and output type.
- Modify `src/app/globals.css`: add small reusable form styles for settings summary, checkbox rows, section spacing, and compact controls.

No backend, schema, storage, page routing, or API handler changes should be required.

## Task 1: Characterize Current Default Submit

**Files:**
- Modify: `src/components/KitchenProfileForm.test.tsx`
- Verify existing: `src/components/KitchenProfileForm.tsx`

- [ ] **Step 1: Update the existing default-submit test name and expected button label**

Replace the current test body with this version so it remains valid after the button copy changes from `保存厨房画像` to `保存设置`:

```tsx
it("submits the default beginner-friendly profile", async () => {
  const user = userEvent.setup();
  const onSave = vi.fn();
  render(<KitchenProfileForm onSave={onSave} />);

  await user.click(screen.getByRole("button", { name: "保存设置" }));

  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({
      tastes: ["清淡"],
      allergiesOrAvoids: [],
      cuisinePreferences: ["中式家常菜"],
      cookware: ["炒锅"],
      pantrySeasonings: expect.arrayContaining(["盐", "生抽", "食用油"]),
      servingCount: 1,
      cookingSkill: "beginner",
      maxCookingTimeMinutes: 30
    })
  );
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
npm run test:run -- src/components/KitchenProfileForm.test.tsx
```

Expected: FAIL because the current component still renders a static button named `保存厨房画像`.

- [ ] **Step 3: Change only the submit button label**

In `src/components/KitchenProfileForm.tsx`, change:

```tsx
保存厨房画像
```

to:

```tsx
保存设置
```

- [ ] **Step 4: Run the focused test to verify it passes**

Run:

```bash
npm run test:run -- src/components/KitchenProfileForm.test.tsx
```

Expected: PASS with one test.

- [ ] **Step 5: Commit**

```bash
git add src/components/KitchenProfileForm.tsx src/components/KitchenProfileForm.test.tsx
git commit -m "test: characterize kitchen profile default submit"
```

## Task 2: Add Checklist Toggle Coverage

**Files:**
- Modify: `src/components/KitchenProfileForm.test.tsx`
- Modify: `src/components/KitchenProfileForm.tsx`

- [ ] **Step 1: Add a failing test for toggling preset checkbox values**

Append this test inside the existing `describe("KitchenProfileForm", () => { ... })` block:

```tsx
it("saves selected and deselected checklist preferences", async () => {
  const user = userEvent.setup();
  const onSave = vi.fn();
  render(<KitchenProfileForm onSave={onSave} />);

  await user.click(screen.getByLabelText("少油"));
  await user.click(screen.getByLabelText("清淡"));
  await user.click(screen.getByLabelText("蒸锅"));
  await user.click(screen.getByRole("button", { name: "保存设置" }));

  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({
      tastes: ["少油"],
      cookware: expect.arrayContaining(["炒锅", "蒸锅"])
    })
  );
  expect(onSave.mock.calls[0][0].tastes).not.toContain("清淡");
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
npm run test:run -- src/components/KitchenProfileForm.test.tsx
```

Expected: FAIL because no checkbox labeled `少油` or `蒸锅` exists yet.

- [ ] **Step 3: Implement preset section definitions and controlled array toggles**

In `src/components/KitchenProfileForm.tsx`, add React state and section configuration:

```tsx
import { useState } from "react";
import type { UserPreferences } from "@/lib/types";

type ArrayPreferenceKey = "tastes" | "allergiesOrAvoids" | "cuisinePreferences" | "cookware" | "pantrySeasonings";

const checklistSections: { key: ArrayPreferenceKey; title: string; options: string[] }[] = [
  { key: "tastes", title: "口味偏好", options: ["清淡", "少油", "微辣", "重辣", "酸甜", "咸鲜", "少糖"] },
  { key: "allergiesOrAvoids", title: "忌口/避免", options: ["不吃香菜", "不吃葱姜蒜", "不吃辣", "花生过敏", "海鲜过敏", "乳制品过敏"] },
  { key: "cuisinePreferences", title: "菜系偏好", options: ["中式家常菜", "川湘", "粤式", "东北菜", "江浙菜", "简餐轻食"] },
  { key: "cookware", title: "常用厨具", options: ["炒锅", "不粘锅", "蒸锅", "电饭煲", "空气炸锅", "烤箱", "微波炉", "汤锅"] },
  {
    key: "pantrySeasonings",
    title: "常备调料",
    options: ["盐", "食用油", "生抽", "老抽", "蚝油", "醋", "白糖", "料酒", "淀粉", "豆瓣酱", "辣椒", "花椒", "胡椒粉", "姜", "蒜", "葱"]
  }
];
```

Inside `KitchenProfileForm`, replace `const value = initialValue || defaultPreferences;` with:

```tsx
const [value, setValue] = useState<UserPreferences>(initialValue || defaultPreferences);

function toggleArrayValue(key: ArrayPreferenceKey, option: string) {
  setValue((current) => {
    const selected = current[key].includes(option);
    return {
      ...current,
      [key]: selected ? current[key].filter((item) => item !== option) : [...current[key], option]
    };
  });
}
```

Render checklist sections before the submit button:

```tsx
{checklistSections.map((section) => (
  <section className="settings-section" key={section.key}>
    <h2>{section.title}</h2>
    <div className="checklist-grid">
      {section.options.map((option) => (
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
  </section>
))}
```

Keep the existing `onSubmit` shape:

```tsx
onSubmit={(event) => {
  event.preventDefault();
  onSave(value);
}}
```

- [ ] **Step 4: Run the focused test to verify it passes**

Run:

```bash
npm run test:run -- src/components/KitchenProfileForm.test.tsx
```

Expected: PASS with default submit and checklist toggling covered.

- [ ] **Step 5: Commit**

```bash
git add src/components/KitchenProfileForm.tsx src/components/KitchenProfileForm.test.tsx
git commit -m "feat: add kitchen settings checklists"
```

## Task 3: Add Custom Item Coverage

**Files:**
- Modify: `src/components/KitchenProfileForm.test.tsx`
- Modify: `src/components/KitchenProfileForm.tsx`

- [ ] **Step 1: Add a failing test for custom item addition**

Append this test:

```tsx
it("adds a trimmed custom item and ignores duplicates", async () => {
  const user = userEvent.setup();
  const onSave = vi.fn();
  render(<KitchenProfileForm onSave={onSave} />);

  await user.type(screen.getByLabelText("添加常用厨具"), "  砂锅  ");
  await user.click(screen.getByRole("button", { name: "添加常用厨具" }));
  await user.type(screen.getByLabelText("添加常用厨具"), "砂锅");
  await user.click(screen.getByRole("button", { name: "添加常用厨具" }));
  await user.click(screen.getByRole("button", { name: "保存设置" }));

  expect(onSave.mock.calls[0][0].cookware.filter((item: string) => item === "砂锅")).toHaveLength(1);
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
npm run test:run -- src/components/KitchenProfileForm.test.tsx
```

Expected: FAIL because the custom input and add button do not exist yet.

- [ ] **Step 3: Implement custom item local state and add handler**

In `src/components/KitchenProfileForm.tsx`, add:

```tsx
const [customInputs, setCustomInputs] = useState<Record<ArrayPreferenceKey, string>>({
  tastes: "",
  allergiesOrAvoids: "",
  cuisinePreferences: "",
  cookware: "",
  pantrySeasonings: ""
});

function addCustomItem(key: ArrayPreferenceKey) {
  const item = customInputs[key].trim();
  if (!item) return;

  setValue((current) => {
    if (current[key].includes(item)) return current;
    return { ...current, [key]: [...current[key], item] };
  });
  setCustomInputs((current) => ({ ...current, [key]: "" }));
}
```

For each checklist section, derive preset plus selected custom values:

```tsx
const options = Array.from(new Set([...section.options, ...value[section.key]]));
```

Use `options.map(...)` for checkbox rendering, then add the custom input row below:

```tsx
<div className="custom-row">
  <label className="sr-only" htmlFor={`${section.key}-custom`}>
    添加{section.title}
  </label>
  <input
    id={`${section.key}-custom`}
    onChange={(event) =>
      setCustomInputs((current) => ({ ...current, [section.key]: event.target.value }))
    }
    placeholder={`添加${section.title}`}
    value={customInputs[section.key]}
  />
  <button className="secondary-button" onClick={() => addCustomItem(section.key)} type="button">
    添加{section.title}
  </button>
</div>
```

If `sr-only` does not exist in CSS yet, Task 5 adds it. The accessible name should still work once the label exists.

- [ ] **Step 4: Run the focused test to verify it passes**

Run:

```bash
npm run test:run -- src/components/KitchenProfileForm.test.tsx
```

Expected: PASS with custom item coverage.

- [ ] **Step 5: Commit**

```bash
git add src/components/KitchenProfileForm.tsx src/components/KitchenProfileForm.test.tsx
git commit -m "feat: support custom kitchen settings"
```

## Task 4: Add Default Condition Coverage

**Files:**
- Modify: `src/components/KitchenProfileForm.test.tsx`
- Modify: `src/components/KitchenProfileForm.tsx`

- [ ] **Step 1: Add a failing test for serving count, skill, and max time**

Append this test:

```tsx
it("saves default condition controls", async () => {
  const user = userEvent.setup();
  const onSave = vi.fn();
  render(<KitchenProfileForm onSave={onSave} />);

  await user.clear(screen.getByLabelText("默认人数"));
  await user.type(screen.getByLabelText("默认人数"), "3");
  await user.selectOptions(screen.getByLabelText("烹饪水平"), "normal");
  await user.selectOptions(screen.getByLabelText("最长时间"), "45");
  await user.click(screen.getByRole("button", { name: "保存设置" }));

  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({
      servingCount: 3,
      cookingSkill: "normal",
      maxCookingTimeMinutes: 45
    })
  );
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
npm run test:run -- src/components/KitchenProfileForm.test.tsx
```

Expected: FAIL because the default condition controls do not exist yet.

- [ ] **Step 3: Implement constrained default-condition controls**

In `KitchenProfileForm.tsx`, render a `默认条件` section after checklist sections:

```tsx
<section className="settings-section">
  <h2>默认条件</h2>
  <div className="settings-controls">
    <label className="field">
      默认人数
      <input
        max={12}
        min={1}
        onChange={(event) =>
          setValue((current) => ({
            ...current,
            servingCount: Math.min(12, Math.max(1, Number(event.target.value) || 1))
          }))
        }
        type="number"
        value={value.servingCount}
      />
    </label>
    <label className="field">
      烹饪水平
      <select
        onChange={(event) =>
          setValue((current) => ({ ...current, cookingSkill: event.target.value as UserPreferences["cookingSkill"] }))
        }
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
        onChange={(event) =>
          setValue((current) => ({
            ...current,
            maxCookingTimeMinutes: Number(event.target.value) as UserPreferences["maxCookingTimeMinutes"]
          }))
        }
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
```

- [ ] **Step 4: Run the focused test to verify it passes**

Run:

```bash
npm run test:run -- src/components/KitchenProfileForm.test.tsx
```

Expected: PASS with all component tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/KitchenProfileForm.tsx src/components/KitchenProfileForm.test.tsx
git commit -m "feat: add kitchen default condition controls"
```

## Task 5: Add Summary and Polished Mobile Styling

**Files:**
- Modify: `src/components/KitchenProfileForm.tsx`
- Modify: `src/app/globals.css`
- Test: `src/components/KitchenProfileForm.test.tsx`

- [ ] **Step 1: Add a focused summary assertion**

Append this assertion to the default-submit test before clicking save:

```tsx
expect(screen.getByLabelText("已选厨房设置")).toHaveTextContent("清淡");
expect(screen.getByLabelText("已选厨房设置")).toHaveTextContent("炒锅");
expect(screen.getByLabelText("已选厨房设置")).toHaveTextContent("30 分钟");
```

- [ ] **Step 2: Run the focused test to verify it fails if the summary label is missing**

Run:

```bash
npm run test:run -- src/components/KitchenProfileForm.test.tsx
```

Expected: FAIL unless the implementation already added an accessible summary region.

- [ ] **Step 3: Implement selected summary and saved button state**

In `KitchenProfileForm.tsx`, add:

```tsx
const [saved, setSaved] = useState(false);
const summaryItems = [
  ...value.tastes.slice(0, 2),
  ...value.cuisinePreferences.slice(0, 1),
  ...value.cookware.slice(0, 2),
  ...value.pantrySeasonings.slice(0, 3),
  `${value.servingCount} 人份`,
  `${value.maxCookingTimeMinutes} 分钟`
];
```

Update checkbox/custom/default-condition handlers to call `setSaved(false)` before changing state.

Render the summary above the section list:

```tsx
<div aria-label="已选厨房设置" className="settings-summary">
  {summaryItems.map((item) => (
    <span className="chip" key={item}>
      {item}
    </span>
  ))}
</div>
```

Update submit to set saved state after save:

```tsx
onSubmit={(event) => {
  event.preventDefault();
  onSave(value);
  setSaved(true);
}}
```

Update button copy:

```tsx
{saved ? "已保存" : "保存设置"}
```

- [ ] **Step 4: Add CSS for checklist layout**

Append these styles to `src/app/globals.css`:

```css
.settings-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fffaf3;
}

.settings-section {
  display: grid;
  gap: 12px;
  border-top: 1px solid var(--line);
  padding-top: 16px;
}

.settings-section h2 {
  margin: 0;
  font-size: 18px;
  line-height: 1.3;
  letter-spacing: 0;
}

.checklist-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.check-row {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 10px;
  background: #fff;
  color: var(--text);
}

.check-row input {
  width: auto;
  flex: 0 0 auto;
}

.custom-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
}

.settings-controls {
  display: grid;
  gap: 12px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 430px) {
  .checklist-grid,
  .custom-row {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 5: Run focused tests and lint**

Run:

```bash
npm run test:run -- src/components/KitchenProfileForm.test.tsx
npm run lint
```

Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/KitchenProfileForm.tsx src/components/KitchenProfileForm.test.tsx src/app/globals.css
git commit -m "feat: polish kitchen settings form"
```

## Task 6: Final Verification

**Files:**
- Verify: `src/components/KitchenProfileForm.tsx`
- Verify: `src/components/KitchenProfileForm.test.tsx`
- Verify: `src/app/globals.css`

- [ ] **Step 1: Run the smallest relevant component test**

Run:

```bash
npm run test:run -- src/components/KitchenProfileForm.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run the full unit/component suite**

Run:

```bash
npm run test:run
```

Expected: PASS.

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 4: Run production build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 5: Inspect git status**

Run:

```bash
git status --short
```

Expected: clean working tree after the final implementation commit.

