# Repository Instructions

@C:\Users\hp\.codex\RTK.md

## Project Overview

CookSnap is a mobile-first Next.js App Router PWA for recommending home-cooking recipes from ingredients the user already has. The browser owns kitchen preferences, recommendation history, and favorites through `localStorage`; API routes act as a thin LLM proxy with validation, retry, rate limiting, and sanitized technical logging.

## Directory Structure

- `src/app/`: Next.js app shell, global styles, and API route entry points.
- `src/components/`: Client UI components for kitchen profile, ingredient editing, recipe groups, and saved items.
- `src/lib/`: Shared domain types, Zod schemas, storage helpers, and external search URL builders.
- `src/server/`: Server-only prompt, LLM, API handler, rate limit, normalization, and logging code.
- `src/test/`: Vitest fixtures and shared test helpers.
- `tests/e2e/`: Playwright end-to-end MVP flow tests.
- `docs/superpowers/specs/`: Product scope and architecture source of truth.
- `docs/superpowers/plans/`: Implementation plans; update only when the plan itself changes.
- `public/`: Static PWA assets.
- `.worktrees/`, `.next/`, `node_modules/`, `test-results/`, `playwright-report/`: Generated or local-only outputs. Do not edit or review as source.

## Agent Behavior

- State assumptions before implementation when requirements are ambiguous.
- Ask a focused question when missing information affects scope, data persistence, destructive behavior, secrets, or user-facing behavior.
- Implement the smallest change that satisfies the current request.
- Touch only files and lines that directly trace to the task. Do not refactor adjacent code or reformat unrelated files.
- Match existing TypeScript, React, Zod, and CSS patterns before adding new abstractions.
- Prefer shared schemas in `src/lib/schemas.ts` for request/response validation instead of duplicating contract logic.
- Before claiming completion, run the smallest relevant verification command and report what passed or could not be run.

## Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Unit/component tests: `npm run test:run`
- Targeted Vitest: `npm run test:run -- <path-or-pattern>`
- Lint: `npm run lint`
- Production build: `npm run build`
- End-to-end tests: `npm run e2e`

## Product Boundaries

- Stay within the MVP in `docs/superpowers/specs/2026-06-03-cooksnap-mvp-design.md` unless the user explicitly expands scope.
- Do not add accounts, cross-device sync, photo recognition, nutrition planning, full inventory management, or platform crawling unless requested.
- Xiaohongshu and Douyin support is search-link generation only. Do not crawl, copy, summarize, cache, or rehost third-party platform content.
- Recipe recommendations may include at most 1-2 missing non-core ingredients. Missing core ingredients must not appear in strong recommendations.
- Each recipe response should preserve the schema constraints: grouped recipes, 5-7 short steps, difficulty, cooking time, used ingredients, missing non-core ingredients, and platform search keywords.

## Privacy and Secrets

- Keep real LLM credentials out of git. Use `.env.local` or deployment secrets; `.env.example` may list variable names only.
- Required LLM environment variables are `LLM_BASE_URL`, `LLM_MODEL`, and `LLM_API_KEY`.
- Backend code must not persist raw ingredient text, parsed ingredients, user preferences, recommendations, full prompts, raw model responses, or API keys.
- Backend logs may contain only anonymous technical fields such as endpoint, duration, model, token usage, error type, and schema issue metadata.
- If touching logging or API handlers, verify tests still prove user food data and secrets are excluded from logs.

## Testing Guidance

- Bug fix: reproduce with a focused unit/component/API/e2e test when practical, implement the fix, then rerun that test.
- Schema or API contract change: update `src/lib/schemas.ts`, shared types, handler tests, and any affected fixtures together.
- UI behavior change: add or update focused Testing Library coverage; use Playwright when the full user flow or routing matters.
- Storage change: cover unavailable/malformed local storage and legacy key behavior when affected.
- LLM/prompt change: keep the backend injectable for tests; validate malformed JSON retry and schema normalization paths.
- Final check for broad changes: run `npm run lint`, `npm run test:run`, `npm run build`, and `npm run e2e` when feasible.

## Git and Handoff

- The worktree may already contain user changes. Do not revert or overwrite unrelated changes.
- Do not commit generated folders, local secrets, Playwright reports, test results, or `.next` output.
- When a task changes behavior, summarize changed files, verification performed, and any remaining risks or commands not run.
