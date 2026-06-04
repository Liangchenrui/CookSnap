# 随手做 CookSnap MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved 随手做 CookSnap MVP: a mobile-first PWA that stores user kitchen preferences locally, accepts natural-language ingredients, calls a thin backend LLM proxy, and renders grouped recipe recommendations with tutorial search links.

**Architecture:** Use a single Next.js App Router project. The browser owns preferences, history, and favorites through local storage; API routes own request validation, prompt assembly, DeepSeek-compatible LLM calls, schema validation, retry, rate limiting, and sanitized technical logging. Shared TypeScript types and Zod schemas keep frontend and backend contracts aligned.

**Tech Stack:** Next.js App Router, TypeScript, React, Zod, lucide-react, Vitest, Testing Library, Playwright, localStorage, server-side `fetch` for the OpenAI-compatible LLM endpoint.

---

## Task Boundary

This plan implements only the approved MVP in `docs/superpowers/specs/2026-06-03-cooksnap-mvp-design.md`.

It does not add accounts, cross-device sync, image recognition, platform crawling, nutrition features, or full fridge inventory management.

The real LLM API key must never be committed. Use `.env.local` for local execution and `.env.example` for documented variable names.

## File Structure

Create these files:

- `package.json` - npm scripts and dependencies.
- `package-lock.json` - npm lockfile produced by install.
- `.gitignore` - excludes dependencies, build output, and local secrets.
- `.env.example` - documents required environment variables without secrets.
- `next.config.mjs` - minimal Next.js config.
- `tsconfig.json` - TypeScript config with `@/*` path alias.
- `eslint.config.mjs` - ESLint config.
- `vitest.config.ts` - Vitest config for jsdom tests.
- `vitest.setup.ts` - Testing Library matchers.
- `playwright.config.ts` - Playwright config.
- `public/manifest.webmanifest` - PWA manifest.
- `public/icon.svg` - simple install icon.
- `src/app/layout.tsx` - root metadata and shell.
- `src/app/page.tsx` - client-side app coordinator.
- `src/app/globals.css` - mobile-first styling.
- `src/app/api/parse-ingredients/route.ts` - ingredient parsing API route.
- `src/app/api/recommend-recipes/route.ts` - recipe recommendation API route.
- `src/components/KitchenProfileForm.tsx` - first-run and settings form.
- `src/components/IngredientComposer.tsx` - natural-language input and editable tags.
- `src/components/RecipeGroups.tsx` - grouped recipe cards and search actions.
- `src/components/FavoritesHistory.tsx` - local favorites and history tabs.
- `src/lib/types.ts` - shared domain types.
- `src/lib/schemas.ts` - shared Zod schemas and validators.
- `src/lib/storage.ts` - browser local storage helpers.
- `src/lib/searchLinks.ts` - Xiaohongshu and Douyin search URL builders.
- `src/server/prompts.ts` - LLM prompt builders.
- `src/server/llmClient.ts` - OpenAI-compatible JSON completion client.
- `src/server/apiHandlers.ts` - route logic with injectable dependencies.
- `src/server/logging.ts` - sanitized technical logging.
- `src/server/rateLimit.ts` - small in-memory rate limiter.
- `src/test/factories.ts` - test fixtures.
- `tests/e2e/mvp-flow.spec.ts` - Playwright happy path with mocked API responses.

## Task 1: Bootstrap Next.js App and Test Harness

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `next.config.mjs`
- Create: `tsconfig.json`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `playwright.config.ts`
- Create: `public/manifest.webmanifest`
- Create: `public/icon.svg`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`

- [ ] **Step 1: Initialize npm workspace**

Run:

```powershell
npm init -y
```

Expected: command exits 0 and creates `package.json`.

- [ ] **Step 2: Install runtime dependencies**

Run:

```powershell
npm install next react react-dom zod lucide-react
```

Expected: command exits 0 and writes dependency versions to `package.json` and `package-lock.json`.

- [ ] **Step 3: Install development dependencies**

Run:

```powershell
npm install -D typescript @types/node @types/react @types/react-dom eslint eslint-config-next vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @playwright/test
```

Expected: command exits 0 and writes dev dependency versions to `package.json` and `package-lock.json`.

- [ ] **Step 4: Set package scripts**

Run:

```powershell
npm pkg set private=true
npm pkg set scripts.dev="next dev"
npm pkg set scripts.build="next build"
npm pkg set scripts.start="next start"
npm pkg set scripts.lint="eslint ."
npm pkg set scripts.test="vitest --passWithNoTests"
npm pkg set scripts.test:run="vitest run --passWithNoTests"
npm pkg set scripts.e2e="playwright test"
```

Expected: `package.json` contains the listed scripts.

- [ ] **Step 5: Add base ignore rules**

Create `.gitignore`:

```gitignore
node_modules/
.next/
out/
coverage/
test-results/
playwright-report/
.env
.env.local
.env.*.local
npm-debug.log*
```

- [ ] **Step 6: Add environment variable example**

Create `.env.example`:

```text
LLM_BASE_URL=https://api.deepseek.com
LLM_MODEL=deepseek-v4-flash
LLM_API_KEY=
```

- [ ] **Step 7: Add Next.js config**

Create `next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

- [ ] **Step 8: Add TypeScript config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 9: Add ESLint config**

Create `eslint.config.mjs`:

```js
import next from "eslint-config-next";

export default [
  ...next,
  {
    ignores: [".next/**", "node_modules/**", "playwright-report/**", "test-results/**"]
  }
];
```

- [ ] **Step 10: Add Vitest config**

Create `vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"]
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname
    }
  }
});
```

Create `vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 11: Add Playwright config**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure"
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3000",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120_000
  },
  projects: [
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] }
    }
  ]
});
```

- [ ] **Step 12: Add PWA manifest and icon**

Create `public/manifest.webmanifest`:

```json
{
  "name": "随手做 CookSnap",
  "short_name": "随手做 CookSnap",
  "description": "A mobile cooking assistant for ingredients you already have.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fffaf3",
  "theme_color": "#2f6f4e",
  "icons": [
    {
      "src": "/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ]
}
```

Create `public/icon.svg`:

```xml
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#fffaf3"/>
  <path d="M154 158c0-23 18-41 41-41h122c23 0 41 18 41 41v16H154v-16Z" fill="#2f6f4e"/>
  <path d="M126 194h260l-23 180c-4 29-29 51-58 51h-98c-29 0-54-22-58-51l-23-180Z" fill="#f2b84b"/>
  <path d="M183 245h146M196 302h120M213 359h86" stroke="#33261d" stroke-width="24" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 13: Add root layout**

Create `src/app/layout.tsx`:

```tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "随手做 CookSnap",
  description: "Find what to cook from ingredients you already have.",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#2f6f4e",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 14: Add temporary app shell**

