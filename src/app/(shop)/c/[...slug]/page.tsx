"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, FileText, FlaskConical } from "lucide-react";
import { ProductGrid } from "@/components/shop/sections";
import { Skeleton } from "@/components/ui/Spinner";
import { Select } from "@/components/ui/Input";
import {
  getCategoryBySlugPath,
  listCategories,
  buildTree,
  descendantIds,
} from "@/lib/firebase/categories";
import { listProductsByCategories } from "@/lib/firebase/products";
import type { Category, CategoryNode, Product } from "@/lib/types";

type Sort = "newest" | "price-asc" | "price-desc" | "rating";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [trail, setTrail] = useState<Category[]>([]);
  const [subcats, setSubcats] = useState<CategoryNode[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sort, setSort] = useState<Sort>("newest");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setNotFound(false);
      const all = await listCategories();
      const result = await getCategoryBySlugPath(slug);
      if (!result) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setCategory(result.category);
      setTrail(result.trail);

      const tree = buildTree(all);
      const node = findNode(tree, result.category.id);
      setSubcats(node?.children || []);

      const ids = descendantIds(all, result.category.id);
      const prods = await listProductsByCategories(ids);
      setProducts(prods);
      setLoading(false);
    })();
  }, [slug]);

  const sorted = useMemo(() => {
    const arr = [...products];
    const price = (p: Product) =>
      (p.variants.find((v) => v.id === p.defaultVariantId) || p.variants[0])?.price || 0;
    switch (sort) {
      case "price-asc":
        return arr.sort((a, b) => price(a) - price(b));
      case "price-desc":
        return arr.sort((a, b) => price(b) - price(a));
      case "rating":
        return arr.sort((a, b) => b.ratingAvg - a.ratingAvg);
      default:
        return arr.sort((a, b) => b.createdAt - a.createdAt);
    }
  }, [products, sort]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center lg:px-6">
        <h1 className="font-display text-2xl font-bold">Category not found</h1>
        <Link href="/" className="mt-4 inline-block text-terracotta-600 hover:underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted">
        <Link href="/" className="hover:text-terracotta-600">Home</Link>
        {trail.map((c, i) => {
          const path = trail.slice(0, i + 1).map((t) => t.slug).join("/");
          return (
            <span key={c.id} className="flex items-center gap-1">
              <ChevronRight size={14} />
              <Link href={`/c/${path}`} className={i === trail.length - 1 ? "text-ink font-medium" : "hover:text-terracotta-600"}>
                {c.name}
              </Link>
            </span>
          );
        })}
      </nav>

      {/* Category header */}
      <div className="overflow-hidden rounded-2xl bg-cream">
        <div className="grid gap-0 md:grid-cols-[1fr_auto] md:items-center">
          <div className="p-6 md:p-8">
            <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">
              {category?.name}
            </h1>
            {category?.description && (
              <p className="mt-2 max-w-2xl text-sm text-muted">{category.description}</p>
            )}
            {(category?.scientificDescription || category?.researchPaperLink) && (
              <div className="mt-4 space-y-2 rounded-xl bg-white p-4">
                {category?.scientificDescription && (
                  <p className="flex gap-2 text-sm text-ink">
                    <FlaskConical size={16} className="mt-0.5 shrink-0 text-leaf-600" />
                    <span><span className="font-medium">Scientific note:</span> {category.scientificDescription}</span>
                  </p>
                )}
                {category?.researchPaperLink && (
                  <a
                    href={category.researchPaperLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-terracotta-600 hover:underline"
                  >
                    <FileText size={15} /> Read the research paper
                  </a>
                )}
              </div>
            )}
          </div>
          {category?.image && (
            <div className="relative h-40 w-full md:h-44 md:w-72">
              <Image src={category.image} alt={category.name} fill className="object-cover" />
            </div>
          )}
        </div>
      </div>

      {/* Subcategories */}
      {subcats.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {subcats.map((sub) => (
            <Link
              key={sub.id}
              href={`/c/${sub.slugPath.join("/")}`}
              className="rounded-full border border-sand bg-white px-4 py-2 text-sm font-medium hover:border-leaf-300 hover:text-leaf-700"
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted">
          {loading ? "Loading…" : `${sorted.length} product${sorted.length === 1 ? "" : "s"}`}
        </p>
        <div className="w-44">
          <Select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </Select>
        </div>
      </div>

      {/* Products */}
      <div className="mt-5">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        ) : (
          <ProductGrid products={sorted} />
        )}
      </div>
    </div>
  );
}

function findNode(nodes: CategoryNode[], id: string): CategoryNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findNode(n.children, id);
    if (found) return found;
  }
  return null;
}
