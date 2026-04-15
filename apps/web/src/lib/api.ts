const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

// ─── 1. ApiResponse<T> ────────────────────────────────────
// Generic wrapper per qualsiasi risposta API
// Prima avevi i tipi "nudi" — ora ogni risposta è esplicita
export type ApiResponse<T> = {
  data: T;
  error?: string;
};

// ─── 2. Tipi base ─────────────────────────────────────────
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
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string | null;
  categoryId?: string | null;
  category?: TaskCategory | null;
  taskTags: TaskTag[];
  createdAt: string;
  updatedAt: string;
}

// ─── 3. CreateTaskInput con Pick ──────────────────────────
// Pick<Task, ...> prende SOLO i campi che servono per creare
// status è opzionale perché il backend lo imposta a TODO di default
export type CreateTaskInput = Pick<Task, "title" | "priority"> & {
  status?: Task["status"];
  description?: string;
  dueDate?: string;
  categoryId?: string;
  tagIds?: string[];
};

// ─── 4. UpdateTaskInput con Partial ───────────────────────
// Partial<T> rende TUTTI i campi opzionali
// Perché: quando aggiorni, mandi solo i campi che cambiano
export type UpdateTaskInput = Partial<Omit<CreateTaskInput, "tagIds">> & {
  tagIds?: string[];
  dueDate?: string | null;
  categoryId?: string | null;
};

// ─── 5. Tipi Calendar & Dashboard ────────────────────────
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: {
    status: Task["status"];      // ← usa il tipo di Task invece di ripeterlo
    priority: Task["priority"];  // ← idem
    categoryId?: string | null;
    categoryColor: string;
    categoryName?: string | null;
    tags: string[];
  };
}

export interface CategoryStat {
  id: string;
  name: string;
  color: string;
  icon: string;
  total: number;
  completed: number;
  completionRate: number;
}

export interface DashboardStats {
  stats: {
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  };
  // Pick: prende solo i campi che la dashboard mostra
  recentTasks: Pick<Task, "id" | "title" | "status" | "createdAt">[];
  categoryStats: CategoryStat[];
}

// ─── 6. apiFetch<T> generica ─────────────────────────────
// <T> è il "segnaposto" del tipo di ritorno
// Chiamandola con apiFetch<Task[]> dici "T = Task[]"
// Prima: return res.json() → tipo "any" implicito
// Ora:   return res.json() → tipo T esplicito e sicuro
export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
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
    // Record<string, unknown> invece di any ←────────────────
    // Record<string, unknown> = oggetto con chiavi string e valori sconosciuti
    // È più sicuro di "any" perché TypeScript sa che è un oggetto
    const error = await res.json().catch(
      (): Record<string, unknown> => ({ error: "Errore sconosciuto" })
    );
    throw new Error((error["error"] as string) ?? "Errore nella richiesta");
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}

// ─── 7. Task API ──────────────────────────────────────────
// Ora usa CreateTaskInput e UpdateTaskInput invece di oggetti inline
export const taskApi = {
  getAll: (params?: Pick<UpdateTaskInput, "categoryId"  > & { tagId?: string }) => {
    const query = new URLSearchParams();
    if (params?.categoryId) query.set("categoryId", params.categoryId);
    if (params?.tagId)      query.set("tagId",      params.tagId);
    const qs = query.toString();
    return apiFetch<Task[]>(`/api/tasks${qs ? `?${qs}` : ""}`);
  },

  // ✅ Usa CreateTaskInput invece dell'oggetto inline precedente
  create: (data: CreateTaskInput) =>
    apiFetch<Task>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // ✅ Usa UpdateTaskInput invece dell'oggetto inline precedente
  update: (id: string, data: UpdateTaskInput) =>
    apiFetch<Task>(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/api/tasks/${id}`, {
      method: "DELETE",
    }),

  getCalendarEvents: (start: Date, end: Date) => {
    const query = new URLSearchParams({
      start: start.toISOString(),
      end:   end.toISOString(),
    });
    return apiFetch<CalendarEvent[]>(`/api/tasks/calendar?${query}`);
  },
};

// ─── 8. Dashboard API ─────────────────────────────────────
export const dashboardApi = {
  getStats: () => apiFetch<DashboardStats>("/api/dashboard"),
};
