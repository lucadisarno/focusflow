import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { dashboardApi, type DashboardStats } from "@/lib/api";
import { ICON_OPTIONS } from "@/components/ui/icon-picker";

function CategoryIcon({ name, color, size = 14 }: { name: string; color: string; size?: number }) {
  const IconComponent = ICON_OPTIONS.find((i) => i.name === name)?.icon;
  if (!IconComponent) return null;
  return <IconComponent size={size} style={{ color }} />;
}

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
    <div className="bg-background p-6">
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

        {/* Statistiche globali */}
        {loading ? (
          <p className="text-muted-foreground">Caricamento statistiche...</p>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Totale</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.stats.total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completati</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{stats.stats.completed}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">In corso</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-yellow-600">{stats.stats.pending}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{stats.stats.completionRate}%</p>
                </CardContent>
              </Card>
            </div>

            {/* Statistiche per categoria */}
            {stats.categoryStats && stats.categoryStats.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Progresso per categoria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.categoryStats.map((cat) => (
                    <div key={cat.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-md flex items-center justify-center"
                            style={{ backgroundColor: `${cat.color}20` }}
                          >
                            <CategoryIcon name={cat.icon} color={cat.color} size={14} />
                          </div>
                          <span className="font-medium">{cat.name}</span>
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {cat.completed}/{cat.total} task · {cat.completionRate}%
                        </span>
                      </div>
                      {/* Barra progresso colorata */}
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${cat.completionRate}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Azioni rapide */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Azioni rapide</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-3 flex-wrap">
                <Button onClick={() => navigate("/tasks")}>
                  📝 Gestisci Task
                </Button>
                <Button variant="outline" onClick={() => navigate("/categories")}>
                  🏷️ Categorie
                </Button>
                <Button variant="outline" onClick={() => navigate("/tags")}>
                  🔖 Tag
                </Button>
                <Button variant="outline" onClick={() => navigate("/calendar")}>
                  📅 Calendario
                </Button>
              </CardContent>
            </Card>

            {/* Task recenti */}
            {stats.recentTasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Task recenti</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {stats.recentTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2">
                      <span className={
                        task.status === "DONE"
                          ? "text-green-500"
                          : task.status === "IN_PROGRESS"
                          ? "text-blue-500"
                          : "text-yellow-500"
                      }>
                        {task.status === "DONE" ? "✅" : task.status === "IN_PROGRESS" ? "🔄" : "⏳"}
                      </span>
                      <span className={`text-sm ${task.status === "DONE" ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        ) : null}

      </div>
    </div>
  );
}