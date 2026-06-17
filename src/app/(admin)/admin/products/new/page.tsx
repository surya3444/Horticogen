"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AdminHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <>
      <Link href="/admin/products" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-terracotta-600">
        <ChevronLeft size={16} /> Back to products
      </Link>
      <AdminHeader title="Add product" />
      <ProductForm />
    </>
  );
}
