import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, Tag as TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ColorPicker } from "@/components/ui/color-picker";
import { getTags, createTag, updateTag, deleteTag, type Tag } from "@/api/tags";

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formColor, setFormColor] = useState("#8b5cf6");

  useEffect(() => {
    loadTags();
  }, []);

  async function loadTags() {
    try {
      setLoading(true);
      const data = await getTags();
      setTags(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingTag(null);
    setFormName("");
    setFormColor("#8b5cf6");
    setDialogOpen(true);
  }

  function openEditDialog(tag: Tag) {
    setEditingTag(tag);
    setFormName(tag.name);
    setFormColor(tag.color);
    setDialogOpen(true);
  }

  function openDeleteDialog(tag: Tag) {
    setTagToDelete(tag);
    setDeleteDialogOpen(true);
  }

  async function handleSave() {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      if (editingTag) {
        const updated = await updateTag(editingTag.id, {
          name: formName,
          color: formColor,
        });
        setTags((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      } else {
        const created = await createTag({ name: formName, color: formColor });
        setTags((prev) => [...prev, created]);
      }
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!tagToDelete) return;
    setDeleting(true);
    try {
      await deleteTag(tagToDelete.id);
      setTags((prev) => prev.filter((t) => t.id !== tagToDelete.id));
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
          <h1 className="text-2xl font-bold">Tag</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Etichetta i tuoi task con tag colorati
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus size={16} />
          Nuovo tag
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-muted-foreground" size={28} />
        </div>
      )}

      {/* Empty state */}
      {!loading && tags.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <TagIcon size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nessun tag ancora.</p>
          <Button onClick={openCreateDialog} variant="outline" className="mt-4 gap-2">
            <Plus size={14} />
            Crea il primo tag
          </Button>
        </motion.div>
      )}

      {/* Griglia tag pill-style */}
      {!loading && tags.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <AnimatePresence>
            {tags.map((tag) => (
              <motion.div
                key={tag.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="group flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-shadow hover:shadow-md"
                style={{
                  borderColor: tag.color,
                  backgroundColor: `${tag.color}15`,
                }}
              >
                {/* Pallino colore */}
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color }}
                />

                {/* Nome */}
                <span className="text-sm font-medium" style={{ color: tag.color }}>
                  {tag.name}
                </span>

                {/* Contatore */}
                <Badge
                  variant="secondary"
                  className="text-xs px-1.5 py-0"
                  style={{ color: tag.color }}
                >
                  {tag._count?.taskTags ?? 0}
                </Badge>

                {/* Azioni — visibili solo su hover */}
                <div className="flex items-center gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditDialog(tag)}
                    className="p-0.5 rounded hover:bg-black/10 transition-colors"
                  >
                    <Pencil size={12} style={{ color: tag.color }} />
                  </button>
                  <button
                    onClick={() => openDeleteDialog(tag)}
                    className="p-0.5 rounded hover:bg-black/10 transition-colors"
                  >
                    <Trash2 size={12} className="text-destructive" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Dialog Crea/Modifica */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editingTag ? "Modifica tag" : "Nuovo tag"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nome</label>
              <Input
                placeholder="Es. urgente, bug, idea..."
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

              {/* Anteprima pill */}
              <div className="space-y-1.5 ml-2">
                <label className="text-sm font-medium">Anteprima</label>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 w-fit"
                  style={{
                    borderColor: formColor,
                    backgroundColor: `${formColor}15`,
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: formColor }}
                  />
                  <span className="text-sm font-medium" style={{ color: formColor }}>
                    {formName || "tag"}
                  </span>
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
              {editingTag ? "Salva modifiche" : "Crea tag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Elimina */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Elimina tag</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Sei sicuro di voler eliminare il tag{" "}
            <span className="font-semibold" style={{ color: tagToDelete?.color }}>
              {tagToDelete?.name}
            </span>
            ? Verrà rimosso da tutti i task associati.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annulla
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 size={14} className="animate-spin mr-2" />}
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}