import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { CheckSquare, FolderOpen, Tags, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface SearchTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  category?: { name: string; color: string } | null;
}
interface SearchCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}
interface SearchTag {
  id: string;
  name: string;
  color: string;
}
interface SearchResults {
  tasks: SearchTask[];
  categories: SearchCategory[];
  tags: SearchTag[];
  total: number;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Stato globale semplice fuori dal componente ──────────
let _setOpen: ((v: boolean) => void) | null = null;
export function openSearchCommand() {
  _setOpen?.(true);
}

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Registra il setter globale
  useEffect(() => {
    _setOpen = setOpen;
    return () => { _setOpen = null; };
  }, []);

  const debouncedQuery = useDebounce(query, 300);

  // Shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults(null);
    }
  }, [open]);

  const fetchResults = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const data = await apiFetch<SearchResults>(
        `/api/search?q=${encodeURIComponent(q)}&limit=8`
      );
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults(debouncedQuery);
  }, [debouncedQuery, fetchResults]);

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const hasResults = results && results.total > 0;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Cerca task, categorie, tag..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && (
          <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground text-sm">
            <Loader2 size={14} className="animate-spin" />
            Ricerca in corso...
          </div>
        )}
        {!loading && debouncedQuery.length >= 2 && !hasResults && (
          <CommandEmpty>Nessun risultato per "{debouncedQuery}"</CommandEmpty>
        )}
        {!loading && debouncedQuery.length < 2 && (
          <CommandEmpty>Digita almeno 2 caratteri per cercare...</CommandEmpty>
        )}
        {!loading && results && results.tasks.length > 0 && (
          <CommandGroup heading="Task">
            {results.tasks.map((task) => (
              <CommandItem
                key={task.id}
                value={`task-${task.id}-${task.title}`}
                onSelect={() => handleSelect("/tasks")}
                className="gap-2"
              >
                <CheckSquare size={14} className="text-muted-foreground shrink-0" />
                <span className="flex-1 truncate">{task.title}</span>
                {task.category && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: task.category.color + "22",
                      color: task.category.color,
                    }}
                  >
                    {task.category.name}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {!loading && results && results.categories.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Categorie">
              {results.categories.map((cat) => (
                <CommandItem
                  key={cat.id}
                  value={`cat-${cat.id}-${cat.name}`}
                  onSelect={() => handleSelect("/categories")}
                  className="gap-2"
                >
                  <FolderOpen size={14} className="text-muted-foreground shrink-0" />
                  <span className="flex-1">{cat.name}</span>
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        {!loading && results && results.tags.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Tag">
              {results.tags.map((tag) => (
                <CommandItem
                  key={tag.id}
                  value={`tag-${tag.id}-${tag.name}`}
                  onSelect={() => handleSelect("/tags")}
                  className="gap-2"
                >
                  <Tags size={14} className="text-muted-foreground shrink-0" />
                  <span className="flex-1">{tag.name}</span>
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}