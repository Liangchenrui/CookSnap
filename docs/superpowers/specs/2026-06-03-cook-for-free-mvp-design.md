# CookForFree MVP Design

Date: 2026-06-03

## Goal

CookForFree is a mobile-first cooking assistant. The MVP helps a user enter ingredients they already have, then uses an LLM to recommend dishes they can cook today. Each recommendation includes a short cooking outline and search entry points for Xiaohongshu and Douyin tutorials.

The first version optimizes for two outcomes:

- Recommendation quality: dishes should be cookable with the user's ingredients, long-term preferences, cookware, seasonings, skill level, and time limit.
- Speed: returning users should open the app, enter ingredients once, confirm parsed tags, and see useful recommendations quickly.

Tutorial discovery is supporting functionality. The MVP generates platform search keywords and links out to platform search pages. It does not crawl, copy, summarize, or rehost third-party platform content.

## MVP Scope

### In Scope

- Mobile-first Web/PWA experience.
- First-run kitchen profile stored locally in the browser.
- Manual ingredient input through natural language.
- Editable parsed ingredient tags.
- LLM-backed recipe recommendations through a lightweight backend proxy.
- Recipe groups:
  - Best match.
  - Fastest.
  - Least missing ingredients.
- Recipe cards with:
  - Dish name.
  - Match reason.
  - Used ingredients.
  - Missing non-core ingredients.
  - Substitute or omit guidance.
  - Estimated cooking time.
  - Difficulty.
  - 5-7 step short cooking outline.
  - Xiaohongshu and Douyin search keywords.
  - Favorite action.
- Local recommendation history.
- Local favorites.
- Anonymous technical backend logs only.

### Out of Scope

- User accounts.
- Cross-device sync.
- Photo ingredient recognition.
- Full fridge inventory management.
- Nutrition, calorie, fitness, or diet-plan features.
- Crawling Xiaohongshu, Douyin, or other platforms.
- Displaying third-party tutorial cards in the app.
- Extracting, rewriting, or reformatting third-party tutorial content.
- Saving ingredient inputs, preferences, or recommendation results on the backend.

## User Flow

1. First launch: the user completes a kitchen profile.
2. Daily use: the home page focuses on the ingredient input field.
3. The user enters text such as "鸡蛋 2 个，番茄 3 个，还有一点青菜".
4. The app parses the input into editable ingredient tags.
5. The user confirms or edits the tags.
6. The frontend sends ingredient tags and locally stored preferences to the backend recommendation API.
7. The backend calls the LLM and returns structured recipe recommendations.
8. The frontend renders grouped recipe cards.
9. The user can favorite a dish or open Xiaohongshu/Douyin searches.
10. Successful recommendations are saved to local history.

## Information Architecture

The MVP uses four main views.

### First-Run Setup and Settings

Shown automatically on first launch and available later from Settings.

Fields:

- Taste preferences.
- Allergies, avoidances, and dietary restrictions.
- Cuisine preferences, defaulting toward Chinese home cooking.
- Common cookware.
- Pantry seasonings.
- Serving count.
- Cooking skill:
  - `beginner`
  - `normal`
  - `skilled`
- Default acceptable cooking time:
  - `15`
  - `30`
  - `45`
  - `60`

The UI should use quick-select chips and small custom inputs instead of a long form.

### Home

The home view is the main daily entry point.

It contains:

- Natural-language ingredient input.
- Parse action.
- Editable ingredient tags with name and optional amount text.
- Generate recommendation action.
- Small entry points for favorites and settings.

For returning users, the input should be immediately available without repeating setup.

### Recommendations

The recommendations view shows:

- Current ingredient summary.
- Entry points to edit ingredients or preferences.
- Three recommendation groups:
  - Best match.
  - Fastest.
  - Least missing ingredients.
- Recipe cards with short cooking outlines and tutorial search buttons.

### Favorites and History

Favorites and history can share one view with tabs.

Favorites:

- Locally saved recipe cards.
- Open saved recipe card.
- Remove favorite.

History:

- Recent successful recommendation batches.
- Original raw input.
- Parsed ingredients.
- Returned recipes.

## Technical Architecture

### Frontend

The frontend is a mobile-first PWA.

Responsibilities:

- Render all views.
- Store and read local user data.
- Parse API responses into UI state.
- Save successful recommendation history locally.
- Save favorites locally.
- Build platform search URLs from backend-provided keywords.

