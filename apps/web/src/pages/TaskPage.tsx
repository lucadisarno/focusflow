import { useEffect, useState } from "react";
import { taskApi, type Task } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";

export function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // ─── Carica i task ────────────────────────────────────────
  const loadTasks = async () => {
    try {
      const data = await taskApi.getAll();
      setTasks(data);
    } catch (err) {
      setError("Errore nel caricamento dei task");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // ─── Crea task ────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const newTask = await taskApi.create({ title, description });
      setTasks((prev) => [newTask, ...prev]);
      setTitle("");
      setDescription("");
    } catch (err) {
      setError("Errore nella creazione del task");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Toggle completato ────────────────────────────────────
  const handleToggle = async (task: Task) => {
    try {
      const updated = await taskApi.update(task.id, { completed: !task.completed });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {
      setError("Errore nell'aggiornamento del task");
    }
  };

  // ─── Elimina task ─────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      await taskApi.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Errore nell'eliminazione del task");
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">I miei Task 📝</h1>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            ← Dashboard
          </Button>
        </div>

        {/* Form creazione */}
        <Card>
          <CardHeader>
            <CardTitle>Nuovo Task</CardTitle>
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
              <Button type="submit" disabled={submitting || !title.trim()}>
                {submitting ? "Creando..." : "Crea Task"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Errore */}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

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
              <Card key={task.id} className={task.completed ? "opacity-60" : ""}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggle(task)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${task.completed ? "line-through" : ""}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
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
    </div>
  );
}