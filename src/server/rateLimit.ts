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
        const resetAt = now + options.windowMs;
        buckets.set(clientId, { count: 1, resetAt });
        return { allowed: true, resetAt };
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
