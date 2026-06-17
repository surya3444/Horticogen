"use client";

import Link from "next/link";
import Image from "next/image";
import type { CategoryNode, Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function SectionHeading({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle?: string;
  href?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-medium text-terracotta-600 hover:underline">
          View all →
        </Link>
      )}
    </div>
  );
}

export function CategoryStrip({ categories }: { categories: CategoryNode[] }) {
  if (!categories.length) return null;
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/c/${cat.slugPath.join("/")}`}
          className="group flex w-28 shrink-0 flex-col items-center gap-2 sm:w-auto"
        >
          <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-sand bg-cream transition group-hover:border-leaf-300 sm:h-auto sm:w-full sm:aspect-square sm:rounded-2xl">
            {cat.image ? (
              <Image src={cat.image} alt={cat.name} fill className="object-cover transition-transform group-hover:scale-105" />
            ) : (
              <div className="grid h-full place-items-center text-sand">🌿</div>
            )}
          </div>
          <span className="text-center text-sm font-medium text-ink">{cat.name}</span>
        </Link>
      ))}
    </div>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return <p className="py-8 text-center text-muted">No products to show yet.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