Create `src/app/page.tsx`:

```tsx
export default function HomePage() {
  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">随手做 CookSnap</p>
        <h1>今天家里有什么，就做什么。</h1>
        <p className="lede">输入现有食材，稍后这里会展示可做菜品推荐。</p>
      </section>
    </main>
  );
}
```

Create `src/app/globals.css`:

```css
:root {
  color-scheme: light;
  --bg: #fffaf3;
  --panel: #ffffff;
  --text: #241c17;
  --muted: #766b62;
  --line: #e8ddd1;
  --accent: #2f6f4e;
  --accent-strong: #24583e;
  --gold: #f2b84b;
  --danger: #b84a3a;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  min-height: 100%;
  background: var(--bg);
  color: var(--text);
  font-family: Arial, "Microsoft YaHei", sans-serif;
}

button,
input,
textarea,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

.app-shell {
  min-height: 100vh;
  max-width: 720px;
  margin: 0 auto;
  padding: 20px;
}

.hero-panel {
  padding: 28px 0;
}

.eyebrow {
  margin: 0 0 10px;
  color: var(--accent);
  font-size: 14px;
  font-weight: 700;
}

h1 {
  margin: 0;
  font-size: 32px;
  line-height: 1.15;
  letter-spacing: 0;
}

.lede {
  margin: 14px 0 0;
  color: var(--muted);
  line-height: 1.6;
}
```

- [ ] **Step 15: Verify base app**

Run:

```powershell
npm run lint
npm run test:run
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 16: Commit scaffold**

Run:

```powershell
git add .gitignore .env.example next.config.mjs tsconfig.json eslint.config.mjs vitest.config.ts vitest.setup.ts playwright.config.ts package.json package-lock.json public src/app
git commit -m "chore: scaffold cooksnap app"
```

Expected: commit succeeds.

## Task 2: Add Shared Types and Schemas

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/schemas.ts`
- Create: `src/test/factories.ts`
- Create: `src/lib/schemas.test.ts`

- [ ] **Step 1: Write schema tests**

Create `src/lib/schemas.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  parseIngredientsRequestSchema,
  recommendationResponseSchema,
  recommendRecipesRequestSchema,
  userPreferencesSchema
} from "./schemas";
import { makeIngredient, makePreferences, makeRecipe } from "@/test/factories";

describe("shared schemas", () => {
  it("accepts a valid user preference profile", () => {
    const result = userPreferencesSchema.safeParse(makePreferences());
    expect(result.success).toBe(true);
  });

  it("rejects an unsupported cooking skill", () => {
    const result = userPreferencesSchema.safeParse({
      ...makePreferences(),
      cookingSkill: "expert"
    });
    expect(result.success).toBe(false);
  });

  it("accepts a natural-language ingredient parsing request", () => {
    const result = parseIngredientsRequestSchema.safeParse({
      rawText: "鸡蛋 2 个，番茄 3 个"
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty ingredient parsing text", () => {
    const result = parseIngredientsRequestSchema.safeParse({ rawText: "   " });
    expect(result.success).toBe(false);
  });

  it("accepts a recommendation request with ingredients and preferences", () => {
    const result = recommendRecipesRequestSchema.safeParse({
      ingredients: [makeIngredient()],
      preferences: makePreferences()
    });
    expect(result.success).toBe(true);
  });

  it("rejects a recipe with too many missing non-core ingredients", () => {
    const recipe = makeRecipe({
      missingNonCoreIngredients: [
        { name: "葱", optional: true },
        { name: "姜", optional: true },
        { name: "蒜", optional: true }
      ]
    });
    const result = recommendationResponseSchema.safeParse({
      groups: [{ group: "best_match", title: "最匹配", recipes: [recipe] }]
    });
    expect(result.success).toBe(false);
  });

  it("rejects a recipe with fewer than five steps", () => {
    const recipe = makeRecipe({ steps: ["切菜", "炒熟"] });
    const result = recommendationResponseSchema.safeParse({
      groups: [{ group: "best_match", title: "最匹配", recipes: [recipe] }]
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```powershell
npm run test:run -- src/lib/schemas.test.ts
```

Expected: FAIL because `src/lib/schemas.ts` and `src/test/factories.ts` do not exist.

- [ ] **Step 3: Add domain types**

Create `src/lib/types.ts`:

```ts
export type CookingSkill = "beginner" | "normal" | "skilled";
export type MaxCookingTimeMinutes = 15 | 30 | 45 | 60;
export type RecipeGroupKey = "best_match" | "fastest" | "least_missing";
export type RecipeDifficulty = "easy" | "medium" | "hard";

export type UserPreferences = {
  tastes: string[];
  allergiesOrAvoids: string[];
  cuisinePreferences: string[];
  cookware: string[];
  pantrySeasonings: string[];
  servingCount: number;
  cookingSkill: CookingSkill;
  maxCookingTimeMinutes: MaxCookingTimeMinutes;
};

export type IngredientItem = {
  id: string;
  name: string;
  amountText?: string;
  note?: string;
};

export type MissingNonCoreIngredient = {
  name: string;
  optional: boolean;
  substitute?: string;
};

export type RecipeCard = {
  id: string;
  name: string;
  group: RecipeGroupKey;
  matchReason: string;
  usedIngredients: string[];
  missingNonCoreIngredients: MissingNonCoreIngredient[];
  timeMinutes: number;
  difficulty: RecipeDifficulty;
  steps: string[];
  searchKeywords: {
    xiaohongshu: string;
    douyin: string;
  };
};

export type RecipeGroup = {
  group: RecipeGroupKey;
  title: string;
  recipes: RecipeCard[];
};

export type RecommendationResponse = {
  groups: RecipeGroup[];
};

export type RecommendationHistoryItem = {
  id: string;
  createdAt: string;
  rawInput: string;
  ingredients: IngredientItem[];
  recipes: RecipeCard[];
};
```

- [ ] **Step 4: Add Zod schemas**

Create `src/lib/schemas.ts`:

```ts
import { z } from "zod";

export const cookingSkillSchema = z.enum(["beginner", "normal", "skilled"]);
export const maxCookingTimeMinutesSchema = z.union([
  z.literal(15),
  z.literal(30),
  z.literal(45),
  z.literal(60)
]);
export const recipeGroupKeySchema = z.enum(["best_match", "fastest", "least_missing"]);
export const recipeDifficultySchema = z.enum(["easy", "medium", "hard"]);

