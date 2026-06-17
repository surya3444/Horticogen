"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ChevronRight, ChevronDown, FolderPlus } from "lucide-react";
import Image from "next/image";
import { AdminHeader, Card } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { useToast } from "@/components/ui/Toast";
import {
  listCategories,
  buildTree,
  createCategory,
  updateCategory,
  deleteCategory,
  hasChildren,
} from "@/lib/firebase/categories";
import type { Category, CategoryNode } from "@/lib/types";

interface FormState {
  id?: string;
  name: string;
  parentId: string | null;
  image: string;
  description: string;
  scientificDescription: string;
  researchPaperLink: string;
}

const emptyForm: FormState = {
  name: "",
  parentId: null,
  image: "",
  description: "",
  scientificDescription: "",
  researchPaperLink: "",
};

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = async () => {
    const cats = await listCategories();
    setCategories(cats);
    setTree(buildTree(cats));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = (parentId: string | null = null) => setForm({ ...emptyForm, parentId });
  const openEdit = (c: Category) =>
    setForm({
      id: c.id,
      name: c.name,
      parentId: c.parentId,
      image: c.image || "",
      description: c.description || "",
      scientificDescription: c.scientificDescription || "",
      researchPaperLink: c.researchPaperLink || "",
    });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      if (form.id) {
        await updateCategory(form.id, {
          name: form.name,
          parentId: form.parentId,
          image: form.image,
          description: form.description,
          scientificDescription: form.scientificDescription,
          researchPaperLink: form.researchPaperLink,
        });
      } else {
        await createCategory(form);
      }
      toast("Category saved", "success");
      setForm(null);
      await load();
    } catch (err) {
      console.error(err);
      toast("Could not save category", "error");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      if (await hasChildren(deleting.id)) {
        toast("Delete or move sub-categories first.", "error");
        setDeleting(null);
        return;
      }
      await deleteCategory(deleting.id);
      toast("Category deleted", "success");
      setDeleting(null);
      await load();
    } catch {
      toast("Could not delete", "error");
    } finally {
      setDeleteBusy(false);
    }
  };

  // Options for parent select, excluding self & descendants when editing.
  const parentOptions = categories
    .filter((c) => {
      if (!form?.id) return true;
      return c.id !== form.id && !c.ancestors.includes(form.id);
    })
    .map((c) => ({ id: c.id, label: "— ".repeat(c.depth) + c.name }));

  return (
    <>
      <AdminHeader
        title="Categories"
        description="Build an unlimited category tree. Each level can have its own image, scientific notes & research link."
        action={<Button onClick={() => openNew(null)}><Plus size={16} /> Add category</Button>}
      />

      <Card>
        {loading ? (
          <p className="py-8 text-center text-muted">Loading…</p>
        ) : tree.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center text-muted">
            <FolderPlus className="h-10 w-10 text-sand" />
            <p>No categories yet. Create your first one.</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {tree.map((node) => (
              <TreeRow key={node.id} node={node} onEdit={openEdit} onAddChild={openNew} onDelete={setDeleting} />
            ))}
          </ul>
        )}
      </Card>

      {/* Form modal */}
      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? "Edit category" : "New category"} maxWidth="max-w-2xl">
        {form && (
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Select
                label="Parent category"
                value={form.parentId || ""}
                onChange={(e) => setForm({ ...form, parentId: e.target.value || null })}
              >
                <option value="">— None (top level) —</option>
                {parentOptions.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </Select>
            </div>
            <ImageUploader label="Category image" value={form.image} onChange={(url) => setForm({ ...form, image: url })} folder="categories" aspect="aspect-video" />
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Shown on the category page" />
            <Textarea label="Scientific description (optional)" value={form.scientificDescription} onChange={(e) => setForm({ ...form, scientificDescription: e.target.value })} placeholder="Botanical / scientific notes" />
            <Input label="Research paper link (optional)" value={form.researchPaperLink} onChange={(e) => setForm({ ...form, researchPaperLink: e.target.value })} placeholder="https://…" />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setForm(null)}>Cancel</Button>
              <Button type="submit" loading={saving}>Save category</Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete category"
        message={`Delete "${deleting?.name}"? This can't be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
        loading={deleteBusy}
      />
    </>
  );
}

function TreeRow({
  node,
  depth = 0,
  onEdit,
  onAddChild,
  onDelete,
}: {
  node: CategoryNode;
  depth?: number;
  onEdit: (c: Category) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (c: Category) => void;
}) {
  const [open, setOpen] = useState(true);
  const hasKids = node.children.length > 0;

  return (
    <li>
      <div
        className="group flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-cream"
        style={{ paddingLeft: depth * 20 + 8 }}
      >
        <button onClick={() => setOpen((o) => !o)} className={`text-muted ${hasKids ? "" : "invisible"}`}>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-cream">
          {node.image ? <Image src={node.image} alt="" fill className="object-cover" /> : <span className="grid h-full place-items-center text-xs">🌿</span>}
        </div>
        <span className="flex-1 text-sm font-medium">{node.name}</span>
        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          <button onClick={() => onAddChild(node.id)} title="Add sub-category" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-leaf-100 hover:text-leaf-700"><Plus size={15} /></button>
          <button onClick={() => onEdit(node)} title="Edit" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-terracotta-100 hover:text-terracotta-700"><Pencil size={15} /></button>
          <button onClick={() => onDelete(node)} title="Delete" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-red-100 hover:text-red-700"><Trash2 size={15} /></button>
        </div>
      </div>
      {hasKids && open && (
        <ul className="space-y-1">
          {node.children.map((child) => (
            <TreeRow key={child.id} node={child} depth={depth + 1} onEdit={onEdit} onAddChild={onAddChild} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </li>
  );
}
