import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { taskApi, type Task, apiFetch } from "@/lib/api";
import { getCategories, type Category } from "@/api/categories";
import { getTags, type Tag } from "@/api/tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICON_OPTIONS } from "@/components/ui/icon-picker";
import { SlidersHorizontal, X } from "lucide-react";

function CategoryIcon({ name, color, size = 14 }: { name: string; color: string; size?: number }) {
  const IconComponent = ICON_OPTIONS.find((i) => i.name === name)?.icon;
  if (!IconComponent) return null;
  return <IconComponent size={size} style={{ color }} />;
}

function TagMultiSelect({
  tags, selectedIds, onChange,
}: {
  tags: Tag[]; selectedIds: string[]; onChange: (ids: string[]) => void;
}) {
  function toggle(id: string) {
    if (selectedIds.includes(id)) onChange(selectedIds.filter((i) => i !== id));
    else onChange([...selectedIds, id]);
  }
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const selected = selectedIds.includes(tag.id);
        return (
          <button key={tag.id} type="button" onClick={() => toggle(tag.id)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border-2 text-xs font-medium transition-all"
            style={{
              borderColor: tag.color,
              backgroundColor: selected ? tag.color : `${tag.color}15`,
              color: selected ? "white" : tag.color,
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selected ? "white" : tag.color }} />
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}

const statusConfig = {
  TODO:        { label: "Da fare",    emoji: "⏳", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
  IN_PROGRESS: { label: "In corso",   emoji: "🔄", className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  DONE:        { label: "Completato", emoji: "✅", className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
};

const priorityConfig = {
  LOW:    { label: "Bassa",  className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
  MEDIUM: { label: "Media",  className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  HIGH:   { label: "Alta",   className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
};

function nextStatus(current: Task["status"]): Task["status"] {
  if (current === "TODO") return "IN_PROGRESS";
  if (current === "IN_PROGRESS") return "DONE";
  return "TODO";
}

// ─── Tipi filtri ──────────────────────────────────────────────
interface Filters {
  status: string;
  priority: string;
  categoryId: string;
  tagId: string;
  dateFrom: string;
  dateTo: string;
}

const DEFAULT_FILTERS: Filters = {
  status: "", priority: "", categoryId: "",
  tagId: "", dateFrom: "", dateTo: "",
};

export function TaskPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [dueDate, setDueDate] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // ─── Filtri da URL params ────────────────────────────────
  const filters: Filters = {
    status:     searchParams.get("status")     ?? "",
    priority:   searchParams.get("priority")   ?? "",
    categoryId: searchParams.get("categoryId") ?? "",
    tagId:      searchParams.get("tagId")      ?? "",
    dateFrom:   searchParams.get("dateFrom")   ?? "",
    dateTo:     searchParams.get("dateTo")     ?? "",
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const updateFilter = (key: keyof Filters, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams(new URLSearchParams());

  useEffect(() => {
    Promise.all([loadCategories(), loadTags()]);
  }, []);

  useEffect(() => {
    loadTasks();
  }, [searchParams]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filters.status)     query.set("status", filters.status);
      if (filters.priority)   query.set("priority", filters.priority);
      if (filters.categoryId) query.set("categoryId", filters.categoryId);
      if (filters.tagId)      query.set("tagId", filters.tagId);
      if (filters.dateFrom)   query.set("dateFrom", filters.dateFrom);
      if (filters.dateTo)     query.set("dateTo", filters.dateTo);
      const qs = query.toString();
      const data = await apiFetch<Task[]>(`/api/tasks${qs ? `?${qs}` : ""}`);
      setTasks(data);
    } catch {
      setError("Errore nel caricamento dei task");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try { setCategories(await getCategories()); } catch {}
  };

  const loadTags = async () => {
    try { setTags(await getTags()); } catch {}
  };

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
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">I miei Task</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestisci e organizza i tuoi task</p>
        </div>
        <Button
          variant="outline" size="sm"
          onClick={() => setShowFilters((v) => !v)}
          className="gap-2"
        >
          <SlidersHorizontal size={14} />
          Filtri
          {activeFilterCount > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* ─── FilterPanel ─────────────────────────────────────── */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Filtra Task</CardTitle>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 h-7 text-xs text-muted-foreground">
                  <X size={12} /> Azzera filtri
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Riga 1: Status + Priority */}
            <div className="grid grid-cols-2 gap-2">
              <Select value={filters.status} onValueChange={(v) => updateFilter("status", v === "ALL" ? "" : v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Tutti gli status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tutti gli status</SelectItem>
                  <SelectItem value="TODO">⏳ Da fare</SelectItem>
                  <SelectItem value="IN_PROGRESS">🔄 In corso</SelectItem>
                  <SelectItem value="DONE">✅ Completato</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.priority} onValueChange={(v) => updateFilter("priority", v === "ALL" ? "" : v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Tutte le priorità" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tutte le priorità</SelectItem>
                  <SelectItem value="LOW">🟢 Bassa</SelectItem>
                  <SelectItem value="MEDIUM">🟡 Media</SelectItem>
                  <SelectItem value="HIGH">🔴 Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Riga 2: Categoria + Tag */}
            <div className="grid grid-cols-2 gap-2">
              <Select value={filters.categoryId} onValueChange={(v) => updateFilter("categoryId", v === "ALL" ? "" : v)}>
                <SelectTrigger className="h-8 text-xs">
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

              <Select value={filters.tagId} onValueChange={(v) => updateFilter("tagId", v === "ALL" ? "" : v)}>
                <SelectTrigger className="h-8 text-xs">
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

            {/* Riga 3: Date range */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Da data</p>
                <Input type="date" className="h-8 text-xs" value={filters.dateFrom}
                  onChange={(e) => updateFilter("dateFrom", e.target.value)} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">A data</p>
                <Input type="date" className="h-8 text-xs" value={filters.dateTo}
                  onChange={(e) => updateFilter("dateTo", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form creazione */}
      <Card>
        <CardHeader><CardTitle className="text-base">Nuovo Task</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-3">
            <Input placeholder="Titolo del task..." value={title}
              onChange={(e) => setTitle(e.target.value)} disabled={submitting} />
            <Textarea placeholder="Descrizione (opzionale)..." value={description}
              onChange={(e) => setDescription(e.target.value)} disabled={submitting} rows={2} />
            <div className="flex gap-2">
              <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                <SelectTrigger className="w-32"><SelectValue placeholder="Priorità" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">🟢 Bassa</SelectItem>
                  <SelectItem value="MEDIUM">🟡 Media</SelectItem>
                  <SelectItem value="HIGH">🔴 Alta</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryId} onValueChange={(v) => setCategoryId(v)}>
                <SelectTrigger className="flex-1">
                  <SelectValue>
                    {categoryId ? (() => {
                      const cat = categories.find((c) => c.id === categoryId);
                      return cat ? (
                        <div className="flex items-center gap-2">
                          <CategoryIcon name={cat.icon} color={cat.color} />{cat.name}
                        </div>
                      ) : "Categoria (opzionale)";
                    })() : "Categoria (opzionale)"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nessuna categoria</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <CategoryIcon name={cat.icon} color={cat.color} />{cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Scadenza (opzionale)</p>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={submitting} />
            </div>
            {tags.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Tag</p>
                <TagMultiSelect tags={tags} selectedIds={selectedTagIds} onChange={setSelectedTagIds} />
              </div>
            )}
            <Button type="submit" disabled={submitting || !title.trim()}>
              {submitting ? "Creando..." : "Crea Task"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Lista task */}
      {loading ? (
        <p className="text-muted-foreground text-center">Caricamento...</p>
      ) : tasks.length === 0 ? (
        <p className="text-muted-foreground text-center">Nessun task trovato 🔍</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card key={task.id} className={task.status === "DONE" ? "opacity-60" : ""}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <button type="button" onClick={() => handleToggleStatus(task)}
                    title={`Status: ${statusConfig[task.status].label}`}
                    className="mt-0.5 text-lg leading-none transition-transform hover:scale-110">
                    {statusConfig[task.status].emoji}
                  </button>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-medium ${task.status === "DONE" ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[task.status].className}`}>
                        {statusConfig[task.status].label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityConfig[task.priority].className}`}>
                        {priorityConfig[task.priority].label}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        📅 {new Date(task.dueDate).toLocaleDateString("it-IT")}
                      </p>
                    )}
                    {task.category && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium"
                        style={{ backgroundColor: `${task.category.color}20`, color: task.category.color }}>
                        <CategoryIcon name={task.category.icon} color={task.category.color} size={12} />
                        {task.category.name}
                      </div>
                    )}
                    {task.taskTags && task.taskTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.taskTags.map(({ tag }) => (
                          <Badge key={tag.id} variant="outline" className="text-xs px-2 py-0"
                            style={{ borderColor: tag.color, color: tag.color }}>
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id)}
                    className="text-destructive hover:text-destructive shrink-0">
                    Elimina
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}