const trimmedString = z.string().trim().min(1);

export const userPreferencesSchema = z.object({
  tastes: z.array(trimmedString),
  allergiesOrAvoids: z.array(trimmedString),
  cuisinePreferences: z.array(trimmedString),
  cookware: z.array(trimmedString),
  pantrySeasonings: z.array(trimmedString),
  servingCount: z.number().int().min(1).max(12),
  cookingSkill: cookingSkillSchema,
  maxCookingTimeMinutes: maxCookingTimeMinutesSchema
});

export const ingredientItemSchema = z.object({
  id: trimmedString,
  name: trimmedString,
  amountText: z.string().trim().optional(),
  note: z.string().trim().optional()
});

export const parseIngredientsRequestSchema = z.object({
  rawText: trimmedString.max(500)
});

export const parseIngredientsResponseSchema = z.object({
  ingredients: z.array(ingredientItemSchema).min(1).max(30)
});

export const missingNonCoreIngredientSchema = z.object({
  name: trimmedString,
  optional: z.boolean(),
  substitute: z.string().trim().optional()
});

export const recipeCardSchema = z.object({
  id: trimmedString,
  name: trimmedString,
  group: recipeGroupKeySchema,
  matchReason: trimmedString,
  usedIngredients: z.array(trimmedString).min(1),
  missingNonCoreIngredients: z.array(missingNonCoreIngredientSchema).max(2),
  timeMinutes: z.number().int().min(1).max(240),
  difficulty: recipeDifficultySchema,
  steps: z.array(trimmedString).min(5).max(7),
  searchKeywords: z.object({
    xiaohongshu: trimmedString,
    douyin: trimmedString
  })
});

export const recipeGroupSchema = z.object({
  group: recipeGroupKeySchema,
  title: trimmedString,
  recipes: z.array(recipeCardSchema)
});

export const recommendationResponseSchema = z.object({
  groups: z.array(recipeGroupSchema).min(1)
});

export const recommendRecipesRequestSchema = z.object({
  ingredients: z.array(ingredientItemSchema).min(1).max(30),
  preferences: userPreferencesSchema
});

export type ParseIngredientsRequest = z.infer<typeof parseIngredientsRequestSchema>;
export type ParseIngredientsResponse = z.infer<typeof parseIngredientsResponseSchema>;
export type RecommendRecipesRequest = z.infer<typeof recommendRecipesRequestSchema>;
export type RecommendationResponseSchemaType = z.infer<typeof recommendationResponseSchema>;
```

- [ ] **Step 5: Add test factories**

Create `src/test/factories.ts`:

```ts
import type { IngredientItem, RecipeCard, UserPreferences } from "@/lib/types";

export function makePreferences(overrides: Partial<UserPreferences> = {}): UserPreferences {
  return {
    tastes: ["清淡"],
    allergiesOrAvoids: [],
    cuisinePreferences: ["中式家常菜"],
    cookware: ["炒锅"],
    pantrySeasonings: ["盐", "生抽", "食用油"],
    servingCount: 1,
    cookingSkill: "beginner",
    maxCookingTimeMinutes: 30,
    ...overrides
  };
}

export function makeIngredient(overrides: Partial<IngredientItem> = {}): IngredientItem {
  return {
    id: "ingredient-1",
    name: "鸡蛋",
    amountText: "2 个",
    ...overrides
  };
}

export function makeRecipe(overrides: Partial<RecipeCard> = {}): RecipeCard {
  return {
    id: "recipe-1",
    name: "番茄炒蛋",
    group: "best_match",
    matchReason: "主要食材都已具备，做法简单。",
    usedIngredients: ["鸡蛋", "番茄"],
    missingNonCoreIngredients: [],
    timeMinutes: 15,
    difficulty: "easy",
    steps: ["打蛋", "切番茄", "炒鸡蛋", "炒番茄", "合炒调味"],
    searchKeywords: {
      xiaohongshu: "番茄炒蛋 家常 新手 做法",
      douyin: "番茄炒蛋 新手 教程"
    },
    ...overrides
  };
}
```

- [ ] **Step 6: Verify schemas pass**

Run:

```powershell
npm run test:run -- src/lib/schemas.test.ts
npm run lint
```

Expected: both commands exit 0.

- [ ] **Step 7: Commit shared contracts**

Run:

```powershell
git add src/lib/types.ts src/lib/schemas.ts src/lib/schemas.test.ts src/test/factories.ts
git commit -m "feat: add shared recipe contracts"
```

Expected: commit succeeds.

## Task 3: Add Local Storage and Search Link Utilities

**Files:**
- Create: `src/lib/storage.ts`
- Create: `src/lib/storage.test.ts`
- Create: `src/lib/searchLinks.ts`
- Create: `src/lib/searchLinks.test.ts`

- [ ] **Step 1: Write local storage tests**

Create `src/lib/storage.test.ts`:

```ts
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
    localStorage.setItem("cooksnap.preferences", JSON.stringify({ tastes: "bad" }));
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
```

- [ ] **Step 2: Write search link tests**

Create `src/lib/searchLinks.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildDouyinSearchUrl, buildXiaohongshuSearchUrl } from "./searchLinks";

describe("search link builders", () => {
  it("builds a Xiaohongshu search URL with encoded keyword", () => {
    const url = buildXiaohongshuSearchUrl("番茄炒蛋 家常");
    expect(url).toContain("xiaohongshu.com/search_result");
    expect(url).toContain(encodeURIComponent("番茄炒蛋 家常"));
  });

  it("builds a Douyin search URL with encoded keyword", () => {
    const url = buildDouyinSearchUrl("番茄炒蛋 教程");
    expect(url).toContain("douyin.com/search");
    expect(url).toContain(encodeURIComponent("番茄炒蛋 教程"));
  });
});
```

- [ ] **Step 3: Run tests and verify they fail**

Run:

```powershell
npm run test:run -- src/lib/storage.test.ts src/lib/searchLinks.test.ts
```

Expected: FAIL because the utility files do not exist.

- [ ] **Step 4: Implement local storage helpers**

Create `src/lib/storage.ts`:

```ts
import type { RecommendationHistoryItem, RecipeCard, UserPreferences } from "./types";
import {
  recommendationResponseSchema,
  userPreferencesSchema
} from "./schemas";