Local storage is sufficient for MVP data volume. `localStorage` is acceptable for the first implementation. If history grows or structured querying becomes necessary, migrate to `IndexedDB`.

### Backend

The backend is a thin API layer.

Responsibilities:

- Hold the LLM API key in server-side environment variables.
- Compose prompts.
- Call the OpenAI-compatible LLM endpoint.
- Validate request payloads.
- Validate LLM JSON responses.
- Retry once when the LLM response is malformed.
- Apply basic rate limiting.
- Record anonymous technical logs.

The backend must not persist ingredient inputs, user preferences, recommendation results, raw prompts, or raw model responses.

### LLM Provider

Use an OpenAI-compatible client with these environment variables:

```text
LLM_BASE_URL=https://api.deepseek.com
LLM_MODEL=deepseek-v4-flash
LLM_API_KEY=<set outside source control>
```

The API key must be provided through `.env.local`, deployment environment variables, or another local secret mechanism. It must not be committed to the repository or written into documentation.

Because a real key was shared during brainstorming, it should be rotated before production or public deployment.

## API Contract

### `POST /api/parse-ingredients`

Request:

```json
{
  "rawText": "鸡蛋 2 个，番茄 3 个，还有一点青菜"
}
```

Response:

```json
{
  "ingredients": [
    {
      "id": "generated-id-1",
      "name": "鸡蛋",
      "amountText": "2 个"
    },
    {
      "id": "generated-id-2",
      "name": "番茄",
      "amountText": "3 个"
    },
    {
      "id": "generated-id-3",
      "name": "青菜",
      "amountText": "一点"
    }
  ]
}
```

Notes:

- `amountText` is optional.
- The frontend must allow users to edit or delete parsed tags before recommendation.
- The backend must not log `rawText`.

### `POST /api/recommend-recipes`

Request:

```json
{
  "ingredients": [
    {
      "id": "generated-id-1",
      "name": "鸡蛋",
      "amountText": "2 个"
    },
    {
      "id": "generated-id-2",
      "name": "番茄",
      "amountText": "3 个"
    }
  ],
  "preferences": {
    "tastes": ["清淡"],
    "allergiesOrAvoids": [],
    "cuisinePreferences": ["中式家常菜"],
    "cookware": ["炒锅"],
    "pantrySeasonings": ["盐", "生抽", "食用油"],
    "servingCount": 1,
    "cookingSkill": "beginner",
    "maxCookingTimeMinutes": 30
  }
}
```

Response:

```json
{
  "groups": [
    {
      "group": "best_match",
      "title": "最匹配",
      "recipes": [
        {
          "id": "recipe-id-1",
          "name": "番茄炒蛋",
          "group": "best_match",
          "matchReason": "主要食材都已具备，做法简单，适合新手。",
          "usedIngredients": ["鸡蛋", "番茄"],
          "missingNonCoreIngredients": [],
          "timeMinutes": 15,
          "difficulty": "easy",
          "steps": [
            "鸡蛋打散，番茄切块。",
            "热锅放油，先炒鸡蛋至凝固后盛出。",
            "锅中补少量油，放入番茄炒软出汁。",
            "倒回鸡蛋翻炒均匀。",
            "按口味加盐或生抽调味后出锅。"
          ],
          "searchKeywords": {
            "xiaohongshu": "番茄炒蛋 家常 新手 做法",
            "douyin": "番茄炒蛋 新手 教程"
          }
        }
      ]
    }
  ]
}
```

Allowed `group` values:

- `best_match`
- `fastest`
- `least_missing`

Allowed `difficulty` values:

- `easy`
- `medium`
- `hard`

Recommendation rules:

- Common seasonings are not assumed globally. Only the user's configured pantry seasonings count as available.
- A recommended dish may miss 1-2 non-core ingredients.
- Missing core ingredients must not appear in strong recommendations.
- Each missing non-core ingredient must include whether it is optional and, when useful, a substitute.
- Each recipe must include 5-7 short cooking steps.
- Each recipe must include Xiaohongshu and Douyin search keywords.

## Local Data Models

### `UserPreferences`

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

### `IngredientItem`

```ts
type IngredientItem = {
  id: string;
  name: string;
  amountText?: string;
  note?: string;
};
```

### `RecipeCard`

