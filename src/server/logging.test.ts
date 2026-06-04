import { describe, expect, it, vi } from "vitest";
import { logTechnicalEvent } from "./logging";

describe("technical logging", () => {
  it("logs only approved technical fields", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const schemaIssueWithRawInput = {
      path: "groups.0.recipes.0.difficulty",
      code: "invalid_value",
      message: "Invalid option: expected one of \"easy\"|\"medium\"|\"hard\"",
      input: "简单"
    };

    logTechnicalEvent({
      endpoint: "/api/recommend-recipes",
      durationMs: 1200,
      model: "deepseek-v4-flash",
      tokenUsage: { prompt: 100, completion: 200, total: 300 },
      errorType: "schema_error",
      schemaIssues: [schemaIssueWithRawInput]
    });

    const logged = JSON.parse(String(spy.mock.calls[0]?.[1]));
    expect(logged).toMatchObject({
      endpoint: "/api/recommend-recipes",
      durationMs: 1200,
      model: "deepseek-v4-flash",
      tokenUsage: { prompt: 100, completion: 200, total: 300 },
      errorType: "schema_error",
      schemaIssues: [
        {
          path: "groups.0.recipes.0.difficulty",
          code: "invalid_value",
          message: "Invalid option: expected one of \"easy\"|\"medium\"|\"hard\""
        }
      ]
    });
    expect(JSON.stringify(logged)).not.toContain("鸡蛋");
    expect(JSON.stringify(logged)).not.toContain("简单");

    spy.mockRestore();
  });
});
