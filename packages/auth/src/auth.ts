import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Redis } from "@upstash/redis";

export function createAuth(prisma: { [key: string]: any }, redis: Redis) {
  return betterAuth({
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",

    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },

    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },

    secondaryStorage: {
      get: async (key) => {
        const val = await redis.get<string>(key);
        return val ?? null;
      },
      set: async (key, value, ttl) => {
        if (ttl) {
          await redis.set(key, value, { ex: ttl });
        } else {
          await redis.set(key, value);
        }
      },
      delete: async (key) => {
        await redis.del(key);
      },
    },

    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,
      },
    },

    trustedOrigins: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      process.env.FRONTEND_URL ?? "http://localhost:5173",
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;