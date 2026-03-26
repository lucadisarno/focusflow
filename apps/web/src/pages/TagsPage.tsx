import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, Tag as TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { ColorPicker } from "@/components/ui/color-picker";
import { getTags, createTag, updateTag, deleteTag, type Tag } from "@/api/tags";

export default function TagsPage() {
  const [tags, setTags]                       = useState<Tag[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [dialogOpen, setDialogOpen]           = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTag, setEditingTag]           = useState<Tag | null>(null);
  const [tagToDelete, setTagToDelete]         = useState<Tag | null>(null);
  const [saving, setSaving]                   = useState(false);
  const [deleting, setDeleting]               = useState(false);
  const [formName, setFormName]               = useState("");
  const [formColor, setFormColor]             = useState("#8b5cf6");

  useEffect(() => { loadTags(); }, []);

  async function loadTags() {
    try {
      setLoading(true);
      setTags(await getTags());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function openCreateDialog() {
    setEditingTag(null); setFormName(""); setFormColor("#8b5cf6");
    setDialogOpen(true);
  }

  function openEditDialog(tag: Tag) {
    setEditingTag(tag); setFormName(tag.name); setFormColor(tag.color);
    setDialogOpen(true);
  }

  function openDeleteDialog(tag: Tag) {
    setTagToDelete(tag); setDeleteDialogOpen(true);
  }

  async function handleSave() {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      if (editingTag) {
        const updated = await updateTag(editingTag.id, { name: formName, color: formColor });
        setTags((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      } else {
        const created = await createTag({ name: formName, color: formColor });
        setTags((prev) => [...prev, created]);
      }
      setDialogOpen(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!tagToDelete) return;
    setDeleting(true);
    try {
      await deleteTag(tagToDelete.id);
      setTags((prev) => prev.filter((t) => t.id !== tagToDelete.id));
      setDeleteDialogOpen(false);
    } catch (err) { console.error(err); }
    finally { setDeleting(false); }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
            Organizzazione
          </p>
          <h1 className="font-display text-3xl text-foreground">Tag</h1>
          <p className="text-sm text-muted-foreground">
            Etichetta i tuoi task con tag colorati
          </p>
        </div>

        <button
          onClick={openCreateDialog}
          className="inline-flex items-center gap-2 px-5 py-2.5
                     rounded-[--radius-pill] text-sm font-medium flex-shrink-0
                     transition-all duration-200 active:scale-95"
          style={{ backgroundColor: "var(--ff-violet)", color: "white" }}
        >
          <Plus size={15} />
          Nuovo tag
        </button>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-muted-foreground" size={24} />
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && tags.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div
            className="w-16 h-16 rounded-[--radius-xl] flex items-center justify-center mb-4"
            style={{ backgroundColor: "var(--ff-amber-light)" }}
          >
            <TagIcon size={28} style={{ color: "var(--ff-amber)" }} />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Nessun tag</p>
          <p className="text-xs text-muted-foreground mb-5">
            Crea il tuo primo tag per etichettare i task.
          </p>
          <button
            onClick={openCreateDialog}
            className="inline-flex items-center gap-2 px-4 py-2
                       rounded-[--radius-pill] text-sm font-medium border border-border
                       text-foreground hover:bg-muted transition-colors duration-200"
          >
            <Plus size={14} />
            Crea tag
          </button>
        </motion.div>
      )}

      {/* ── Griglia tag ── */}
      {!loading && tags.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <AnimatePresence>
            {tags.map((tag) => (
              <motion.div
                key={tag.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
                className="group flex items-center gap-2 px-4 py-2 rounded-full
                           transition-all duration-200 hover:-translate-y-0.5
                           hover:shadow-sm"
                style={{
                  border: `1.5px solid ${tag.color}40`,
                  backgroundColor: `${tag.color}12`,
                }}
              >
                {/* Pallino */}
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color }} />

                {/* Nome */}
                <span className="text-sm font-medium" style={{ color: tag.color }}>
                  {tag.name}
                </span>

                {/* Contatore task */}
                <span
                  className="text-[11px] font-medium px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                  }}
                >
                  {tag._count?.taskTags ?? 0}
                </span>

                {/* Azioni hover */}
                <div className="flex items-center gap-0.5 ml-0.5
                                opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <button
                    onClick={() => openEditDialog(tag)}
                    className="p-1 rounded-full hover:bg-black/10 transition-colors"
                    title="Modifica"
                  >
                    <Pencil size={11} style={{ color: tag.color }} />
                  </button>
                  <button
                    onClick={() => openDeleteDialog(tag)}
                    className="p-1 rounded-full transition-colors"
                    style={{ color: "var(--ff-coral)" }}
                    title="Elimina"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Dialog Crea/Modifica ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm rounded-[--radius-xl]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingTag ? "Modifica tag" : "Nuovo tag"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Nome</label>
              <Input
                placeholder="Es. urgente, bug, idea..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                autoFocus
                className="h-10 rounded-[--radius-lg]
                           focus-visible:ring-[--ff-violet] focus-visible:ring-2
                           focus-visible:ring-offset-0"
              />
            </div>

            <div className="flex items-end gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Colore</label>
                <ColorPicker value={formColor} onChange={setFormColor} />
              </div>

              {/* Anteprima pill */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Anteprima</label>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full w-fit"
                  style={{
                    border: `1.5px solid ${formColor}60`,
                    backgroundColor: `${formColor}12`,
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: formColor }} />
                  <span className="text-sm font-medium" style={{ color: formColor }}>
                    {formName || "tag"}
                  </span>
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
              {editingTag ? "Salva modifiche" : "Crea tag"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Elimina ── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm rounded-[--radius-xl]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Elimina tag</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sei sicuro di voler eliminare il tag{" "}
            <span className="font-medium" style={{ color: tagToDelete?.color }}>
              {tagToDelete?.name}
            </span>
            ? Verrà rimosso da tutti i task associati.
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