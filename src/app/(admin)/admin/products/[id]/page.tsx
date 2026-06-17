"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AdminHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageLoader } from "@/components/ui/Spinner";
import { getProduct } from "@/lib/firebase/products";
import type { Product } from "@/lib/types";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProduct(id).then((p) => { setProduct(p); setLoading(false); });
  }, [id]);

  if (loading) return <PageLoader />;
  if (!product) return <p className="py-10 text-center text-muted">Product not found.</p>;

  return (
    <>
      <Link href="/admin/products" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-terracotta-600">
        <ChevronLeft size={16} /> Back to products
      </Link>
      <AdminHeader title="Edit product" description={product.name} />
      <ProductForm product={product} />
    </>
  );
}
