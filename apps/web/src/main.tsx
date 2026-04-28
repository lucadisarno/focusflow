import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
// ← AGGIUNTO: import QueryClient e QueryClientProvider
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import '@/styles/calendar.css'
import "@/index.css";
import App from "@/App";

// ← AGGIUNTO: crea il client con configurazione globale
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // dati "freschi" per 5 minuti → no refetch inutili
      retry: 1,                  // riprova 1 volta in caso di errore
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {/* ← AGGIUNTO: avvolge App con QueryClientProvider */}
      {/* Senza questo wrapper, useQuery() non funziona in nessun componente */}
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
      {/* ← FINE AGGIUNTA */}
    </ThemeProvider>
  </StrictMode>
);