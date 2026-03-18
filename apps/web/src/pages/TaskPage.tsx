import { useEffect, useState } from "react";
import { taskApi, type Task } from "@/lib/api";
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

// Componente icona dinamica
function CategoryIcon({ name, color, size = 14 }: { name: string; color: string; size?: number }) {
  const IconComponent = ICON_OPTIONS.find((i) => i.name === name)?.icon;
  if (!IconComponent) return null;
  return <IconComponent size={size} style={{ color }} />;
}

// Componente TagMultiSelect semplice
function TagMultiSelect({
  tags,
  selectedIds,
  onChange,
}: {
  tags: Tag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const selected = selectedIds.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggle(tag.id)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border-2 text-xs font-medium transition-all"
            style={{
              borderColor: tag.color,
              backgroundColor: selected ? tag.color : `${tag.color}15`,
              color: selected ? "white" : tag.color,
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: selected ? "white" : tag.color }}
            />
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}

// Configurazione status
const statusConfig = {
  TODO:        { label: "Da fare",    emoji: "⏳", className: "bg-slate-100 text-slate-600" },
  IN_PROGRESS: { label: "In corso",   emoji: "🔄", className: "bg-blue-100 text-blue-700" },
  DONE:        { label: "Completato", emoji: "✅", className: "bg-green-100 text-green-700" },
};

const priorityConfig = {
  LOW:    { label: "Bassa", className: "bg-slate-100 text-slate-600" },
  MEDIUM: { label: "Media", className: "bg-yellow-100 text-yellow-700" },
  HIGH:   { label: "Alta",  className: "bg-red-100 text-red-700" },
};

// Ciclo degli status: TODO → IN_PROGRESS → DONE → TODO
function nextStatus(current: Task["status"]): Task["status"] {
  if (current === "TODO") return "IN_PROGRESS";
  if (current === "IN_PROGRESS") return "DONE";
  return "TODO";
}

export function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [categoryId, setCategoryId] = useState<string>("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Filtri
  const [filterCategoryId, setFilterCategoryId] = useState<string>("");

  useEffect(() => {
    Promise.all([loadTasks(), loadCategories(), loadTags()]);
  }, []);

  const loadTasks = async (catId?: string) => {
    try {
      const data = await taskApi.getAll(catId ? { categoryId: catId } : undefined);
      setTasks(data);
    } catch {
      setError("Errore nel caricamento dei task");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {}
  };

  const loadTags = async () => {
    try {
      const data = await getTags();
      setTags(data);
    } catch {}
  };

  const handleFilterCategory = async (value: string | null) => {
    setFilterCategoryId(value ?? "");
    setLoading(true);
    await loadTasks(value || undefined);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const newTask = await taskApi.create({
        title,
        description,
        priority,
        categoryId: categoryId || undefined,
        tagIds: selectedTagIds,
      });
      setTasks((prev) => [newTask, ...prev]);
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setCategoryId("");
      setSelectedTagIds([]);
    } catch {
      setError("Errore nella creazione del task");
    } finally {
      setSubmitting(false);
    }
  };

  // Cicla lo status al click invece di toggle completed
  const handleToggleStatus = async (task: Task) => {
    try {
      const updated = await taskApi.update(task.id, {
        status: nextStatus(task.status),
      });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {
      setError("Errore nell'aggiornamento del task");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await taskApi.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Errore nell'eliminazione del task");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">I miei Task</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gestisci e organizza i tuoi task
        </p>
      </div>

      {/* Form creazione */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nuovo Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-3">
            <Input
              placeholder="Titolo del task..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
            />
            <Textarea
              placeholder="Descrizione (opzionale)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              rows={2}
            />

            {/* Priorità + Categoria */}
            <div className="flex gap-2">
              <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priorità" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">🟢 Bassa</SelectItem>
                  <SelectItem value="MEDIUM">🟡 Media</SelectItem>
                  <SelectItem value="HIGH">🔴 Alta</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryId} onValueChange={(v) => setCategoryId(v)}>
                <SelectTrigger className="flex-1">
                  <SelectValue>
                    {categoryId
                      ? (() => {
                          const cat = categories.find((c) => c.id === categoryId);
                          return cat ? (
                            <div className="flex items-center gap-2">
                              <CategoryIcon name={cat.icon} color={cat.color} />
                              {cat.name}
                            </div>
                          ) : "Categoria (opzionale)";
                        })()
                      : "Categoria (opzionale)"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nessuna categoria</SelectItem>
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

            {/* Tag multiselect */}
            {tags.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Tag</p>
                <TagMultiSelect
                  tags={tags}
                  selectedIds={selectedTagIds}
                  onChange={setSelectedTagIds}
                />
              </div>
            )}

            <Button type="submit" disabled={submitting || !title.trim()}>
              {submitting ? "Creando..." : "Crea Task"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Filtro per categoria */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtra:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterCategory("")}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filterCategoryId === ""
                  ? "bg-foreground text-background border-foreground"
                  : "border-border hover:bg-accent"
              }`}
            >
              Tutti
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleFilterCategory(cat.id)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border-2 transition-all"
                style={{
                  borderColor: cat.color,
                  backgroundColor:
                    filterCategoryId === cat.id ? cat.color : `${cat.color}15`,
                  color: filterCategoryId === cat.id ? "white" : cat.color,
                }}
              >
                <CategoryIcon
                  name={cat.icon}
                  color={filterCategoryId === cat.id ? "white" : cat.color}
                />
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Errore */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Lista task */}
      {loading ? (
        <p className="text-muted-foreground text-center">Caricamento...</p>
      ) : tasks.length === 0 ? (
        <p className="text-muted-foreground text-center">
          Nessun task ancora. Creane uno! 🚀
        </p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className={task.status === "DONE" ? "opacity-60" : ""}
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">

                  {/* Bottone status ciclico */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(task)}
                    title={`Status: ${statusConfig[task.status].label} — clicca per cambiare`}
                    className="mt-0.5 text-lg leading-none transition-transform hover:scale-110"
                  >
                    {statusConfig[task.status].emoji}
                  </button>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-medium ${task.status === "DONE" ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </p>
                      {/* Badge status */}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[task.status].className}`}>
                        {statusConfig[task.status].label}
                      </span>
                      {/* Badge priorità */}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityConfig[task.priority].className}`}>
                        {priorityConfig[task.priority].label}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}

                    {/* dueDate */}
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        📅 {new Date(task.dueDate).toLocaleDateString("it-IT")}
                      </p>
                    )}

                    {/* Categoria */}
                    {task.category && (
                      <div
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium"
                        style={{
                          backgroundColor: `${task.category.color}20`,
                          color: task.category.color,
                        }}
                      >
                        <CategoryIcon name={task.category.icon} color={task.category.color} size={12} />
                        {task.category.name}
                      </div>
                    )}

                    {/* Tag */}
                    {task.taskTags && task.taskTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.taskTags.map(({ tag }) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="text-xs px-2 py-0"
                            style={{ borderColor: tag.color, color: tag.color }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(task.id)}
                    className="text-destructive hover:text-destructive shrink-0"
                  >
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