import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ColorPicker } from "@/components/ui/color-picker";
import { IconPicker, ICON_OPTIONS } from "@/components/ui/icon-picker";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from "@/api/categories";

// ─── Icona categoria ──────────────────────────────────────
function CategoryIcon({ name, color, size = 18 }: { name: string; color: string; size?: number }) {
  const IconComponent = ICON_OPTIONS.find((i) => i.name === name)?.icon;
  if (!IconComponent) return null;
  return <IconComponent size={size} style={{ color }} />;
}

// ─── Card categoria ───────────────────────────────────────
function CategoryCard({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}) {
  const taskCount = category._count?.tasks ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="group flex items-center justify-between
                   px-5 py-4 rounded-[--radius-xl] border border-border bg-card
                   hover:shadow-[0_4px_20px_-8px_rgba(92,74,228,0.10)]
                   hover:-translate-y-0.5 hover:border-[--ff-violet-light]
                   transition-all duration-200"
      >
        {/* Sinistra: icona + info */}
        <div className="flex items-center gap-4">
          {/* Icona con sfondo colorato */}
          <div
            className="w-10 h-10 rounded-[--radius-lg] flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${category.color}18` }}
          >
            <CategoryIcon name={category.icon} color={category.color} size={18} />
          </div>

          <div>
            <p className="text-sm font-medium text-foreground leading-tight">
              {category.name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {taskCount} {taskCount === 1 ? "task" : "task"}
            </p>
          </div>
        </div>

        {/* Destra: dot colore + azioni */}
        <div className="flex items-center gap-3">
          {/* Dot colore + hex */}
          <div className="w-3 h-3 rounded-full flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: category.color }}
          />

          {/* Azioni */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(category)}
              className="p-1.5 rounded-lg text-muted-foreground
                         hover:text-foreground hover:bg-muted
                         transition-colors duration-150"
              title="Modifica"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(category)}
              className="p-1.5 rounded-lg text-muted-foreground
                         hover:text-[--ff-coral] hover:bg-[--ff-coral-light]
                         transition-colors duration-150"
              title="Elimina"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── CATEGORIES PAGE ──────────────────────────────────────
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formName, setFormName] = useState("");
  const [formColor, setFormColor] = useState("#6366f1");
  const [formIcon, setFormIcon] = useState("folder");

  useEffect(() => { loadCategories(); }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingCategory(null);
    setFormName("");
    setFormColor("#6366f1");
    setFormIcon("folder");
    setDialogOpen(true);
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category);
    setFormName(category.name);
    setFormColor(category.color);
    setFormIcon(category.icon);
    setDialogOpen(true);
  }

  function openDeleteDialog(category: Category) {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  }

  async function handleSave() {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      if (editingCategory) {
        const updated = await updateCategory(editingCategory.id, {
          name: formName, color: formColor, icon: formIcon,
        });
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await createCategory({ name: formName, color: formColor, icon: formIcon });
        setCategories((prev) => [...prev, created]);
      }
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!categoryToDelete) return;
    setDeleting(true);
    try {
      await deleteCategory(categoryToDelete.id);
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
            Organizzazione
          </p>
          <h1 className="font-display text-3xl text-foreground">Categorie</h1>
          <p className="text-sm text-muted-foreground">
            Organizza i tuoi task per progetto
          </p>
        </div>

        <button
          onClick={openCreateDialog}
          className="inline-flex items-center gap-2 px-5 py-2.5
                     rounded-[--radius-pill] text-sm font-medium
                     transition-all duration-200 active:scale-95 flex-shrink-0"
          style={{ backgroundColor: "var(--ff-violet)", color: "white" }}
        >
          <Plus size={15} />
          Nuova categoria
        </button>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-muted-foreground" size={24} />
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && categories.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div
            className="w-16 h-16 rounded-[--radius-xl] flex items-center justify-center mb-4"
            style={{ backgroundColor: "var(--ff-violet-light)" }}
          >
            <FolderOpen size={28} style={{ color: "var(--ff-violet)" }} />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            Nessuna categoria
          </p>
          <p className="text-xs text-muted-foreground mb-5">
            Crea la tua prima categoria per organizzare i task.
          </p>
          <button
            onClick={openCreateDialog}
            className="inline-flex items-center gap-2 px-4 py-2
                       rounded-[--radius-pill] text-sm font-medium border border-border
                       text-foreground hover:bg-muted transition-colors duration-200"
          >
            <Plus size={14} />
            Crea categoria
          </button>
        </motion.div>
      )}

      {/* ── Lista ── */}
      <div className="space-y-2">
        <AnimatePresence>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* ── Dialog Crea/Modifica ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[--radius-xl]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingCategory ? "Modifica categoria" : "Nuova categoria"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Nome */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Nome</label>
              <Input
                placeholder="Es. Lavoro, Personale, Studio..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                autoFocus
                className="h-10 rounded-[--radius-lg]
                           focus-visible:ring-[--ff-violet] focus-visible:ring-2
                           focus-visible:ring-offset-0"
              />
            </div>

            {/* Colore + Icona + Anteprima */}
            <div className="flex items-end gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Colore</label>
                <ColorPicker value={formColor} onChange={setFormColor} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Icona</label>
                <IconPicker value={formIcon} onChange={setFormIcon} color={formColor} />
              </div>

              {/* Anteprima */}
              <div className="space-y-1.5 ml-auto">
                <label className="text-sm font-medium text-foreground">Anteprima</label>
                <div
                  className="w-10 h-10 rounded-[--radius-lg] flex items-center justify-center"
                  style={{ backgroundColor: `${formColor}18` }}
                >
                  <CategoryIcon name={formIcon} color={formColor} size={20} />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}
              className="rounded-[--radius-pill]">
              Annulla
            </Button>
            <button
              onClick={handleSave}
              disabled={saving || !formName.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-[--radius-pill]
                         text-sm font-medium transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--ff-violet)", color: "white" }}
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              {editingCategory ? "Salva modifiche" : "Crea categoria"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Elimina ── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm rounded-[--radius-xl]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Elimina categoria
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sei sicuro di voler eliminare{" "}
            <span className="font-medium text-foreground">
              {categoryToDelete?.name}
            </span>
            ? I task associati non verranno eliminati.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}
              className="rounded-[--radius-pill]">
              Annulla
            </Button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-[--radius-pill]
                         text-sm font-medium transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--ff-coral)", color: "white" }}
            >
              {deleting && <Loader2 size={13} className="animate-spin" />}
              Elimina
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}