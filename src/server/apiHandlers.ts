import {
  parseIngredientsRequestSchema,
  parseIngredientsResponseSchema,
  recommendationResponseSchema,
  recommendRecipesRequestSchema
} from "@/lib/schemas";
import { buildIngredientParseMessages, buildRecipeRecommendationMessages } from "./prompts";
import { apiRateLimiter } from "./rateLimit";
import { createLlmClient, type LlmClient } from "./llmClient";
import { logTechnicalEvent, type TechnicalSchemaIssue } from "./logging";
import { normalizeRecommendationJson } from "./recommendationNormalizer";

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

function createId() {
  return crypto.randomUUID();
}

function formatSchemaPath(path: PropertyKey[]) {
  return path.map(String).join(".");
}

function toTechnicalSchemaIssues(issues: { path: PropertyKey[]; code: string; message: string }[]): TechnicalSchemaIssue[] {
  return issues.map((issue) => ({
    path: formatSchemaPath(issue.path),
    code: issue.code,
    message: issue.message
  }));
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
    const jsonWithIds =
      typeof result.json === "object" && result.json !== null && "ingredients" in result.json
        ? {
            ingredients: (result.json as { ingredients: unknown[] }).ingredients.map((item) => ({
              id: createId(),
              ...(typeof item === "object" && item !== null ? item : {})
            }))
          }
        : result.json;

    const parsedResponse = parseIngredientsResponseSchema.safeParse(jsonWithIds);
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
    let schemaIssues: TechnicalSchemaIssue[] | undefined;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const result = await llm.completeJson(messages);
      const parsedResponse = recommendationResponseSchema.safeParse(normalizeRecommendationJson(result.json));

      if (parsedResponse.success) {
        logTechnicalEvent({
          endpoint: "/api/recommend-recipes",
          durationMs: Date.now() - started,
          model: result.model,
          tokenUsage: result.tokenUsage
        });
        return jsonResponse(parsedResponse.data);
      }

      schemaIssues = toTechnicalSchemaIssues(parsedResponse.error.issues);
    }

    logTechnicalEvent({
      endpoint: "/api/recommend-recipes",
      durationMs: Date.now() - started,
      errorType: "schema_error",
      schemaIssues
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