const PREFERENCES_KEY = "cooksnap.preferences";
const HISTORY_KEY = "cooksnap.history";
const FAVORITES_KEY = "cooksnap.favorites";
const HISTORY_LIMIT = 20;

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
  return raw.filter((item): item is RecommendationHistoryItem => {
    return (
      typeof item === "object" &&
      item !== null &&
      typeof item.id === "string" &&
      typeof item.createdAt === "string" &&
      typeof item.rawInput === "string" &&
      Array.isArray(item.ingredients) &&
      recommendationResponseSchema.safeParse({ groups: [{ group: "best_match", title: "history", recipes: item.recipes }] }).success
    );
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
  return raw.filter((item): item is RecipeCard => {
    return recommendationResponseSchema.safeParse({
      groups: [{ group: "best_match", title: "favorites", recipes: [item] }]
    }).success;
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
```

- [ ] **Step 5: Implement search link builders**

Create `src/lib/searchLinks.ts`:

```ts
export function buildXiaohongshuSearchUrl(keyword: string) {
  return `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(keyword)}`;
}

export function buildDouyinSearchUrl(keyword: string) {
  return `https://www.douyin.com/search/${encodeURIComponent(keyword)}`;
}
```

- [ ] **Step 6: Verify utilities pass**

Run:

```powershell
npm run test:run -- src/lib/storage.test.ts src/lib/searchLinks.test.ts
npm run lint
```

Expected: both commands exit 0.

- [ ] **Step 7: Commit local utilities**

Run:

```powershell
git add src/lib/storage.ts src/lib/storage.test.ts src/lib/searchLinks.ts src/lib/searchLinks.test.ts
git commit -m "feat: add local app persistence"
```

Expected: commit succeeds.

## Task 4: Add Sanitized Logging and Rate Limiting

**Files:**
- Create: `src/server/logging.ts`
- Create: `src/server/logging.test.ts`
- Create: `src/server/rateLimit.ts`
- Create: `src/server/rateLimit.test.ts`

- [ ] **Step 1: Write logging tests**

Create `src/server/logging.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { logTechnicalEvent } from "./logging";

describe("technical logging", () => {
  it("logs only approved technical fields", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => undefined);

    logTechnicalEvent({
      endpoint: "/api/recommend-recipes",
      durationMs: 1200,
      model: "deepseek-v4-flash",
      tokenUsage: { prompt: 100, completion: 200, total: 300 },
      errorType: "schema_error"
    });

    const logged = JSON.parse(String(spy.mock.calls[0]?.[1]));
    expect(logged).toMatchObject({
      endpoint: "/api/recommend-recipes",
      durationMs: 1200,
      model: "deepseek-v4-flash",
      tokenUsage: { prompt: 100, completion: 200, total: 300 },
      errorType: "schema_error"
    });
    expect(JSON.stringify(logged)).not.toContain("鸡蛋");

    spy.mockRestore();
  });
});
```

- [ ] **Step 2: Write rate limit tests**

Create `src/server/rateLimit.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rateLimit";

describe("rate limiter", () => {
  it("allows requests below the limit and blocks requests over the limit", () => {
    const limiter = createRateLimiter({ maxRequests: 2, windowMs: 60_000 });
    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-1").allowed).toBe(false);
  });

  it("tracks clients independently", () => {
    const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60_000 });
    expect(limiter.check("client-1").allowed).toBe(true);
    expect(limiter.check("client-2").allowed).toBe(true);
    expect(limiter.check("client-1").allowed).toBe(false);
  });
});
```

- [ ] **Step 3: Run tests and verify they fail**

Run:

```powershell
npm run test:run -- src/server/logging.test.ts src/server/rateLimit.test.ts
```

Expected: FAIL because server utility files do not exist.

- [ ] **Step 4: Implement sanitized logging**

Create `src/server/logging.ts`:

```ts
export type TokenUsage = {
  prompt?: number;
  completion?: number;
  total?: number;
};

export type TechnicalLogEvent = {
  endpoint: string;
  durationMs: number;
  model?: string;
  tokenUsage?: TokenUsage;
  errorType?: string;
};

export function logTechnicalEvent(event: TechnicalLogEvent) {
  console.info(
    "cooksnap.api",
    JSON.stringify({
      timestamp: new Date().toISOString(),
      endpoint: event.endpoint,
      durationMs: event.durationMs,
      model: event.model,
      tokenUsage: event.tokenUsage,
      errorType: event.errorType
    })
  );
}
```

- [ ] **Step 5: Implement in-memory rate limiter**

Create `src/server/rateLimit.ts`:

```ts
type RateLimitOptions = {
  maxRequests: number;
  windowMs: number;
};

type ClientBucket = {
  count: number;
  resetAt: number;
};

export function createRateLimiter(options: RateLimitOptions) {
  const buckets = new Map<string, ClientBucket>();

  return {
    check(clientId: string) {
      const now = Date.now();
      const current = buckets.get(clientId);

      if (!current || current.resetAt <= now) {
        buckets.set(clientId, { count: 1, resetAt: now + options.windowMs });
        return { allowed: true, resetAt: now + options.windowMs };
      }

      if (current.count >= options.maxRequests) {
        return { allowed: false, resetAt: current.resetAt };
      }

      current.count += 1;
      buckets.set(clientId, current);
      return { allowed: true, resetAt: current.resetAt };
    }
  };
}

export const apiRateLimiter = createRateLimiter({
  maxRequests: 30,
  windowMs: 60_000
});
```

- [ ] **Step 6: Verify server utilities**

Run:

```powershell
npm run test:run -- src/server/logging.test.ts src/server/rateLimit.test.ts
npm run lint
```

Expected: both commands exit 0.

- [ ] **Step 7: Commit server utilities**

Run:

```powershell
git add src/server/logging.ts src/server/logging.test.ts src/server/rateLimit.ts src/server/rateLimit.test.ts
git commit -m "feat: add sanitized api utilities"
```

Expected: commit succeeds.

## Task 5: Add LLM Prompts and JSON Client

**Files:**
- Create: `src/server/prompts.ts`
- Create: `src/server/prompts.test.ts`
- Create: `src/server/llmClient.ts`
- Create: `src/server/llmClient.test.ts`

- [ ] **Step 1: Write prompt tests**

Create `src/server/prompts.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { makeIngredient, makePreferences } from "@/test/factories";
import { buildIngredientParseMessages, buildRecipeRecommendationMessages } from "./prompts";

