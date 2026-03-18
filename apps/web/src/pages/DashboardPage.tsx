import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { dashboardApi, type DashboardStats } from "@/lib/api";

export function DashboardPage() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Ciao,{" "}
            <span className="font-medium text-foreground">
              {session?.user.name ?? session?.user.email}
            </span>!
          </p>
        </div>

        {/* Statistiche */}
        {loading ? (
          <p className="text-muted-foreground">Caricamento statistiche...</p>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Totale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completati
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{stats.stats.completed}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  In corso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-600">{stats.stats.pending}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{stats.stats.completionRate}%</p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Azioni rapide */}
        <Card>
          <CardHeader>
            <CardTitle>Azioni rapide</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button onClick={() => navigate("/tasks")}>
              📝 Gestisci Task
            </Button>
            <Button variant="outline" onClick={() => navigate("/categories")}>
              🏷️ Gestisci Categorie
            </Button>
          </CardContent>
        </Card>

        {/* Task recenti */}
        {stats && stats.recentTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Task recenti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.recentTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2">
                  <span className={task.completed ? "text-green-500" : "text-yellow-500"}>
                    {task.completed ? "✅" : "⏳"}
                  </span>
                  <span className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}