```ts
type RecipeCard = {
  id: string;
  name: string;
  group: "best_match" | "fastest" | "least_missing";
  matchReason: string;
  usedIngredients: string[];
  missingNonCoreIngredients: {
    name: string;
    optional: boolean;
    substitute?: string;
  }[];
  timeMinutes: number;
  difficulty: "easy" | "medium" | "hard";
  steps: string[];
  searchKeywords: {
    xiaohongshu: string;
    douyin: string;
  };
};
```

### `RecommendationHistoryItem`

```ts
type RecommendationHistoryItem = {
  id: string;
  createdAt: string;
  rawInput: string;
  ingredients: IngredientItem[];
  recipes: RecipeCard[];
};
```

## Prompting Requirements

The backend prompts should:

- Ask for strict JSON only.
- Include the user's ingredients and preferences.
- Treat the user's pantry seasonings as the only guaranteed seasonings.
- Prefer Chinese home cooking unless the user's cuisine preferences say otherwise.
- Respect allergies, avoidances, cookware, serving count, skill level, and time limit.
- Prefer dishes that use available ingredients well.
- Allow at most 1-2 missing non-core ingredients.
- Clearly mark missing ingredients as optional or substitutable.
- Avoid recommending dishes that require unavailable core ingredients.
- Generate platform search keywords, not platform-derived content.

## Error Handling

Ingredient parsing:

- If parsing finds no valid ingredient, the frontend asks the user to rephrase.
- If some items are uncertain, the frontend still shows editable tags.

Recommendation:

- If the LLM returns malformed JSON, the backend retries once.
- If the retry fails, return a typed error that the frontend can display.
- If the model times out or is rate-limited, show a retryable error.
- Failed recommendation attempts are not saved to local history.

Local storage:

- If local storage is unavailable, the app can still complete one recommendation session.
- The frontend should clearly indicate that preferences, history, or favorites may not persist.

## Privacy and Logging

Frontend local storage may contain:

- User preferences.
- Raw ingredient inputs.
- Parsed ingredients.
- Recommendation history.
- Favorites.

Backend logs may contain only anonymous technical fields:

- Timestamp.
- Endpoint name.
- Duration.
- Model name.
- Token usage.
- Error type.

Backend logs must not contain:

- Raw ingredient text.
- Parsed ingredients.
- User preferences.
- Recipe recommendations.
- Full prompts.
- Raw model responses.
- API keys.

## Verification Criteria

### Product Checks

- A new user can complete first-run setup in under 1 minute.
- A returning user can open the app, input ingredients, confirm tags, and request recommendations without repeating setup.
- A successful recommendation returns at least 6 recipes across the three groups.
- Every recipe has 5-7 short cooking steps.
- Every recipe has Xiaohongshu and Douyin search keywords.
- Recipes may miss at most 1-2 non-core ingredients.
- Missing core ingredients are not used for strong recommendations.
- Refreshing the page preserves preferences, history, and favorites locally.

### Engineering Checks

- Unit or component checks for preference persistence.
- Unit or component checks for ingredient tag editing.
- Unit or component checks for favorite and history persistence.
- Backend request validation tests for both APIs.
- Backend response schema validation tests for LLM output.
- Backend malformed JSON retry test.
- Backend log sanitization test proving user food data is not logged.
- End-to-end manual flow from ingredient input to recipe cards.

### Manual Recommendation Quality Fixtures

Use these inputs during MVP acceptance:

- `鸡蛋 2 个，番茄 3 个`
- `土豆 2 个，青椒 1 个，猪肉一小块`
- `豆腐半块，青菜一点，蘑菇一盒`

For each fixture, verify:

- The recommendations are plausible home-cooking dishes.
- The dishes fit the configured cookware and time limit.
- Missing ingredients are non-core and limited.
- The short steps are actionable for the configured cooking skill.
- Search keywords are concise and useful for Xiaohongshu/Douyin.

## Risks and Tradeoffs

- LLM recommendations may be plausible but wrong. The MVP mitigates this with prompt constraints, JSON schema validation, and manual quality fixtures.
- Local-only storage means data is lost when the user clears browser data or switches devices.
- Search links depend on external platform URL behavior and may change.
- Tutorial search does not guarantee a specific high-quality tutorial result.
- Backend privacy depends on disciplined logging. Tests should verify that user food data is excluded from logs.
- The LLM API key must remain outside source control and should be rotated before production use because a key was shared during design discussion.
