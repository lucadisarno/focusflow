import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth-client";

export function DashboardPage() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Benvenuto in FocusFlow 🎯</h1>
      <p className="text-muted-foreground">
        Loggato come: <span className="font-medium text-foreground">{session?.user.email}</span>
      </p>
      <Button variant="outline" onClick={handleSignOut}>
        Esci
      </Button>
    </div>
  );
}