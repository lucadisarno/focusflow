import Fastify from "fastify";
import cors from "@fastify/cors";
import { authPlugin } from "./plugins/auth.plugin.js";
import { taskRoutes } from "./routes/tasks.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { categoriesRoutes } from "./routes/categories.js";
import { tagsRoutes } from "./routes/tags.js";
import { searchRoutes } from "./routes/search.js";

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
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  });

  app.register(authPlugin);

  // Routes
  app.register(taskRoutes, { prefix: "/api/tasks" });
  app.register(dashboardRoutes, { prefix: "/api/dashboard" });
  app.register(categoriesRoutes, { prefix: "/api/categories" });
  app.register(tagsRoutes, { prefix: "/api/tags" });
  app.register(searchRoutes, { prefix: "/api/search" });

  return app;
}