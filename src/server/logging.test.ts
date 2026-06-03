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
