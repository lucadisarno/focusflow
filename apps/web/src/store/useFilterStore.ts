import { create } from "zustand";

interface FilterState {
  status: string;
  priority: string;
  categoryId: string;
  setStatus: (status: string) => void;
  setPriority: (priority: string) => void;
  setCategoryId: (id: string) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  // ── Stato iniziale ────────────────────────────────────────
  status:     "",
  priority:   "",
  categoryId: "",

  // ── Azioni ───────────────────────────────────────────────
  // set() aggiorna solo i campi che passi — il resto rimane invariato
  setStatus:     (status)     => set({ status }),
  setPriority:   (priority)   => set({ priority }),
  setCategoryId: (categoryId) => set({ categoryId }),
  clearFilters:  ()           => set({ status: "", priority: "", categoryId: "" }),
}));