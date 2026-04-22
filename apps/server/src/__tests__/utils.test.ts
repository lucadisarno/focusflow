import { describe, test, expect } from "vitest";
import { nextStatus, completionRate, isOverdue } from "../utils.js";

// ─── describe: raggruppa test correlati ───────────────────
describe("nextStatus", () => {

  test("TODO → IN_PROGRESS", () => {
    expect(nextStatus("TODO")).toBe("IN_PROGRESS");
  });

  test("IN_PROGRESS → DONE", () => {
    expect(nextStatus("IN_PROGRESS")).toBe("DONE");
  });

  test("DONE → torna a TODO", () => {
    expect(nextStatus("DONE")).toBe("TODO");
  });

});

describe("completionRate", () => {

  test("3 task completati su 10 = 30%", () => {
    expect(completionRate(3, 10)).toBe(30);
  });

  test("0 task su 0 = 0% (no divisione per zero)", () => {
    expect(completionRate(0, 0)).toBe(0);
  });

  test("10 task completati su 10 = 100%", () => {
    expect(completionRate(10, 10)).toBe(100);
  });

});

describe("isOverdue", () => {

  test("data nel passato = overdue", () => {
    expect(isOverdue("2020-01-01")).toBe(true);
  });

  test("data nel futuro = non overdue", () => {
    expect(isOverdue("2099-12-31")).toBe(false);
  });

});