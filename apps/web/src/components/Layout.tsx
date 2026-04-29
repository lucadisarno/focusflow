import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { SearchCommand, openSearchCommand } from "@/components/SearchCommand";
import { useSession } from "@/lib/auth-client";
import { Footer } from "@/components/Footer";
import {
  LayoutDashboard,
  CheckSquare,
  FolderOpen,
  Tags,
  CalendarDays,
  LogOut,
  Sun,
  Moon,
  Search,
} from "lucide-react";

// ─── Voci di navigazione ──────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard",  path: "/dashboard",  icon: LayoutDashboard,  accent: "var(--ff-violet)" },
  { label: "Task",       path: "/tasks",       icon: CheckSquare,      accent: "var(--ff-teal)" },
  { label: "Categorie",  path: "/categories",  icon: FolderOpen,       accent: "var(--ff-amber)" },
  { label: "Tag",        path: "/tags",        icon: Tags,             accent: "var(--ff-coral)" },
  { label: "Calendario", path: "/calendar",    icon: CalendarDays,     accent: "var(--ff-violet)" },
];

// ─── Nav Item ─────────────────────────────────────────────
function NavItem({
  label,
  path,
  icon: Icon,
  accent,
  isActive,
  onClick,
}: {
  label: string;
  path: string;
  icon: React.ElementType;
  accent: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-[--radius-lg]",
        "text-sm font-medium transition-all duration-200 text-left",
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-[--ff-sand]/60"
      )}
      style={
        isActive
          ? {
              backgroundColor: "var(--ff-violet-light)",
              color: "var(--ff-violet-dark)",
            }
          : undefined
      }
    >
      <span
        className="w-7 h-7 flex items-center justify-center rounded-md flex-shrink-0"
        style={
          isActive
            ? { backgroundColor: accent + "22", color: accent }
            : { color: "var(--color-muted-foreground)" }
        }
      >
        <Icon size={15} />
      </span>
      {label}

      {isActive && (
        <span
          className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: accent }}
        />
      )}
    </button>
  );
}

// ─── LAYOUT ───────────────────────────────────────────────
export function Layout({ children }: { children: React.ReactNode }) {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  const userName  = session?.user.name  ?? "";
  const userEmail = session?.user.email ?? "";
  const initials  = userName
    ? userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : userEmail.slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <SearchCommand />

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-60 flex-shrink-0 sticky top-0 h-screen
                   border-r border-border"
        style={{ backgroundColor: "var(--ff-warm-bg)" }}
      >
        {/* Logo */}
        <div className="px-5 h-16 flex items-center border-b border-border flex-shrink-0">
          <span className="font-display text-xl text-foreground tracking-tight select-none">
            FocusFlow
          </span>
        </div>

        {/* Navigazione */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <button
            onClick={openSearchCommand}
            className="w-full flex items-center gap-3 px-3 py-2.5 mb-3
                       rounded-[--radius-lg] border border-border bg-background/60
                       text-sm text-muted-foreground
                       hover:border-[--ff-violet-light] hover:text-foreground
                       transition-all duration-200"
          >
            <Search size={14} />
            <span className="flex-1 text-left">Cerca...</span>
            <kbd
              className="hidden sm:inline-flex items-center gap-0.5
                         px-1.5 py-0.5 rounded text-[10px] font-mono
                         border border-border bg-muted text-muted-foreground"
            >
              ⌘K
            </kbd>
          </button>

          <p className="px-3 pt-1 pb-2 text-[10px] font-medium tracking-widest
                        uppercase text-muted-foreground/60">
            Menu
          </p>

          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.path}
              {...item}
              isActive={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            />
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="px-3 py-4 border-t border-border space-y-1 flex-shrink-0">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[--radius-lg]
                       text-sm text-muted-foreground
                       hover:bg-[--ff-sand]/60 hover:text-foreground
                       transition-all duration-200"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            {theme === "dark" ? "Tema chiaro" : "Tema scuro"}
          </button>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[--radius-lg]
                       text-sm text-muted-foreground
                       hover:bg-[--ff-coral-light] hover:text-[--ff-coral]
                       transition-all duration-200"
          >
            <LogOut size={15} />
            Esci
          </button>

          <div className="flex items-center gap-3 px-3 pt-3 mt-1 border-t border-border">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center
                         text-xs font-medium flex-shrink-0"
              style={{
                backgroundColor: "var(--ff-violet-light)",
                color: "var(--ff-violet-dark)",
              }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              {userName && (
                <p className="text-xs font-medium text-foreground truncate">{userName}</p>
              )}
              <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Navbar mobile ──────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20
                      h-14 border-b border-border bg-background/90 backdrop-blur-sm
                      flex items-center justify-between px-4">
        <span className="font-display text-lg text-foreground">FocusFlow</span>
        <div className="flex items-center gap-1">
          <button
            onClick={openSearchCommand}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground
                       hover:bg-muted transition-colors"
          >
            <Search size={16} />
          </button>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground
                       hover:bg-muted transition-colors"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>

      {/* Tab bar mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20
                      border-t border-border bg-background/95 backdrop-blur-sm
                      flex items-center justify-around px-2 h-16">
        {NAV_ITEMS.map(({ label, path, icon: Icon, accent }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl
                         transition-colors duration-200"
              style={isActive ? { color: accent } : { color: "var(--color-muted-foreground)" }}
            >
              <Icon size={18} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Contenuto principale ───────────────────────────── */}
      <main className="flex-1 min-w-0 flex flex-col md:overflow-y-auto
                       pt-14 pb-20 md:pt-0 md:pb-0">
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}