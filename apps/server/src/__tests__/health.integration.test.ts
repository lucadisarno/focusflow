import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../app.js";

describe("integration — health endpoint", () => {
  let app: ReturnType<typeof buildApp>;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /health risponde 200", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/health",
    });
    expect(res.statusCode).toBe(200);
  });

  it("GET /api/tasks senza sessione risponde 401", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/tasks",
    });
    expect(res.statusCode).toBe(401);
  });

  it("POST /api/tasks senza sessione risponde 401", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/tasks",
      payload: { title: "test" },
    });
    expect(res.statusCode).toBe(401);
  });
});