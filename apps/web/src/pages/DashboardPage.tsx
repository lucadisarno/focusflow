import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/lib/auth-client";
import { dashboardApi, type DashboardStats } from "@/lib/api";
import { ICON_OPTIONS } from "@/components/ui/icon-picker";

// ─── Helper: icona categoria ──────────────────────────────
function CategoryIcon({ name, color, size = 14 }: { name: string; color: string; size?: number }) {
  const IconComponent = ICON_OPTIONS.find((i) => i.name === name)?.icon;
  if (!IconComponent) return null;
  return <IconComponent size={size} style={{ color }} />;
}

// ─── Helper: saluto in base all'ora ──────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buongiorno";
  if (h < 18) return "Buon pomeriggio";
  return "Buonasera";
}

// ─── Stat Card ────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number | string;
  accent: string;
  accentLight: string;
  suffix?: string;
  sublabel?: string;
}

function StatCard({ label, value, accent, accentLight, suffix, sublabel }: StatCardProps) {
  return (
    <div
      className="relative rounded-[--radius-xl] p-5 flex flex-col gap-2 overflow-hidden
                 border border-border bg-card
                 hover:shadow-[0_4px_24px_-8px_rgba(92,74,228,0.10)]
                 hover:-translate-y-0.5 transition-all duration-300"
    >
      <div
        aria-hidden="true"
        className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-40 pointer-events-none"
        style={{ background: accentLight }}
      />

      <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
        {label}
      </span>

      <div className="flex items-baseline gap-1">
        <span
          className="text-4xl font-medium leading-none tabular-nums"
          style={{ color: accent }}
        >
          {value}
        </span>
        {suffix && (
          <span className="text-sm font-medium" style={{ color: accent, opacity: 0.6 }}>
            {suffix}
          </span>
        )}
      </div>

      {sublabel && (
        <span className="text-[11px] text-muted-foreground">{sublabel}</span>
      )}
    </div>
  );
}

// ─── Quick Action Button ──────────────────────────────────
function QuickAction({ label, onClick, accentLeft }: {
  label: string;
  onClick: () => void;
  accentLeft: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center px-5 py-3.5 bg-card text-sm font-medium text-foreground
                 border border-border hover:bg-muted/40
                 active:scale-95 transition-all duration-200 text-left w-full"
      style={{
        borderLeft: `3px solid ${accentLeft}`,
        borderRadius: "var(--radius-lg)",
      }}
    >
      {label}
    </button>
  );
}

// ─── Skeleton loader ──────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-[--radius-xl] border border-border bg-card p-5 animate-pulse">
      <div className="h-3 w-20 bg-muted rounded-full mb-4" />
      <div className="h-9 w-16 bg-muted rounded-lg" />
      <div className="h-2 w-24 bg-muted rounded-full mt-3" />
    </div>
  );
}

// ─── Task status pill ─────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    DONE:        { label: "Completato", bg: "var(--ff-teal-light)",   color: "var(--ff-teal)" },
    IN_PROGRESS: { label: "In corso",   bg: "var(--ff-violet-light)", color: "var(--ff-violet)" },
    TODO:        { label: "Da fare",    bg: "var(--ff-amber-light)",  color: "var(--ff-amber-dark)" },
  };
  const s = map[status] ?? { label: "Da fare", bg: "var(--ff-amber-light)", color: "var(--ff-amber-dark)" };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────
export function DashboardPage() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const { data: stats, isLoading: loading } = useQuery<DashboardStats>({
    queryKey: ["dashboard"],
    queryFn:  () => dashboardApi.getStats(),
    staleTime: 1000 * 60 * 2,
  });
  const userName = session?.user.name?.split(" ")[0] ?? session?.user.email ?? "";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">

        {/* ── Header ───────────────────────────────────────── */}
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
            {new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl text-foreground leading-tight">
            {getGreeting()},{" "}
            <span style={{ color: "var(--ff-violet)" }}>{userName}</span>.
          </h1>
          <p className="text-muted-foreground text-sm">
            Ecco come stanno andando le tue attività oggi.
          </p>
        </div>

        {/* ── Stat Cards ───────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard
                label="Totale"
                value={stats.stats.total}
                accent="var(--ff-violet)"
                accentLight="var(--ff-violet-light)"
                sublabel="task attivi"
              />
              <StatCard
                label="Completati"
                value={stats.stats.completed}
                accent="var(--ff-teal)"
                accentLight="var(--ff-teal-light)"
                sublabel={`su ${stats.stats.total} totali`}
              />
              <StatCard
                label="In corso"
                value={stats.stats.pending}
                accent="var(--ff-amber)"
                accentLight="var(--ff-amber-light)"
                sublabel="da completare"
              />
              <StatCard
                label="Completamento"
                value={stats.stats.completionRate}
                suffix="%"
                accent="var(--ff-violet)"
                accentLight="var(--ff-violet-light)"
                sublabel="tasso globale"
              />
            </div>

            {/* ── Progresso categorie ───────────────────────── */}
            {stats.categoryStats && stats.categoryStats.length > 0 && (
              <div className="rounded-[--radius-xl] border border-border bg-card p-6 space-y-5">
                <h2 className="text-sm font-medium text-foreground">
                  Progresso per categoria
                </h2>
                <div className="space-y-5">
                  {stats.categoryStats.map((cat) => (
                    <div key={cat.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${cat.color}18` }}
                          >
                            <CategoryIcon name={cat.icon} color={cat.color} size={14} />
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {cat.name}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {cat.completed}/{cat.total} · {cat.completionRate}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: "6px",
                          borderRadius: "9999px",
                          backgroundColor: "var(--ff-sand)",
                          width: "100%",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            borderRadius: "9999px",
                            width: `${cat.completionRate}%`,
                            backgroundColor: cat.color,
                            transition: "width 0.7s ease",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Azioni rapide + Task recenti ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Azioni rapide */}
              <div className="rounded-[--radius-xl] border border-border bg-card p-6 space-y-4">
                <h2 className="text-sm font-medium text-foreground">Azioni rapide</h2>
                <div className="grid grid-cols-1 gap-2">
                  <QuickAction
                    label="Gestisci Task"
                    onClick={() => navigate("/tasks")}
                    accentLeft="var(--ff-violet)"
                  />
                  <QuickAction
                    label="Calendario"
                    onClick={() => navigate("/calendar")}
                    accentLeft="var(--ff-amber)"
                  />
                  <QuickAction
                    label="Categorie"
                    onClick={() => navigate("/categories")}
                    accentLeft="var(--ff-teal)"
                  />
                  <QuickAction
                    label="Tag"
                    onClick={() => navigate("/tags")}
                    accentLeft="var(--ff-coral)"
                  />
                </div>
              </div>

              {/* Task recenti */}
              {stats.recentTasks.length > 0 && (
                <div className="rounded-[--radius-xl] border border-border bg-card p-6 flex flex-col">
                  <h2 className="text-sm font-medium text-foreground mb-4">Task recenti</h2>
                  <div className="flex flex-col divide-y divide-border">
                    {stats.recentTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                      >
                        <span
                          className={`text-sm leading-snug flex-1 ${
                            task.status === "DONE"
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </span>
                        <StatusPill status={task.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}

      </div>
    </div>
  );
}