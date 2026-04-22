// ─── nextStatus ───────────────────────────────────────────
export function nextStatus(
  current: "TODO" | "IN_PROGRESS" | "DONE"
): "TODO" | "IN_PROGRESS" | "DONE" {
  if (current === "TODO")        return "IN_PROGRESS";
  if (current === "IN_PROGRESS") return "DONE";
  return "TODO";
}

// ─── completionRate ───────────────────────────────────────
export function completionRate(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// ─── isOverdue ────────────────────────────────────────────
export function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date();
}