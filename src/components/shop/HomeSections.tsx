"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSite } from "@/context/SiteContext";
import { listProducts } from "@/lib/firebase/products";
import { CategoryStrip, ProductGrid, SectionHeading } from "./sections";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/Spinner";
import type { CollectionSection, Product } from "@/lib/types";

// Resolve the product list for a "products" section based on its source.
function resolveProducts(section: CollectionSection, all: Product[]): Product[] {
  let list: Product[] = [];
  switch (section.source) {
    case "featured":
      list = all.filter((p) => p.featured);
      break;
    case "onSale":
      list = all.filter((p) =>
        p.variants.some((v) => v.compareAtPrice && v.compareAtPrice > v.price)
      );
      break;
    case "category":
      list = section.categoryId
        ? all.filter(
            (p) =>
              p.categoryId === section.categoryId ||
              p.categoryAncestors.includes(section.categoryId!)
          )
        : [];
      break;
    case "custom":
      list = (section.productIds || [])
        .map((id) => all.find((p) => p.id === id))
        .filter((p): p is Product => !!p);
      break;
    case "newest":
    default:
      list = [...all].sort((a, b) => b.createdAt - a.createdAt);
      break;
  }
  // "custom" keeps the admin's chosen order; others already sorted above.
  return list.slice(0, section.limit && section.limit > 0 ? section.limit : 8);
}

export function HomeSections() {
  const { tree } = useSite();
  const [sections, setSections] = useState<CollectionSection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ getHomepage }, all] = await Promise.all([
        import("@/lib/firebase/settings"),
        listProducts({ activeOnly: true }),
      ]);
      const hp = await getHomepage();
      setSections([...hp.sections].filter((s) => s.enabled).sort((a, b) => a.order - b.order));
      setProducts(all);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto mt-12 max-w-7xl space-y-4 px-4 lg:px-6">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} products={products} tree={tree} />
      ))}
    </>
  );
}

function SectionRenderer({
  section,
  products,
  tree,
}: {
  section: CollectionSection;
  products: Product[];
  tree: ReturnType<typeof useSite>["tree"];
}) {
  // ---- Banner ----
  if (section.type === "banner") {
    const desktop = section.desktopImage || section.image || section.mobileImage;
    const mobile = section.mobileImage || section.desktopImage || section.image;
    if (!desktop && !mobile) return null;

    const inner = (
      <div className="relative overflow-hidden rounded-3xl">
        {/* Mobile image */}
        {mobile && (
          <Image
            src={mobile}
            alt={section.title || "Banner"}
            width={800}
            height={1000}
            className="block h-auto w-full object-cover sm:hidden"
          />
        )}
        {/* Desktop image */}
        {desktop && (
          <Image
            src={desktop}
            alt={section.title || "Banner"}
            width={1600}
            height={500}
            className="hidden h-auto w-full object-cover sm:block"
          />
        )}
        {(section.title || section.ctaText) && (
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/45 to-transparent p-5 sm:justify-center sm:p-10">
            <div className="max-w-md text-white">
              {section.title && <h2 className="font-display text-2xl font-bold drop-shadow sm:text-4xl">{section.title}</h2>}
              {section.subtitle && <p className="mt-1 text-sm sm:text-base drop-shadow">{section.subtitle}</p>}
              {section.ctaText && section.ctaLink && (
                <span className="mt-3 inline-block rounded-full bg-terracotta-500 px-5 py-2 text-sm font-medium">
                  {section.ctaText}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );

    return (
      <section className="mx-auto mt-12 max-w-7xl px-4 lg:px-6">
        {section.bannerLink ? <Link href={section.bannerLink}>{inner}</Link> : inner}
      </section>
    );
  }

  // ---- Promo (styled colour block, no image) ----
  if (section.type === "promo") {
    if (!section.title && !section.subtitle) return null;
    const block = (
      <div className="grid items-center gap-6 overflow-hidden rounded-3xl bg-leaf-700 p-8 text-white md:grid-cols-2 md:p-12">
        <div>
          {section.title && <h2 className="font-display text-2xl font-bold md:text-4xl">{section.title}</h2>}
          {section.subtitle && <p className="mt-3 text-leaf-50">{section.subtitle}</p>}
          {section.ctaText && section.ctaLink && (
            <Link href={section.ctaLink} className="mt-4 inline-block rounded-full bg-white px-5 py-2 text-sm font-semibold text-leaf-700">
              {section.ctaText}
            </Link>
          )}
        </div>
        {section.highlights && section.highlights.length > 0 && (
          <div className="flex flex-wrap gap-3 md:justify-end">
            {section.highlights.map((h, i) => (
              <span key={i} className="rounded-full bg-white/15 px-4 py-2 text-sm">{h}</span>
            ))}
          </div>
        )}
      </div>
    );
    return <section className="mx-auto mt-12 max-w-7xl px-4 lg:px-6">{block}</section>;
  }

  // ---- Category strip ----
  if (section.type === "categoryStrip") {
    const cats = section.categoryId
      ? findNode(tree, section.categoryId)?.children || []
      : tree;
    if (!cats.length) return null;
    return (
      <section className="mx-auto mt-12 max-w-7xl px-4 lg:px-6">
        <SectionHeading title={section.title} subtitle={section.subtitle} />
        <CategoryStrip categories={cats} />
      </section>
    );
  }

  // ---- Products ----
  const items = resolveProducts(section, products);
  if (!items.length) return null;

  const href =
    section.ctaLink ||
    (section.source === "category" && section.categoryId
      ? `/c/${findNode(tree, section.categoryId)?.slugPath.join("/") || ""}`
      : undefined);

  return (
    <section className="mx-auto mt-12 max-w-7xl px-4 lg:px-6">
      <SectionHeading title={section.title} subtitle={section.subtitle} href={href} />
      {section.layout === "carousel" ? (
        <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-2 sm:gap-4">
          {items.map((p) => (
            <div key={p.id} className="w-[44vw] shrink-0 sm:w-56 lg:w-60">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      ) : (
        <ProductGrid products={items} />
      )}
    </section>
  );
}

function findNode(
  nodes: ReturnType<typeof useSite>["tree"],
  id: string
): ReturnType<typeof useSite>["tree"][number] | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findNode(n.children, id);
    if (found) return found;
  }
  return null;
}
