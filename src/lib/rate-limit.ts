type RateLimitWindow = {
  limit: number;
  windowMs: number;
};

const buckets = new Map<string, number[]>();

function prune(entries: number[], now: number, windowMs: number) {
  while (entries.length > 0 && now - entries[0] > windowMs) {
    entries.shift();
  }
}

export function rateLimit(key: string, options: RateLimitWindow) {
  const now = Date.now();
  const entries = buckets.get(key) ?? [];

  prune(entries, now, options.windowMs);

  if (entries.length >= options.limit) {
    const resetAt = entries[0] + options.windowMs;
    return {
      limited: true,
      remaining: 0,
      resetInSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
    };
  }

  entries.push(now);
  buckets.set(key, entries);

  return {
    limited: false,
    remaining: Math.max(0, options.limit - entries.length),
    resetInSeconds: Math.ceil(options.windowMs / 1000),
  };
}

export function requestIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

