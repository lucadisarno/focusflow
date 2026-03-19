import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// TTL in secondi
export const CACHE_TTL = {
  SEARCH: 60,        // risultati ricerca: 60 secondi
} as const;

// ─── Helper: genera chiave cache per search ───────────────
export function searchCacheKey(userId: string, query: string, limit: string): string {
  return `search:${userId}:${query.toLowerCase().trim()}:${limit}`;
}