describe("LLM prompts", () => {
  it("asks ingredient parsing to return JSON only", () => {
    const messages = buildIngredientParseMessages("鸡蛋 2 个，番茄 3 个");
    const content = messages.map((message) => message.content).join("\n");
    expect(content).toContain("JSON");
    expect(content).toContain("ingredients");
    expect(content).toContain("鸡蛋 2 个");
  });

  it("includes pantry seasonings as the only guaranteed seasonings", () => {
    const messages = buildRecipeRecommendationMessages([makeIngredient()], makePreferences());
    const content = messages.map((message) => message.content).join("\n");
    expect(content).toContain("Only these pantry seasonings are guaranteed");
    expect(content).toContain("盐");
    expect(content).toContain("at most 1-2 missing non-core ingredients");
  });
});
```

- [ ] **Step 2: Write LLM client tests**

Create `src/server/llmClient.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { createLlmClient, extractJsonObject } from "./llmClient";

describe("LLM JSON client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("extracts JSON from plain content", () => {
    expect(extractJsonObject('{"ok":true}')).toEqual({ ok: true });
  });

  it("extracts JSON from fenced content", () => {
    expect(extractJsonObject('```json\n{"ok":true}\n```')).toEqual({ ok: true });
  });

  it("calls the OpenAI-compatible endpoint without exposing the API key", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "{\"ok\":true}" } }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 }
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = createLlmClient({
      LLM_BASE_URL: "https://api.deepseek.com",
      LLM_MODEL: "deepseek-v4-flash",
      LLM_API_KEY: "secret-key"
    });

    const result = await client.completeJson([{ role: "user", content: "return json" }]);
    expect(result.json).toEqual({ ok: true });
    expect(result.model).toBe("deepseek-v4-flash");
    expect(result.tokenUsage).toEqual({ prompt: 10, completion: 5, total: 15 });
    expect(JSON.stringify(fetchMock.mock.calls)).not.toContain("鸡蛋");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.deepseek.com/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer secret-key"
        })
      })
    );
  });
});
```

- [ ] **Step 3: Run tests and verify they fail**

Run:

```powershell
npm run test:run -- src/server/prompts.test.ts src/server/llmClient.test.ts
```

Expected: FAIL because prompt and client modules do not exist.

- [ ] **Step 4: Implement prompts**

Create `src/server/prompts.ts`:

```ts
import type { IngredientItem, UserPreferences } from "@/lib/types";

export type LlmMessage = {
  role: "system" | "user";
  content: string;
};

export function buildIngredientParseMessages(rawText: string): LlmMessage[] {
  return [
    {
      role: "system",
      content:
        "You parse Chinese cooking ingredient text. Return strict JSON only. The JSON shape is {\"ingredients\":[{\"name\":\"string\",\"amountText\":\"string optional\",\"note\":\"string optional\"}]}."
    },
    {
      role: "user",
      content: `Parse this ingredient input into concise ingredient items:\n${rawText}`
    }
  ];
}

export function buildRecipeRecommendationMessages(
  ingredients: IngredientItem[],
  preferences: UserPreferences
): LlmMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a practical Chinese home-cooking assistant. Return strict JSON only. Do not include markdown. Generate platform search keywords, not platform-derived content."
    },
    {
      role: "user",
      content: [
        "Recommend dishes for the user.",
        "Return JSON with {\"groups\":[{\"group\":\"best_match|fastest|least_missing\",\"title\":\"string\",\"recipes\":[RecipeCard]}]}.",
        "RecipeCard fields: id, name, group, matchReason, usedIngredients, missingNonCoreIngredients, timeMinutes, difficulty, steps, searchKeywords.",
        "Each recipe must have 5-7 short actionable steps.",
        "Only these pantry seasonings are guaranteed: " + preferences.pantrySeasonings.join(", "),
        "Do not assume other common seasonings are available.",
        "Allow at most 1-2 missing non-core ingredients.",
        "Do not strongly recommend dishes missing a core ingredient.",
        "Prefer Chinese home cooking unless cuisine preferences indicate otherwise.",
        "Respect allergies or avoidances: " + preferences.allergiesOrAvoids.join(", "),
        "Respect cookware: " + preferences.cookware.join(", "),
        "Respect serving count: " + preferences.servingCount,
        "Respect cooking skill: " + preferences.cookingSkill,
        "Respect max cooking time minutes: " + preferences.maxCookingTimeMinutes,
        "Cuisine preferences: " + preferences.cuisinePreferences.join(", "),
        "Taste preferences: " + preferences.tastes.join(", "),
        "Ingredients: " + JSON.stringify(ingredients)
      ].join("\n")
    }
  ];
}
```

- [ ] **Step 5: Implement LLM JSON client**

Create `src/server/llmClient.ts`:

```ts
import type { LlmMessage } from "./prompts";
import type { TokenUsage } from "./logging";

export type LlmClientEnv = {
  LLM_BASE_URL?: string;
  LLM_MODEL?: string;
  LLM_API_KEY?: string;
};

export type LlmJsonResult = {
  json: unknown;
  model: string;
  tokenUsage?: TokenUsage;
};

export type LlmClient = {
  completeJson(messages: LlmMessage[]): Promise<LlmJsonResult>;
};

export function extractJsonObject(content: string): unknown {
  const trimmed = content.trim();
  const unfenced = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(unfenced);
}

