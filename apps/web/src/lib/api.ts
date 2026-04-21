const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

// ─── 1. ApiResponse<T> ────────────────────────────────────
// Generic wrapper per qualsiasi risposta API
// Prima avevi i tipi "nudi" — ora ogni risposta è esplicita
export type ApiResponse<T> = {
  data: T;
  error?: string;
};

// ─── TYPE GUARD 1: ApiError ───────────────────────────────
// Tipo strutturato per gli errori API invece di Record<string, unknown>
// Vantaggi: accedi a .error e .statusCode con piena type-safety
export interface ApiError {
  error: string;
  statusCode: number;
}

// isApiError: type guard per ApiError
// "obj is ApiError" = type predicate →
// se ritorna true, TypeScript sa che obj è ApiError
// Usiamo "unknown" invece di "any" perché forziamo la verifica
export function isApiError(obj: unknown): obj is ApiError {
  return (
    typeof obj === "object" &&          // è un oggetto?
    obj !== null &&                     // non è null?
    "error" in obj &&                   // ha la prop "error"?
    "statusCode" in obj &&              // ha la prop "statusCode"?
    typeof (obj as ApiError).error === "string" &&       // error è string?
    typeof (obj as ApiError).statusCode === "number"     // statusCode è number?
  );
}

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

// ─── TYPE GUARD 2: isTask ─────────────────────────────────
// Verifica a runtime che un oggetto sconosciuto sia un Task valido.
// Utile quando ricevi dati dall'API e vuoi essere sicuro al 100%
// che abbiano la forma giusta prima di usarli.
export function isTask(obj: unknown): obj is Task {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id"        in obj && typeof (obj as Task).id        === "string" &&
    "title"     in obj && typeof (obj as Task).title     === "string" &&
    "status"    in obj && ["TODO", "IN_PROGRESS", "DONE"].includes((obj as Task).status) &&
    "priority"  in obj && ["LOW", "MEDIUM", "HIGH"].includes((obj as Task).priority) &&
    "createdAt" in obj && typeof (obj as Task).createdAt === "string" &&
    "updatedAt" in obj && typeof (obj as Task).updatedAt === "string"
  );
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
    // isApiError: type guard — verifica la struttura prima di accedere ai campi
    // Prima: (error["error"] as string) → cast unsafe
    // Ora:   isApiError(error) → verifica reale a runtime
    const raw = await res.json().catch(() => null);
    if (isApiError(raw)) {
      // TypeScript sa che raw.error è string e raw.statusCode è number
      throw new Error(raw.error);
    }
    throw new Error("Errore nella richiesta");
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
