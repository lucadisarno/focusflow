import { useEffect, useState } from "react";
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

// ─── Tipi filtri ──────────────────────────────────────────
interface Filters {
  status: string; priority: string; categoryId: string;
  tagId: string; dateFrom: string; dateTo: string;
}

// ─── TASK PAGE ────────────────────────────────────────────
export function TaskPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks]               = useState<Task[]>([]);
  const [categories, setCategories]     = useState<Category[]>([]);
  const [tags, setTags]                 = useState<Tag[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [showFilters, setShowFilters]   = useState(false);

  // Form state
  const [title, setTitle]                   = useState("");
  const [description, setDescription]       = useState("");
  const [priority, setPriority]             = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [dueDate, setDueDate]               = useState("");
  const [categoryId, setCategoryId]         = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [submitting, setSubmitting]         = useState(false);
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

  useEffect(() => { Promise.all([loadCategories(), loadTags()]); }, []);
  useEffect(() => { loadTasks(); }, [searchParams]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filters.status)     query.set("status",     filters.status);
      if (filters.priority)   query.set("priority",   filters.priority);
      if (filters.categoryId) query.set("categoryId", filters.categoryId);
      if (filters.tagId)      query.set("tagId",      filters.tagId);
      if (filters.dateFrom)   query.set("dateFrom",   filters.dateFrom);
      if (filters.dateTo)     query.set("dateTo",     filters.dateTo);
      const qs = query.toString();
      const data = await apiFetch<Task[]>(`/api/tasks${qs ? `?${qs}` : ""}`);
      setTasks(data);
    } catch {
      setError("Errore nel caricamento dei task");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => { try { setCategories(await getCategories()); } catch {} };
  const loadTags       = async () => { try { setTags(await getTags());               } catch {} };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const newTask = await taskApi.create({
        title, description, priority,
        dueDate: dueDate || undefined,
        categoryId: categoryId || undefined,
        tagIds: selectedTagIds,
      });
      setTasks((prev) => [newTask, ...prev]);
      setTitle(""); setDescription(""); setPriority("MEDIUM");
      setDueDate(""); setCategoryId(""); setSelectedTagIds([]);
      setShowForm(false);
    } catch {
      setError("Errore nella creazione del task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    try {
      const updated = await taskApi.update(task.id, { status: nextStatus(task.status) });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch { setError("Errore nell'aggiornamento"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await taskApi.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch { setError("Errore nell'eliminazione"); }
  };

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
          {/* Filtri */}
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

          {/* Nuovo task */}
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

      {/* ── Form creazione (collassabile) ── */}
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
              disabled={submitting}
              autoFocus
              className="h-10 rounded-[--radius-lg] focus-visible:ring-[--ff-violet]
                         focus-visible:ring-2 focus-visible:ring-offset-0"
            />
            <Textarea
              placeholder="Descrizione (opzionale)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              rows={2}
              className="rounded-[--radius-lg] resize-none focus-visible:ring-[--ff-violet]
                         focus-visible:ring-2 focus-visible:ring-offset-0"
            />

            <div className="grid grid-cols-2 gap-3">
              <Select value={priority} onValueChange={(v) => setPriority(v as "LOW" | "MEDIUM" | "HIGH")}>
                <SelectTrigger className="h-10 rounded-[--radius-lg]">
                  <SelectValue placeholder="Priorità" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Bassa</SelectItem>
                  <SelectItem value="MEDIUM">Media</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryId} onValueChange={(v) => setCategoryId(v === "none" ? "" : v)}>
                <SelectTrigger className="h-10 rounded-[--radius-lg]">
                  <SelectValue placeholder="Categoria" />
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
                disabled={submitting}
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
                disabled={submitting || !title.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[--radius-pill]
                           text-sm font-medium transition-all duration-200 active:scale-95
                           disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "var(--ff-violet)", color: "white" }}
              >
                {submitting && <Loader2 size={13} className="animate-spin" />}
                {submitting ? "Creando..." : "Crea task"}
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
            <Select value={filters.status}
              onValueChange={(v) => updateFilter("status", v === "ALL" ? "" : v)}>
              <SelectTrigger className="h-9 text-xs rounded-[--radius-lg]">
                <SelectValue placeholder="Tutti gli status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tutti gli status</SelectItem>
                <SelectItem value="TODO">Da fare</SelectItem>
                <SelectItem value="IN_PROGRESS">In corso</SelectItem>
                <SelectItem value="DONE">Completato</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority}
              onValueChange={(v) => updateFilter("priority", v === "ALL" ? "" : v)}>
              <SelectTrigger className="h-9 text-xs rounded-[--radius-lg]">
                <SelectValue placeholder="Tutte le priorità" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tutte le priorità</SelectItem>
                <SelectItem value="LOW">Bassa</SelectItem>
                <SelectItem value="MEDIUM">Media</SelectItem>
                <SelectItem value="HIGH">Alta</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.categoryId}
              onValueChange={(v) => updateFilter("categoryId", v === "ALL" ? "" : v)}>
              <SelectTrigger className="h-9 text-xs rounded-[--radius-lg]">
                <SelectValue placeholder="Tutte le categorie" />
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

            <Select value={filters.tagId}
              onValueChange={(v) => updateFilter("tagId", v === "ALL" ? "" : v)}>
              <SelectTrigger className="h-9 text-xs rounded-[--radius-lg]">
                <SelectValue placeholder="Tutti i tag" />
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
      {error && (
        <div className="rounded-[--radius-lg] px-4 py-3 text-sm"
          style={{ backgroundColor: "var(--ff-coral-light)", color: "var(--ff-coral)" }}>
          {error}
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

                {/* Toggle status */}
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
                  {(() => {
                    const Icon = statusConfig[task.status].icon;
                    return <Icon size={13} />;
                  })()}
                </button>

                {/* Contenuto */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Titolo + badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-medium leading-snug
                                   ${task.status === "DONE" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {task.title}
                    </p>
                    <StatusPill status={task.status} />
                    <PriorityPill priority={task.priority} />
                  </div>

                  {/* Descrizione */}
                  {task.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  {/* Meta: scadenza + categoria + tag */}
                  <div className="flex flex-wrap items-center gap-2">
                    {task.dueDate && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <CalendarDays size={11} />
                        {new Date(task.dueDate).toLocaleDateString("it-IT")}
                      </span>
                    )}
                    {task.category && (
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium"
                        style={{
                          backgroundColor: `${task.category.color}15`,
                          color: task.category.color,
                        }}
                      >
                        <CategoryIcon name={task.category.icon} color={task.category.color} size={11} />
                        {task.category.name}
                      </span>
                    )}
                    {task.taskTags?.map(({ tag }) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                        style={{
                          backgroundColor: `${tag.color}15`,
                          border: `1px solid ${tag.color}40`,
                          color: tag.color,
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Elimina */}
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