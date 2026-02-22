import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const authRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60s"),
  prefix: "ratelimit:auth",
});

export const writeRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "60s"),
  prefix: "ratelimit:write",
});

export const messageRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "60s"),
  prefix: "ratelimit:message",
});
