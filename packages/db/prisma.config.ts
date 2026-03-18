import path from "node:path";
import * as dotenv from "dotenv";

// Carica esplicitamente il .env dalla root del monorepo
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
