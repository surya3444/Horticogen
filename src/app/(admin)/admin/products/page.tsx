"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Package, Search } from "lucide-react";
import { AdminHeader, Card } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { listProducts, deleteProduct } from "@/lib/firebase/products";
import { formatINR } from "@/lib/utils";
import type { Product } from "@/lib/types";

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setProducts(await listProducts());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteProduct(deleting.id);
      toast("Product deleted", "success");
      setDeleting(null);
      await load();
    } catch {
      toast("Could not delete", "error");
    } finally {
      setBusy(false);
    }
  };

  const price = (p: Product) =>
    (p.variants.find((v) => v.id === p.defaultVariantId) || p.variants[0])?.price || 0;
  const stock = (p: Product) => p.variants.reduce((n, v) => n + v.stock, 0);

  return (
    <>
      <AdminHeader
        title="Products"
        description="Manage your catalogue, variants & pricing."
        action={<Link href="/admin/products/new"><Button><Plus size={16} /> Add product</Button></Link>}
      />

      <Card>
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="w-full rounded-xl border border-sand bg-cream py-2 pl-9 pr-3 text-sm focus:border-terracotta-400 focus:outline-none" />
        </div>

        {loading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center text-muted">
            <Package className="h-10 w-10 text-sand" />
            <p>No products found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sand text-left text-muted">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">Price</th>
                  <th className="pb-2 font-medium">Stock</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-sand/60 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-cream">
                          {p.images[0] && <Image src={p.images[0]} alt="" fill className="object-cover" />}
                        </div>
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-muted">{p.variants.length} variant(s){p.featured ? " · ⭐ Featured" : ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 font-medium">{formatINR(price(p))}</td>
                    <td className="py-3">
                      <span className={stock(p) <= 0 ? "text-red-600" : "text-muted"}>{stock(p)}</span>
                    </td>
                    <td className="py-3"><Badge tone={p.status === "active" ? "leaf" : "neutral"}>{p.status}</Badge></td>
                    <td className="py-3">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/products/${p.id}`} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-terracotta-100 hover:text-terracotta-700"><Pencil size={15} /></Link>
                        <button onClick={() => setDeleting(p)} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-red-100 hover:text-red-700"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!deleting}
        title="Delete product"
        message={`Delete "${deleting?.name}"? This can't be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
        loading={busy}
      />
    </>
  );
}
