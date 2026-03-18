import Fastify from "fastify";
import cors from "@fastify/cors";
import { authPlugin } from "./plugins/auth.plugin.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(cors, {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      process.env.FRONTEND_URL ?? "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  });

  app.register(authPlugin);

  return app;
}