import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { taskApi, type Task, apiFetch } from "@/lib/api";
import { getCategories, type Category } from "@/api/categories";
import { getTags, type Tag } from "@/api/tags";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ICON_OPTIONS } from "@/components/ui/icon-picker";
import { SlidersHorizontal, X, Plus, Loader2, CheckSquare, Circle, RefreshCw, Trash2, CalendarDays } from "lucide-react";

// ─── Icona categoria ──────────────────────────────────────
function CategoryIcon({ name, color, size = 14 }: { name: string; color: string; size?: number }) {
  const IconComponent = ICON_OPTIONS.find((i) => i.name === name)?.icon;
  if (!IconComponent) return null;
  return <IconComponent size={size} style={{ color }} />;
}

// ─── Tag multi-select ─────────────────────────────────────
function TagMultiSelect({ tags, selectedIds, onChange }: {
  tags: Tag[]; selectedIds: string[]; onChange: (ids: string[]) => void;
}) {
  function toggle(id: string) {
    onChange(selectedIds.includes(id)
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id]);
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => {
        const selected = selectedIds.includes(tag.id);
        return (
          <button key={tag.id} type="button" onClick={() => toggle(tag.id)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-150"
            style={{
              border: `1.5px solid ${tag.color}`,
              backgroundColor: selected ? tag.color : `${tag.color}15`,
              color: selected ? "white" : tag.color,
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: selected ? "white" : tag.color }} />
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}

// ─── Status config ────────────────────────────────────────
const statusConfig = {
  TODO:        { label: "Da fare",    bg: "var(--ff-amber-light)",  color: "var(--ff-amber-dark)",  icon: Circle },
  IN_PROGRESS: { label: "In corso",   bg: "var(--ff-violet-light)", color: "var(--ff-violet)",      icon: RefreshCw },
  DONE:        { label: "Completato", bg: "var(--ff-teal-light)",   color: "var(--ff-teal)",        icon: CheckSquare },
};

const priorityConfig = {
  LOW:    { label: "Bassa",  bg: "var(--ff-sand)",         color: "var(--color-muted-foreground)" },
  MEDIUM: { label: "Media",  bg: "var(--ff-amber-light)",  color: "var(--ff-amber-dark)" },
  HIGH:   { label: "Alta",   bg: "var(--ff-coral-light)",  color: "var(--ff-coral)" },
};

function nextStatus(current: Task["status"]): Task["status"] {
  if (current === "TODO") return "IN_PROGRESS";
  if (current === "IN_PROGRESS") return "DONE";
  return "TODO";
}

// ─── Status pill ──────────────────────────────────────────
function StatusPill({ status }: { status: Task["status"] }) {
  const s = statusConfig[status];
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

// ─── Priority pill ────────────────────────────────────────
function PriorityPill({ priority }: { priority: Task["priority"] }) {
  const p = priorityConfig[priority];
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium"
      style={{ backgroundColor: p.bg, color: p.color }}>
      {p.label}
    </span>
  );
}

// ─── CategoryTriggerLabel ─────────────────────────────────
function CategoryTriggerLabel({
  value, categories, placeholder,
}: {
  value: string | null | undefined;
  categories: Category[];
  placeholder: string;
}) {
  if (!value || value === "none" || value === "ALL") {
    return <span className="text-muted-foreground">{placeholder}</span>;
  }
  const cat = categories.find((c) => c.id === value);
  if (!cat) return <span className="text-muted-foreground">{placeholder}</span>;
  return (
    <span className="inline-flex items-center gap-2">
      <CategoryIcon name={cat.icon} color={cat.color} size={13} />
      <span>{cat.name}</span>
    </span>
  );
}

// ─── TagTriggerLabel ──────────────────────────────────────
function TagTriggerLabel({
  value, tags, placeholder,
}: {
  value: string | null | undefined;
  tags: Tag[];
  placeholder: string;
}) {
  if (!value || value === "ALL") {
    return <span className="text-muted-foreground">{placeholder}</span>;
  }
  const tag = tags.find((t) => t.id === value);
  if (!tag) return <span className="text-muted-foreground">{placeholder}</span>;
  return (
    <span className="inline-flex items-center gap-2">
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
      <span>{tag.name}</span>
    </span>
  );
}

// ─── TaskStats ────────────────────────────────────────────
function TaskStats({ tasks }: { tasks: Task[] }) {
  const stats = useMemo(() => ({
    total:       tasks.length,
    todo:        tasks.filter((t) => t.status === "TODO").length,
    in_progress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    done:        tasks.filter((t) => t.status === "DONE").length,
  }), [tasks]);

  if (stats.total === 0) return null;

  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="rounded-[--radius-xl] border border-border bg-card px-4 py-3 text-center">
        <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Totale</p>
      </div>
      <div className="rounded-[--radius-xl] border bg-card px-4 py-3 text-center"
        style={{ borderColor: "var(--ff-amber-light)" }}>
        <p className="text-2xl font-semibold" style={{ color: "var(--ff-amber-dark)" }}>
          {stats.todo}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">Da fare</p>
      </div>
      <div className="rounded-[--radius-xl] border bg-card px-4 py-3 text-center"
        style={{ borderColor: "var(--ff-violet-light)" }}>
        <p className="text-2xl font-semibold" style={{ color: "var(--ff-violet)" }}>
          {stats.in_progress}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">In corso</p>
      </div>
      <div className="rounded-[--radius-xl] border bg-card px-4 py-3 text-center"
        style={{ borderColor: "var(--ff-teal-light)" }}>
        <p className="text-2xl font-semibold" style={{ color: "var(--ff-teal)" }}>
          {stats.done}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">Completati</p>
      </div>
    </div>
  );
}

// ─── Tipi filtri ──────────────────────────────────────────
interface Filters {
  status: string; priority: string; categoryId: string;
  tagId: string; dateFrom: string; dateTo: string;
}

// ─── TASK PAGE ────────────────────────────────────────────
export function TaskPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [showFilters, setShowFilters] = useState(false);

  const [title, setTitle]                   = useState("");
  const [description, setDescription]       = useState("");
  const [priority, setPriority]             = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [dueDate, setDueDate]               = useState("");
  const [categoryId, setCategoryId]         = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [showForm, setShowForm]             = useState(false);

  const filters: Filters = {
    status:     String(searchParams.get("status")     ?? ""),
    priority:   String(searchParams.get("priority")   ?? ""),
    categoryId: String(searchParams.get("categoryId") ?? ""),
    tagId:      String(searchParams.get("tagId")      ?? ""),
    dateFrom:   String(searchParams.get("dateFrom")   ?? ""),
    dateTo:     String(searchParams.get("dateTo")     ?? ""),
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const updateFilter = (key: keyof Filters, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams(new URLSearchParams());

  // ── useQuery: tasks ───────────────────────────────────────
  // queryKey include filters → ogni volta che i filtri cambiano
  // (via searchParams) TanStack Query rifetch automaticamente.
  const { data: tasks = [], isLoading: loading, isError } = useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => {
      const query = new URLSearchParams();
      if (filters.status)     query.set("status",     filters.status);
      if (filters.priority)   query.set("priority",   filters.priority);
      if (filters.categoryId) query.set("categoryId", filters.categoryId);
      if (filters.tagId)      query.set("tagId",      filters.tagId);
      if (filters.dateFrom)   query.set("dateFrom",   filters.dateFrom);
      if (filters.dateTo)     query.set("dateTo",     filters.dateTo);
      const qs = query.toString();
      return apiFetch<Task[]>(`/api/tasks${qs ? `?${qs}` : ""}`);
    },
  });

  // ── useQuery: categories ──────────────────────────────────
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // ── useQuery: tags ────────────────────────────────────────
  const { data: tags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
  });

  // ── useMutation: createTask ───────────────────────────────
  // onSuccess → invalida la cache "tasks" → useQuery rifetch
  // automaticamente → la lista si aggiorna senza setState manuale.
  const createMutation = useMutation({
    mutationFn: (data: {
      title: string; description: string; priority: "LOW" | "MEDIUM" | "HIGH";
      dueDate?: string; categoryId?: string; tagIds: string[];
    }) => taskApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setTitle(""); setDescription(""); setPriority("MEDIUM");
      setDueDate(""); setCategoryId(""); setSelectedTagIds([]);
      setShowForm(false);
    },
  });

  // ── useMutation: toggleStatus ─────────────────────────────
  const toggleStatusMutation = useMutation({
    mutationFn: (task: Task) =>
      taskApi.update(task.id, { status: nextStatus(task.status) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // ── useMutation: deleteTask ───────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => taskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createMutation.mutate({
      title, description, priority,
      dueDate: dueDate || undefined,
      categoryId: categoryId || undefined,
      tagIds: selectedTagIds,
    });
  };

  // ── useCallback mantenuti per stabilità delle props ───────
  const handleToggleStatus = useCallback((task: Task) => {
    toggleStatusMutation.mutate(task);
  }, [toggleStatusMutation]);

  const handleDelete = useCallback((id: string) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
            Gestione
          </p>
          <h1 className="font-display text-3xl text-foreground">I miei Task</h1>
          <p className="text-sm text-muted-foreground">
            Gestisci e organizza i tuoi task
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[--radius-pill]
                       text-sm font-medium border border-border bg-card text-foreground
                       hover:bg-muted transition-all duration-200"
          >
            <SlidersHorizontal size={14} />
            Filtri
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center"
                style={{ backgroundColor: "var(--ff-violet)", color: "white" }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[--radius-pill]
                       text-sm font-medium transition-all duration-200 active:scale-95"
            style={{ backgroundColor: "var(--ff-violet)", color: "white" }}
          >
            <Plus size={15} />
            Nuovo task
          </button>
        </div>
      </div>

      {/* ── TaskStats ── */}
      {!loading && <TaskStats tasks={tasks} />}

      {/* ── Form creazione ── */}
      {showForm && (
        <div className="rounded-[--radius-xl] border border-[--ff-violet-light] bg-card p-6 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-medium text-foreground">Nuovo task</h2>
            <button onClick={() => setShowForm(false)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X size={14} />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              placeholder="Titolo del task..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={createMutation.isPending}
              autoFocus
              className="h-10 rounded-[--radius-lg] focus-visible:ring-[--ff-violet]
                         focus-visible:ring-2 focus-visible:ring-offset-0"
            />
            <Textarea
              placeholder="Descrizione (opzionale)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={createMutation.isPending}
              rows={2}
              className="rounded-[--radius-lg] resize-none focus-visible:ring-[--ff-violet]
                         focus-visible:ring-2 focus-visible:ring-offset-0"
            />

            <div className="grid grid-cols-2 gap-3">
              <Select value={priority} onValueChange={(v) => setPriority(v as "LOW" | "MEDIUM" | "HIGH")}>
                <SelectTrigger className="h-10 rounded-[--radius-lg]">
                  <span>{priorityConfig[priority]?.label ?? "Priorità"}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Bassa</SelectItem>
                  <SelectItem value="MEDIUM">Media</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={categoryId || "none"}
                onValueChange={(v) => setCategoryId(v === "none" ? "" : (v ?? ""))}
              >
                <SelectTrigger className="h-10 rounded-[--radius-lg]">
                  <CategoryTriggerLabel value={categoryId} categories={categories} placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nessuna categoria</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <CategoryIcon name={cat.icon} color={cat.color} />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Scadenza (opzionale)</p>
              <Input type="date" value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={createMutation.isPending}
                className="h-10 rounded-[--radius-lg] focus-visible:ring-[--ff-violet]
                           focus-visible:ring-2 focus-visible:ring-offset-0" />
            </div>

            {tags.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Tag</p>
                <TagMultiSelect tags={tags} selectedIds={selectedTagIds} onChange={setSelectedTagIds} />
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={createMutation.isPending || !title.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[--radius-pill]
                           text-sm font-medium transition-all duration-200 active:scale-95
                           disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "var(--ff-violet)", color: "white" }}
              >
                {createMutation.isPending && <Loader2 size={13} className="animate-spin" />}
                {createMutation.isPending ? "Creando..." : "Crea task"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Filtri ── */}
      {showFilters && (
        <div className="rounded-[--radius-xl] border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">Filtri attivi</h2>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs text-muted-foreground
                           hover:text-foreground transition-colors">
                <X size={12} /> Azzera
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select value={filters.status || "ALL"}
              onValueChange={(v) => updateFilter("status", v === "ALL" ? "" : (v ?? ""))}>
              <SelectTrigger className="h-9 text-xs rounded-[--radius-lg]">
                <span>
                  {filters.status
                    ? (statusConfig[filters.status as keyof typeof statusConfig]?.label ?? filters.status)
                    : "Tutti gli status"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tutti gli status</SelectItem>
                <SelectItem value="TODO">Da fare</SelectItem>
                <SelectItem value="IN_PROGRESS">In corso</SelectItem>
                <SelectItem value="DONE">Completato</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority || "ALL"}
              onValueChange={(v) => updateFilter("priority", v === "ALL" ? "" : (v ?? ""))}>
              <SelectTrigger className="h-9 text-xs rounded-[--radius-lg]">
                <span>
                  {filters.priority
                    ? (priorityConfig[filters.priority as keyof typeof priorityConfig]?.label ?? filters.priority)
                    : "Tutte le priorità"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tutte le priorità</SelectItem>
                <SelectItem value="LOW">Bassa</SelectItem>
                <SelectItem value="MEDIUM">Media</SelectItem>
                <SelectItem value="HIGH">Alta</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.categoryId || "ALL"}
              onValueChange={(v) => updateFilter("categoryId", v === "ALL" ? "" : (v ?? ""))}>
              <SelectTrigger className="h-9 text-xs rounded-[--radius-lg]">
                <CategoryTriggerLabel value={filters.categoryId} categories={categories} placeholder="Tutte le categorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tutte le categorie</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <CategoryIcon name={cat.icon} color={cat.color} size={12} />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.tagId || "ALL"}
              onValueChange={(v) => updateFilter("tagId", v === "ALL" ? "" : (v ?? ""))}>
              <SelectTrigger className="h-9 text-xs rounded-[--radius-lg]">
                <TagTriggerLabel value={filters.tagId} tags={tags} placeholder="Tutti i tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tutti i tag</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                      {tag.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Da data</p>
              <Input type="date" className="h-9 text-xs rounded-[--radius-lg]"
                value={filters.dateFrom}
                onChange={(e) => updateFilter("dateFrom", e.target.value)} />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">A data</p>
              <Input type="date" className="h-9 text-xs rounded-[--radius-lg]"
                value={filters.dateTo}
                onChange={(e) => updateFilter("dateTo", e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* ── Errore ── */}
      {isError && (
        <div className="rounded-[--radius-lg] px-4 py-3 text-sm"
          style={{ backgroundColor: "var(--ff-coral-light)", color: "var(--ff-coral)" }}>
          Errore nel caricamento dei task
        </div>
      )}

      {/* ── Lista task ── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-muted-foreground" size={24} />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-[--radius-xl] flex items-center justify-center mb-4"
            style={{ backgroundColor: "var(--ff-violet-light)" }}>
            <CheckSquare size={24} style={{ color: "var(--ff-violet)" }} />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Nessun task trovato</p>
          <p className="text-xs text-muted-foreground">
            {activeFilterCount > 0
              ? "Prova a modificare i filtri attivi."
              : "Crea il tuo primo task con il bottone in alto."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`group rounded-[--radius-xl] border border-border bg-card px-5 py-4
                          hover:shadow-[0_4px_20px_-8px_rgba(92,74,228,0.10)]
                          hover:-translate-y-0.5 hover:border-[--ff-violet-light]
                          transition-all duration-200
                          ${task.status === "DONE" ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(task)}
                  title={`Status: ${statusConfig[task.status].label} — clicca per avanzare`}
                  className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                             transition-all duration-150 hover:scale-110"
                  style={{
                    backgroundColor: statusConfig[task.status].bg,
                    color: statusConfig[task.status].color,
                  }}
                >
                  {(() => { const Icon = statusConfig[task.status].icon; return <Icon size={13} />; })()}
                </button>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-medium leading-snug
                                   ${task.status === "DONE" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {task.title}
                    </p>
                    <StatusPill status={task.status} />
                    <PriorityPill priority={task.priority} />
                  </div>

                  {task.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{task.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    {task.dueDate && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <CalendarDays size={11} />
                        {new Date(task.dueDate).toLocaleDateString("it-IT")}
                      </span>
                    )}
                    {task.category && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium"
                        style={{ backgroundColor: `${task.category.color}15`, color: task.category.color }}>
                        <CategoryIcon name={task.category.icon} color={task.category.color} size={11} />
                        {task.category.name}
                      </span>
                    )}
                    {task.taskTags?.map(({ tag }) => (
                      <span key={tag.id}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                        style={{ backgroundColor: `${tag.color}15`, border: `1px solid ${tag.color}40`, color: tag.color }}>
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(task.id)}
                  className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1.5 rounded-lg
                             text-muted-foreground hover:text-[--ff-coral] hover:bg-[--ff-coral-light]
                             transition-all duration-150"
                  title="Elimina task"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}