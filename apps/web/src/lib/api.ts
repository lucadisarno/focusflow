const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const hasBody = options?.body !== undefined;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(hasBody && { "Content-Type": "application/json" }),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Errore sconosciuto" }));
    throw new Error(error.error ?? "Errore nella richiesta");
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}

// ─── Types ────────────────────────────────────────────────
export interface TaskTag {
  tagId: string;
  tag: {
    id: string;
    name: string;
    color: string;
  };
}

export interface TaskCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string | null;
  categoryId?: string | null;
  category?: TaskCategory | null;
  taskTags: TaskTag[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  stats: {
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  };
  recentTasks: Pick<Task, "id" | "title" | "completed" | "createdAt">[];
}

// ─── Task API ─────────────────────────────────────────────
export const taskApi = {
  getAll: (params?: { categoryId?: string; tagId?: string }) => {
    const query = new URLSearchParams();
    if (params?.categoryId) query.set("categoryId", params.categoryId);
    if (params?.tagId) query.set("tagId", params.tagId);
    const qs = query.toString();
    return apiFetch<Task[]>(`/api/tasks${qs ? `?${qs}` : ""}`);
  },

  create: (data: {
    title: string;
    description?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    dueDate?: string;
    categoryId?: string;
    tagIds?: string[];
  }) =>
    apiFetch<Task>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: {
    title?: string;
    description?: string;
    completed?: boolean;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    dueDate?: string;
    categoryId?: string | null;
    tagIds?: string[];
  }) =>
    apiFetch<Task>(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/api/tasks/${id}`, {
      method: "DELETE",
    }),
};

// ─── Dashboard API ────────────────────────────────────────
export const dashboardApi = {
  getStats: () =>
    apiFetch<DashboardStats>("/api/dashboard"),
};