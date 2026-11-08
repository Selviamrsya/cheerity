import { Redis } from "@upstash/redis";
import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { headers } from "next/headers";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis =
  redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

let warnedMissingConfig = false;

// Preset limit untuk tiap bucket. window dalam format duration Upstash.
export const rateLimitPresets = {
  // Auth — brute force protection (per IP / per email)
  signIn: { max: 10, window: "1 m" },
  signInEmail: { max: 5, window: "10 m" },
  signUp: { max: 5, window: "10 m" },
  passwordChange: { max: 5, window: "10 m" },

  // Donation
  donationSubmit: { max: 10, window: "1 h" }, // per user/IP
  donationMutation: { max: 60, window: "1 h" }, // status changes oleh institusi
  createDonation: { max: 20, window: "1 h" }, // per institusi/IP

  // Profile & admin
  profileUpdate: { max: 30, window: "1 h" },
  adminMutation: { max: 60, window: "1 h" },

  // Upload & utilitas
  upload: { max: 20, window: "1 h" },
  imagekitAuth: { max: 30, window: "1 m" },

  // Debug / repair — strict
  debug: { max: 10, window: "1 m" },
} as const;

export type RateLimitPreset = keyof typeof rateLimitPresets;

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number | null;
};

const limiterCache = new Map<string, Ratelimit>();

function getLimiter(max: number, window: Duration): Ratelimit {
  const cacheKey = `${max}:${window}`;
  let limiter = limiterCache.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(max, window),
      prefix: "cheerity:rl",
    });
    limiterCache.set(cacheKey, limiter);
  }
  return limiter;
}

async function consume(
  key: string,
  rule: { window: number; max: number }
): Promise<{ allowed: boolean; retryAfter: number | null }> {
  if (!redis) {
    if (!warnedMissingConfig) {
      warnedMissingConfig = true;
      console.warn(
        "[ratelimit] UPSTASH_REDIS_REST_URL/TOKEN not set — rate limiting disabled."
      );
    }
    return { allowed: true, retryAfter: null };
  }

  try {
    const limiter = getLimiter(rule.max, `${rule.window} s` as Duration);
    const result = await limiter.limit(key);
    return {
      allowed: result.success,
      retryAfter: result.success
        ? null
        : Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
    };
  } catch (error) {
    console.error("[ratelimit] Redis error, failing open:", error);
    return { allowed: true, retryAfter: null };
  }
}

// Ambil IP client dari header proxy (Vercel/edge set x-forwarded-for).
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

// Cek rate limit untuk sebuah bucket + identifier (default: IP client).
export async function rateLimit(
  preset: RateLimitPreset,
  identifier?: string
): Promise<RateLimitResult> {
  const id = identifier ?? (await getClientIp());
  const { max, window } = rateLimitPresets[preset];
  const { allowed, retryAfter } = await consume(`${preset}:${id}`, {
    window: parseWindowSeconds(window),
    max,
  });
  return { allowed, retryAfterSeconds: retryAfter };
}

// Cek rate limit langsung dengan key bebas — untuk identifier non-IP
// (misal userId/email). window tetap detik.
export async function rateLimitKey(
  bucket: string,
  identifier: string,
  rule: { max: number; windowSeconds: number }
): Promise<RateLimitResult> {
  const { allowed, retryAfter } = await consume(`${bucket}:${identifier}`, {
    window: rule.windowSeconds,
    max: rule.max,
  });
  return { allowed, retryAfterSeconds: retryAfter };
}

// Adapter untuk better-auth `rateLimit.customStorage`.
// better-auth memanggil consume() per request ke endpoint /api/auth/*.
export async function consumeAuthRateLimit(
  key: string,
  rule: { window: number; max: number }
): Promise<{ allowed: boolean; retryAfter: number | null }> {
  const result = await consume(`auth:${key}`, rule);
  return { allowed: result.allowed, retryAfter: result.retryAfter };
}

// Ubah Duration preset ("1 m", "10 m", "1 h") ke detik untuk consume().
function parseWindowSeconds(window: Duration): number {
  const match = /^(\d+)\s*(ms|s|m|h|d|w)$/.exec(window);
  if (!match) return 60;
  const value = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    ms: 0.001,
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
    w: 604800,
  };
  return Math.max(1, Math.round(value * multipliers[unit]));
}

export const RATE_LIMIT_ERROR =
  "Too many requests. Please try again later.";
