import { create } from "zustand";

// ─── Tipo utente ──────────────────────────────────────────
interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

// ─── Stato dello store ────────────────────────────────────
interface AuthState {
  user: User | null;
  isLogged: boolean;
  isLoading: boolean;

  // Azioni
  setUser:    (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout:     () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // ── Stato iniziale ────────────────────────────────────────
  user:      null,
  isLogged:  false,
  isLoading: true,  // true all'avvio — stiamo verificando la sessione

  // ── Azioni ────────────────────────────────────────────────
  setUser: (user) => set({
    user,
    isLogged:  !!user,  // true se user non è null
    isLoading: false,
  }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: () => set({
    user:      null,
    isLogged:  false,
    isLoading: false,
  }),
}));