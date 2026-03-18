import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

// Componente per renderizzare l'icona dinamicamente
function CategoryIcon({
  name,
  color,
  size = 18,
}: {
  name: string;
  color: string;
  size?: number;
}) {
  const IconComponent = ICON_OPTIONS.find((i) => i.name === name)?.icon;
  if (!IconComponent) return null;
  return <IconComponent size={size} style={{ color }} />;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formColor, setFormColor] = useState("#6366f1");
  const [formIcon, setFormIcon] = useState("folder");

  useEffect(() => {
    loadCategories();
  }, []);

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
          name: formName,
          color: formColor,
          icon: formIcon,
        });
        setCategories((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
      } else {
        const created = await createCategory({
          name: formName,
          color: formColor,
          icon: formIcon,
        });
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Categorie</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Organizza i tuoi task per progetto
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus size={16} />
          Nuova categoria
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-muted-foreground" size={28} />
        </div>
      )}

      {/* Empty state */}
      {!loading && categories.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <FolderOpen size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nessuna categoria ancora.</p>
          <Button onClick={openCreateDialog} variant="outline" className="mt-4 gap-2">
            <Plus size={14} />
            Crea la prima categoria
          </Button>
        </motion.div>
      )}

      {/* Lista categorie */}
      <AnimatePresence>
        {categories.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="mb-3"
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between py-4 px-5">
                <div className="flex items-center gap-3">
                  {/* Icona con colore */}
                  <div
                    className="... shrink-0"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <CategoryIcon
                      name={category.icon}
                      color={category.color}
                      size={20}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {category._count?.tasks ?? 0} task
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Badge colore */}
                  <Badge
                    variant="outline"
                    className="text-xs font-mono"
                    style={{ borderColor: category.color, color: category.color }}
                  >
                    {category.color}
                  </Badge>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(category)}
                  >
                    <Pencil size={15} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => openDeleteDialog(category)}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Dialog Crea/Modifica */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Modifica categoria" : "Nuova categoria"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nome</label>
              <Input
                placeholder="Es. Lavoro, Personale, Studio..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                autoFocus
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Colore</label>
                <ColorPicker value={formColor} onChange={setFormColor} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Icona</label>
                <IconPicker
                  value={formIcon}
                  onChange={setFormIcon}
                  color={formColor}
                />
              </div>

              {/* Anteprima */}
              <div className="space-y-1.5 ml-auto">
                <label className="text-sm font-medium">Anteprima</label>
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${formColor}20` }}
                >
                  <CategoryIcon name={formIcon} color={formColor} size={20} />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleSave} disabled={saving || !formName.trim()}>
              {saving && <Loader2 size={14} className="animate-spin mr-2" />}
              {editingCategory ? "Salva modifiche" : "Crea categoria"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Elimina */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Elimina categoria</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Sei sicuro di voler eliminare{" "}
            <span className="font-semibold text-foreground">
              {categoryToDelete?.name}
            </span>
            ? I task associati non verranno eliminati.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 size={14} className="animate-spin mr-2" />}
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}