export function createLlmClient(env: LlmClientEnv = process.env): LlmClient {
  const baseUrl = env.LLM_BASE_URL?.replace(/\/$/, "") || "https://api.deepseek.com";
  const model = env.LLM_MODEL || "deepseek-v4-flash";
  const apiKey = env.LLM_API_KEY;

  return {
    async completeJson(messages) {
      if (!apiKey) {
        throw new Error("LLM_API_KEY is not configured");
      }

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.3,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`LLM request failed with status ${response.status}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content !== "string") {
        throw new Error("LLM response did not include message content");
      }

      return {
        json: extractJsonObject(content),
        model,
        tokenUsage: data?.usage
          ? {
              prompt: data.usage.prompt_tokens,
              completion: data.usage.completion_tokens,
              total: data.usage.total_tokens
            }
          : undefined
      };
    }
  };
}
```

- [ ] **Step 6: Verify LLM modules**

Run:

```powershell
npm run test:run -- src/server/prompts.test.ts src/server/llmClient.test.ts
npm run lint
```

Expected: both commands exit 0.

- [ ] **Step 7: Commit LLM foundation**

Run:

```powershell
git add src/server/prompts.ts src/server/prompts.test.ts src/server/llmClient.ts src/server/llmClient.test.ts
git commit -m "feat: add llm prompt client"
```

Expected: commit succeeds.

## Task 6: Add API Handlers and Routes

**Files:**
- Create: `src/server/apiHandlers.ts`
- Create: `src/server/apiHandlers.test.ts`
- Create: `src/app/api/parse-ingredients/route.ts`
- Create: `src/app/api/recommend-recipes/route.ts`

- [ ] **Step 1: Write API handler tests**

Create `src/server/apiHandlers.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { makeIngredient, makePreferences, makeRecipe } from "@/test/factories";
import { handleParseIngredients, handleRecommendRecipes } from "./apiHandlers";
import type { LlmClient } from "./llmClient";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "test-client" },
    body: JSON.stringify(body)
  });
}

describe("API handlers", () => {
  it("parses ingredients and assigns ids", async () => {
    const llm: LlmClient = {
      completeJson: vi.fn().mockResolvedValue({
        json: { ingredients: [{ name: "鸡蛋", amountText: "2 个" }] },
        model: "deepseek-v4-flash"
      })
    };

    const response = await handleParseIngredients(jsonRequest({ rawText: "鸡蛋 2 个" }), { llm });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ingredients[0]).toMatchObject({ name: "鸡蛋", amountText: "2 个" });
    expect(body.ingredients[0].id).toEqual(expect.any(String));
  });

  it("does not accept empty parse requests", async () => {
    const response = await handleParseIngredients(jsonRequest({ rawText: " " }));
    expect(response.status).toBe(400);
  });

  it("retries malformed recommendation JSON once", async () => {
    const validRecipe = makeRecipe();
    const llm: LlmClient = {
      completeJson: vi
        .fn()
        .mockResolvedValueOnce({ json: { groups: [] }, model: "deepseek-v4-flash" })
        .mockResolvedValueOnce({
          json: { groups: [{ group: "best_match", title: "最匹配", recipes: [validRecipe] }] },
          model: "deepseek-v4-flash"
        })
    };

    const response = await handleRecommendRecipes(
      jsonRequest({ ingredients: [makeIngredient()], preferences: makePreferences() }),
      { llm }
    );

    expect(response.status).toBe(200);
    expect(llm.completeJson).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```powershell
npm run test:run -- src/server/apiHandlers.test.ts
```

Expected: FAIL because `src/server/apiHandlers.ts` does not exist.

- [ ] **Step 3: Implement API handlers**

Create `src/server/apiHandlers.ts`:

```ts
import { randomUUID } from "crypto";
import {
  parseIngredientsRequestSchema,
  parseIngredientsResponseSchema,
  recommendationResponseSchema,
  recommendRecipesRequestSchema
} from "@/lib/schemas";
import { buildIngredientParseMessages, buildRecipeRecommendationMessages } from "./prompts";
import { apiRateLimiter } from "./rateLimit";
import { createLlmClient, type LlmClient } from "./llmClient";
import { logTechnicalEvent } from "./logging";

type HandlerDeps = {
  llm?: LlmClient;
};

function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, { status });
}

function clientIdFromRequest(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

function rateLimit(request: Request) {
  const result = apiRateLimiter.check(clientIdFromRequest(request));
  if (!result.allowed) {
    return jsonResponse({ error: "rate_limited" }, 429);
  }
  return null;
}

export async function handleParseIngredients(request: Request, deps: HandlerDeps = {}) {
  const started = Date.now();
  const limited = rateLimit(request);
  if (limited) {
    return limited;
  }

  try {
    const rawBody = await request.json();
    const parsedRequest = parseIngredientsRequestSchema.safeParse(rawBody);
    if (!parsedRequest.success) {
      return jsonResponse({ error: "invalid_request" }, 400);
    }

    const llm = deps.llm || createLlmClient();
    const result = await llm.completeJson(buildIngredientParseMessages(parsedRequest.data.rawText));
    const withIds =
      typeof result.json === "object" && result.json !== null && "ingredients" in result.json
        ? {
            ingredients: (result.json as { ingredients: unknown[] }).ingredients.map((item) => ({
              id: randomUUID(),
              ...(typeof item === "object" && item !== null ? item : {})
            }))
          }
        : result.json;

    const parsedResponse = parseIngredientsResponseSchema.safeParse(withIds);
    if (!parsedResponse.success) {
      return jsonResponse({ error: "parse_failed" }, 502);
    }

    logTechnicalEvent({
      endpoint: "/api/parse-ingredients",
      durationMs: Date.now() - started,
      model: result.model,
      tokenUsage: result.tokenUsage
    });

    return jsonResponse(parsedResponse.data);
  } catch {
    logTechnicalEvent({
      endpoint: "/api/parse-ingredients",
      durationMs: Date.now() - started,
      errorType: "unexpected_error"
    });
    return jsonResponse({ error: "parse_failed" }, 502);
  }
}

export async function handleRecommendRecipes(request: Request, deps: HandlerDeps = {}) {
  const started = Date.now();
  const limited = rateLimit(request);
  if (limited) {
    return limited;
  }

  try {
    const rawBody = await request.json();
    const parsedRequest = recommendRecipesRequestSchema.safeParse(rawBody);
    if (!parsedRequest.success) {
      return jsonResponse({ error: "invalid_request" }, 400);
    }

    const llm = deps.llm || createLlmClient();
    const messages = buildRecipeRecommendationMessages(parsedRequest.data.ingredients, parsedRequest.data.preferences);

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const result = await llm.completeJson(messages);
      const parsedResponse = recommendationResponseSchema.safeParse(result.json);

      if (parsedResponse.success) {
        logTechnicalEvent({
          endpoint: "/api/recommend-recipes",
          durationMs: Date.now() - started,
          model: result.model,
          tokenUsage: result.tokenUsage
        });
        return jsonResponse(parsedResponse.data);
      }
    }

    logTechnicalEvent({
      endpoint: "/api/recommend-recipes",
      durationMs: Date.now() - started,
      errorType: "schema_error"
    });
    return jsonResponse({ error: "recommendation_failed" }, 502);
  } catch {
    logTechnicalEvent({
      endpoint: "/api/recommend-recipes",
      durationMs: Date.now() - started,
      errorType: "unexpected_error"
    });
    return jsonResponse({ error: "recommendation_failed" }, 502);
  }
}
```

- [ ] **Step 4: Add API routes**

Create `src/app/api/parse-ingredients/route.ts`:

```ts
import { handleParseIngredients } from "@/server/apiHandlers";

export async function POST(request: Request) {
  return handleParseIngredients(request);
}
```

Create `src/app/api/recommend-recipes/route.ts`:

```ts
import { handleRecommendRecipes } from "@/server/apiHandlers";

export async function POST(request: Request) {
  return handleRecommendRecipes(request);
}
```

- [ ] **Step 5: Verify API handlers**

Run:

```powershell
npm run test:run -- src/server/apiHandlers.test.ts
npm run lint
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit API routes**

Run:

```powershell
git add src/server/apiHandlers.ts src/server/apiHandlers.test.ts src/app/api
git commit -m "feat: add llm api routes"
```

Expected: commit succeeds.

## Task 7: Build Local-First UI Flow

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Create: `src/components/KitchenProfileForm.tsx`
- Create: `src/components/IngredientComposer.tsx`
- Create: `src/components/RecipeGroups.tsx`
- Create: `src/components/FavoritesHistory.tsx`
- Create: `src/components/KitchenProfileForm.test.tsx`
- Create: `src/components/IngredientComposer.test.tsx`

- [ ] **Step 1: Write kitchen profile component test**

Create `src/components/KitchenProfileForm.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { KitchenProfileForm } from "./KitchenProfileForm";

describe("KitchenProfileForm", () => {
  it("submits a default beginner-friendly profile", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<KitchenProfileForm onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "保存厨房画像" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        cuisinePreferences: ["中式家常菜"],
        pantrySeasonings: expect.arrayContaining(["盐", "生抽", "食用油"]),
        servingCount: 1,
        cookingSkill: "beginner",
        maxCookingTimeMinutes: 30
      })
    );
  });
});
```

- [ ] **Step 2: Write ingredient composer test**

Create `src/components/IngredientComposer.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { makeIngredient } from "@/test/factories";
import { IngredientComposer } from "./IngredientComposer";

describe("IngredientComposer", () => {
  it("parses raw input and lets the user remove parsed tags", async () => {
    const user = userEvent.setup();
    const onRecommend = vi.fn();
    const parseIngredients = vi.fn().mockResolvedValue([
      makeIngredient({ id: "egg", name: "鸡蛋", amountText: "2 个" }),
      makeIngredient({ id: "tomato", name: "番茄", amountText: "3 个" })
    ]);

    render(<IngredientComposer parseIngredients={parseIngredients} onRecommend={onRecommend} />);

    await user.type(screen.getByLabelText("现有食材"), "鸡蛋 2 个，番茄 3 个");
    await user.click(screen.getByRole("button", { name: "解析食材" }));
    expect(await screen.findByDisplayValue("鸡蛋")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "删除 番茄" }));
    await user.click(screen.getByRole("button", { name: "生成推荐" }));

    expect(onRecommend).toHaveBeenCalledWith(
      "鸡蛋 2 个，番茄 3 个",
      [expect.objectContaining({ id: "egg", name: "鸡蛋" })]
    );
  });
});
```

- [ ] **Step 3: Run tests and verify they fail**

Run:

```powershell
npm run test:run -- src/components/KitchenProfileForm.test.tsx src/components/IngredientComposer.test.tsx
```

Expected: FAIL because UI components do not exist.

- [ ] **Step 4: Implement kitchen profile form**

Create `src/components/KitchenProfileForm.tsx`:

```tsx
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
          {[
            "清淡",
            "中式家常菜",
            "炒锅",
            "盐",
            "生抽",
            "食用油",
            "1 人份",
            "30 分钟"
          ].map((item) => (
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
```

- [ ] **Step 5: Implement ingredient composer**

Create `src/components/IngredientComposer.tsx`:

```tsx
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
```

- [ ] **Step 6: Implement recipe groups component**

Create `src/components/RecipeGroups.tsx`:

```tsx
"use client";

import { ExternalLink, Heart } from "lucide-react";
import type { RecipeCard, RecipeGroup } from "@/lib/types";
import { buildDouyinSearchUrl, buildXiaohongshuSearchUrl } from "@/lib/searchLinks";

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
                  缺：{recipe.missingNonCoreIngredients.map((item) => `${item.name}${item.substitute ? ` 可用 ${item.substitute}` : ""}`).join("；")}
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
```

- [ ] **Step 7: Implement favorites and history component**

Create `src/components/FavoritesHistory.tsx`:

```tsx
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
```

- [ ] **Step 8: Replace page coordinator**

Replace `src/app/page.tsx`:

```tsx
"use client";

import { Settings, Soup, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [groups, setGroups] = useState<RecipeGroup[]>([]);
  const [favorites, setFavorites] = useState<RecipeCard[]>([]);
  const [history, setHistory] = useState<RecommendationHistoryItem[]>([]);
  const [isRecommending, setIsRecommending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPreferences(loadPreferences());
    setFavorites(loadFavorites());
    setHistory(loadHistory());
  }, []);

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
        <button className={activeTab === "settings" ? "active" : ""} type="button" onClick={() => setActiveTab("settings")}>
          <Settings size={18} /> 设置
        </button>
      </nav>
    </main>
  );
}
```

- [ ] **Step 9: Extend CSS for app UI**

Append to `src/app/globals.css`:

```css
.with-nav {
  padding-bottom: 96px;
}

.stack {
  display: grid;
  gap: 16px;
}

.surface {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 18px;
}

.chip-grid,
.button-row,
.meta-line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip,
.meta-line span {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 6px 10px;
  color: var(--muted);
  background: #fffaf3;
  font-size: 14px;
}

.field {
  display: grid;
  gap: 8px;
  color: var(--muted);
  font-weight: 700;
}

textarea,
input {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 12px;
  color: var(--text);
  background: #fff;
}

.primary-button,
.secondary-button,
.link-button,
.icon-button,
.bottom-nav button,
.segmented button {
  min-height: 44px;
  border-radius: 8px;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-decoration: none;
}

.primary-button {
  width: 100%;
  background: var(--accent);
  color: #fff;
  font-weight: 700;
}

.primary-button:disabled,
.secondary-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.secondary-button,
.link-button {
  background: #fff;
  color: var(--accent-strong);
  border-color: var(--line);
  padding: 0 14px;
}

.icon-button {
  width: 44px;
  color: var(--accent-strong);
  background: #fff;
  border-color: var(--line);
  flex: 0 0 auto;
}

.tag-editor {
  display: grid;
  gap: 10px;
}

.tag-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(86px, 0.7fr) 44px;
  gap: 8px;
  align-items: center;
}

.recipe-card,
.compact-card {
  border-top: 1px solid var(--line);
  padding-top: 14px;
}

.recipe-card-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 44px;
  gap: 10px;
}

.recipe-card h3,
.compact-card h3 {
  margin: 0;
}

.recipe-card p,
.compact-card p,
.muted {
  color: var(--muted);
  line-height: 1.55;
}

.missing-line,
.error-text {
  color: var(--danger);
}

.segmented {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
}

.segmented button {
  border: 0;
  background: #fff;
}

.segmented button.active {
  background: var(--accent);
  color: #fff;
}

.bottom-nav {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: min(720px, 100%);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 10px 14px 14px;
  background: rgba(255, 250, 243, 0.96);
  border-top: 1px solid var(--line);
}

.bottom-nav button {
  background: #fff;
  color: var(--muted);
  border-color: var(--line);
  font-size: 13px;
}

.bottom-nav button.active {
  color: var(--accent-strong);
  border-color: var(--accent);
}
```

- [ ] **Step 10: Verify UI units**

Run:

```powershell
npm run test:run -- src/components/KitchenProfileForm.test.tsx src/components/IngredientComposer.test.tsx
npm run lint
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 11: Commit UI flow**

Run:

```powershell
git add src/app/page.tsx src/app/globals.css src/components
git commit -m "feat: add local-first cooking ui"
```

Expected: commit succeeds.

## Task 8: Add End-to-End MVP Flow

**Files:**
- Create: `tests/e2e/mvp-flow.spec.ts`

- [ ] **Step 1: Install Playwright browser runtime**

Run:

```powershell
npx playwright install chromium
```

Expected: command exits 0.

- [ ] **Step 2: Add e2e test**

Create `tests/e2e/mvp-flow.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("returning user parses ingredients and receives recommendations", async ({ page }) => {
  await page.route("**/api/parse-ingredients", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        ingredients: [
          { id: "egg", name: "鸡蛋", amountText: "2 个" },
          { id: "tomato", name: "番茄", amountText: "3 个" }
        ]
      })
    });
  });

  await page.route("**/api/recommend-recipes", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        groups: [
          {
            group: "best_match",
            title: "最匹配",
            recipes: [
              {
                id: "recipe-1",
                name: "番茄炒蛋",
                group: "best_match",
                matchReason: "主要食材都已具备。",
                usedIngredients: ["鸡蛋", "番茄"],
                missingNonCoreIngredients: [],
                timeMinutes: 15,
                difficulty: "easy",
                steps: ["打蛋", "切番茄", "炒鸡蛋", "炒番茄", "合炒调味"],
                searchKeywords: {
                  xiaohongshu: "番茄炒蛋 家常 新手 做法",
                  douyin: "番茄炒蛋 新手 教程"
                }
              }
            ]
          }
        ]
      })
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "保存厨房画像" }).click();
  await page.getByLabel("现有食材").fill("鸡蛋 2 个，番茄 3 个");
  await page.getByRole("button", { name: "解析食材" }).click();
  await expect(page.getByDisplayValue("鸡蛋")).toBeVisible();
  await page.getByRole("button", { name: "生成推荐" }).click();
  await expect(page.getByRole("heading", { name: "番茄炒蛋" })).toBeVisible();
  await page.getByRole("button", { name: "收藏 番茄炒蛋" }).click();
  await page.getByRole("button", { name: "收藏" }).click();
  await expect(page.getByText("主要食材都已具备。")).toBeVisible();
});
```

- [ ] **Step 3: Run e2e verification**

Run:

```powershell
npm run e2e
```

Expected: Playwright test exits 0.

- [ ] **Step 4: Run full verification**

Run:

```powershell
npm run lint
npm run test:run
npm run build
npm run e2e
```

Expected: all commands exit 0.

- [ ] **Step 5: Commit e2e coverage**

Run:

```powershell
git add tests/e2e/mvp-flow.spec.ts playwright.config.ts
git commit -m "test: cover mvp cooking flow"
```

Expected: commit succeeds.

## Task 9: Manual LLM Smoke Test

**Files:**
- Create: `.env.local` locally only; do not commit it.
- Modify only if needed after observed failure: `src/server/prompts.ts`, `src/server/llmClient.ts`, or `src/lib/schemas.ts`.

- [ ] **Step 1: Create local secret file**

Create `.env.local` with the real key outside git:

```text
LLM_BASE_URL=https://api.deepseek.com
LLM_MODEL=deepseek-v4-flash
LLM_API_KEY=<real rotated key>
```

Expected: `.env.local` is ignored by git.

- [ ] **Step 2: Start dev server**

Run:

```powershell
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Expected: Next.js dev server is available at `http://127.0.0.1:3000`.

