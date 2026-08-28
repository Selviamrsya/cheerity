import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(10, "10s"),
  ephemeralCache: new Map(),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export default ratelimit;