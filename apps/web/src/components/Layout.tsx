import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutDashboard, CheckSquare, FolderOpen, Tags, CalendarDays, LogOut } from "lucide-react";

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

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
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
      </header>

      {/* Contenuto pagina */}
      <main>{children}</main>
    </div>
  );
}