- [ ] **Step 3: Manually test three fixtures**

Use the browser UI with these inputs:

```text
鸡蛋 2 个，番茄 3 个
土豆 2 个，青椒 1 个，猪肉一小块
豆腐半块，青菜一点，蘑菇一盒
```

Expected for each fixture:

- API returns grouped recommendations.
- Recipes are plausible home-cooking dishes.
- Each recipe has 5-7 short steps.
- Missing non-core ingredients are limited to 1-2.
- Xiaohongshu and Douyin buttons open search pages.
- Failed attempts are not saved to history.

- [ ] **Step 4: Confirm no secret or food data is tracked**

Run:

```powershell
git status --short
Select-String -Path .\src\**\*.*,.env.example,package.json -Pattern "sk-|LLM_API_KEY=.*[A-Za-z0-9]" -CaseSensitive:$false
```

Expected:

- `.env.local` does not appear in `git status --short`.
- No real API key appears in tracked files.
- Search results may show `LLM_API_KEY=` in `.env.example` only.

- [ ] **Step 5: Commit manual-test prompt fixes only when needed**

If prompt or schema changes were required, run:

```powershell
git add src/server/prompts.ts src/server/llmClient.ts src/lib/schemas.ts
git commit -m "fix: stabilize llm recommendation output"
```

