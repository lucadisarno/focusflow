import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";
import path from "path";

// Carica il .env dalla root del monorepo
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
    directUrl: process.env["DIRECT_URL"]!,
  },
});
