"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { MultiImageUploader } from "@/components/ui/ImageUploader";
import { Card } from "@/components/admin/ui";
import { useToast } from "@/components/ui/Toast";
import { listCategories } from "@/lib/firebase/categories";
import { createProduct, updateProduct } from "@/lib/firebase/products";
import { genId } from "@/lib/utils";
import type { Category, Product, Variant } from "@/lib/types";

interface Props {
  product?: Product;
}

function blankVariant(): Variant {
  return { id: genId(), name: "", attributes: {}, price: 0, compareAtPrice: 0, stock: 0, sku: "" };
}

export function ProductForm({ product }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(product?.name || "");
  const [categoryId, setCategoryId] = useState(product?.categoryId || "");
  const [description, setDescription] = useState(product?.description || "");
  const [scientificDescription, setScientificDescription] = useState(product?.scientificDescription || "");
  const [researchPaperLink, setResearchPaperLink] = useState(product?.researchPaperLink || "");
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [badges, setBadges] = useState((product?.badges || []).join(", "));
  const [variants, setVariants] = useState<Variant[]>(() => {
    if (!product?.variants?.length) return [blankVariant()];
    const seen = new Set<string>();
    return product.variants.map((v) => {
      const id = v.id && !seen.has(v.id) ? v.id : genId();
      seen.add(id);
      return { ...v, id };
    });
  });
  const [defaultVariantId, setDefaultVariantId] = useState(product?.defaultVariantId || "");
  const [featured, setFeatured] = useState(product?.featured || false);
  const [status, setStatus] = useState<Product["status"]>(product?.status || "active");

  useEffect(() => { listCategories().then(setCategories); }, []);

  const setVariant = (id: string, patch: Partial<Variant>) =>
    setVariants((vs) => vs.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  const addVariant = () => setVariants((vs) => [...vs, blankVariant()]);
  const removeVariant = (id: string) =>
    setVariants((vs) => (vs.length > 1 ? vs.filter((v) => v.id !== id) : vs));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) { toast("Please choose a category", "error"); return; }
    if (variants.some((v) => !v.name.trim() || v.price <= 0)) {
      toast("Each variant needs a name and a price", "error");
      return;
    }
    const cat = categories.find((c) => c.id === categoryId);
    const cleanVariants: Variant[] = variants.map((v) => ({
      ...v,
      attributes: { Option: v.name },
      compareAtPrice: v.compareAtPrice || 0,
    }));
    const data = {
      name: name.trim(),
      categoryId,
      categoryAncestors: cat ? [...cat.ancestors, cat.id] : [],
      description,
      scientificDescription,
      researchPaperLink,
      images,
      badges: badges.split(",").map((b) => b.trim()).filter(Boolean),
      variants: cleanVariants,
      defaultVariantId: defaultVariantId || cleanVariants[0].id,
      featured,
      status,
    };

    setSaving(true);
    try {
      if (product) {
        await updateProduct(product.id, data);
      } else {
        await createProduct(data);
      }
      toast("Product saved", "success");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      toast("Could not save product", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card className="space-y-4">
          <Input label="Product name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Textarea label="Scientific description (optional)" value={scientificDescription} onChange={(e) => setScientificDescription(e.target.value)} placeholder="Latin name, botanical profile…" />
          <Input label="Research paper link (optional)" value={researchPaperLink} onChange={(e) => setResearchPaperLink(e.target.value)} placeholder="https://…" />
        </Card>

        <Card className="space-y-4">
          <h3 className="font-display font-semibold">Images</h3>
          <p className="-mt-2 text-sm text-muted">First image is used as the cover.</p>
          <MultiImageUploader value={images} onChange={setImages} folder="products" />
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold">Variants</h3>
            <Button type="button" size="sm" variant="outline" onClick={addVariant}><Plus size={15} /> Add variant</Button>
          </div>
          <div className="space-y-3">
            {variants.map((v) => (
              <div key={v.id} className="rounded-xl border border-sand p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="Variant name" value={v.name} onChange={(e) => setVariant(v.id, { name: e.target.value })} placeholder="e.g. Small / 4 inch" />
                  <Input label="SKU (optional)" value={v.sku || ""} onChange={(e) => setVariant(v.id, { sku: e.target.value })} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <Input label="Price (₹)" type="number" min={0} value={v.price || ""} onChange={(e) => setVariant(v.id, { price: Number(e.target.value) })} />
                  <Input label="Compare at (₹)" type="number" min={0} value={v.compareAtPrice || ""} onChange={(e) => setVariant(v.id, { compareAtPrice: Number(e.target.value) })} />
                  <Input label="Stock" type="number" min={0} value={v.stock || ""} onChange={(e) => setVariant(v.id, { stock: Number(e.target.value) })} />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="defaultVariant" checked={(defaultVariantId || variants[0].id) === v.id} onChange={() => setDefaultVariantId(v.id)} className="accent-terracotta-500" />
                    Default variant
                  </label>
                  {variants.length > 1 && (
                    <button type="button" onClick={() => removeVariant(v.id)} className="inline-flex items-center gap-1 text-sm text-red-600 hover:underline">
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card className="space-y-4">
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as Product["status"])}>
            <option value="active">Active (visible)</option>
            <option value="draft">Draft (hidden)</option>
          </Select>
          <Select label="Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            <option value="">— Select —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{"— ".repeat(c.depth) + c.name}</option>
            ))}
          </Select>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 accent-terracotta-500" />
            Feature on homepage
          </label>
        </Card>

        <Card className="space-y-2">
          <Input label="Badges (comma separated)" value={badges} onChange={(e) => setBadges(e.target.value)} placeholder="Air Purifying, Pet Safe" />
        </Card>

        <div className="sticky bottom-4 flex gap-3">
          <Button type="submit" fullWidth size="lg" loading={saving}>{product ? "Update product" : "Create product"}</Button>
        </div>
      </div>
    </form>
  );
}