Expected: commit succeeds only when files actually changed.

## Final Verification

Run:

```powershell
npm run lint
npm run test:run
npm run build
npm run e2e
git status --short
```

Expected:

- Lint exits 0.
- Vitest exits 0.
- Next build exits 0.
- Playwright exits 0.
- Git status is clean except local ignored files such as `.env.local`.

## Spec Coverage Review

Covered requirements:

- Mobile-first PWA: Task 1, Task 7, Task 8.
- First-run kitchen profile stored locally: Task 3, Task 7, Task 8.
- Natural-language ingredient input with editable tags: Task 6, Task 7, Task 8.
- LLM-backed parsing and recommendation through backend proxy: Task 5, Task 6, Task 9.
- Recipe groups and cards: Task 2, Task 6, Task 7, Task 8.
- Xiaohongshu and Douyin search links without crawling: Task 3, Task 7, Task 8.
- Local history and favorites: Task 3, Task 7, Task 8.
- Anonymous technical logs only: Task 4, Task 6, Task 9.
- Real key outside source control: Task 1, Task 9.

Review result:

- The plan stays within the approved MVP.
- All data contracts are defined before use.
- Backend logging excludes food data by design and test.
- UI implementation is local-first and does not require accounts.
- Final verification includes unit, build, e2e, manual LLM, and secret checks.
