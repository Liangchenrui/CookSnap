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
