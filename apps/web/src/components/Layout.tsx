import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchCommand, openSearchCommand } from "@/components/SearchCommand";
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


const NAV_ITEMS = [
  { label: "Dashboard",  path: "/dashboard",  icon: LayoutDashboard },
  { label: "Task",       path: "/tasks",       icon: CheckSquare },
  { label: "Categorie",  path: "/categories",  icon: FolderOpen },
  { label: "Tag",        path: "/tags",        icon: Tags },
  { label: "Calendario", path: "/calendar",    icon: CalendarDays },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };


  return (
    <div className="min-h-screen bg-background">
      {/* SearchCommand — globale, ascolta Ctrl+K / Cmd+K */}
      <SearchCommand />

      {/* Navbar */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo */}
          <span className="font-bold text-lg">FocusFlow 🎯</span>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
              <Button
                key={path}
                variant="ghost"
                size="sm"
                onClick={() => navigate(path)}
                className={cn(
                  "gap-2",
                  location.pathname === path &&
                    "bg-accent text-accent-foreground"
                )}
              >
                <Icon size={15} />
                {label}
              </Button>
            ))}
          </nav>

          {/* Destra: search + toggle tema + logout */}
          <div className="flex items-center gap-1">

            {/* Search button */}
            <Button
              variant="outline"
              size="sm"
              onClick={openSearchCommand}
              className="gap-2 text-muted-foreground text-xs hidden sm:flex"
            >
              <Search size={13} />
              Cerca
              <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                ⌘K
              </kbd>
            </Button>

            {/* Toggle dark/light */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-muted-foreground"
              title={theme === "dark" ? "Passa al tema chiaro" : "Passa al tema scuro"}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </Button>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="gap-2 text-muted-foreground"
            >
              <LogOut size={15} />
              Esci
            </Button>
          </div>

        </div>
      </header>

      {/* Contenuto pagina */}
      <main>{children}</main>
    </div>
  );
}