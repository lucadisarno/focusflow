import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useAuthStore } from "@/store/useAuthStore";

// ─── AuthSync ─────────────────────────────────────────────
// Componente invisibile — non renderizza nulla nell'UI.
// Il suo unico scopo è ascoltare la sessione BetterAuth
// e sincronizzarla con lo store Zustand.
// Va montato una volta sola vicino alla root dell'app.

export function AuthSync() {
  const { data: session, isPending } = useSession();
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    if (isPending) {
      setLoading(true);
      return;
    }

    // Sessione caricata — aggiorna lo store
    setUser(session?.user ?? null);
  }, [session, isPending]);

  return null; // non renderizza nulla
}