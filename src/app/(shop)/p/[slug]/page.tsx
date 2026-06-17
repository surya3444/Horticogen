"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, FileText, FlaskConical, Truck, ShieldCheck, RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RatingStars } from "@/components/ui/RatingStars";
import { PageLoader } from "@/components/ui/Spinner";
import { ProductGrid } from "@/components/shop/sections";
import { ReviewSection } from "@/components/shop/ReviewSection";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ui/Toast";
import { getProductBySlug, listProductsByCategories } from "@/lib/firebase/products";
import { getCategory } from "@/lib/firebase/categories";
import { formatINR, discountPercent } from "@/lib/utils";
import type { Category, Product, Variant } from "@/lib/types";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { addItem, setDrawerOpen } = useCart();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [variant, setVariant] = useState<Variant | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const p = await getProductBySlug(slug);
      setProduct(p);
      if (p) {
        setVariant(p.variants.find((v) => v.id === p.defaultVariantId) || p.variants[0] || null);
        if (p.categoryId) setCategory(await getCategory(p.categoryId));
        const rel = await listProductsByCategories([p.categoryId]);
        setRelated(rel.filter((r) => r.id !== p.id).slice(0, 4));
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <PageLoader />;

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center lg:px-6">
        <h1 className="font-display text-2xl font-bold">Product not found</h1>
        <Link href="/" className="mt-4 inline-block text-terracotta-600 hover:underline">← Back to home</Link>
      </div>
    );
  }

  const discount = discountPercent(variant?.price || 0, variant?.compareAtPrice);
  const outOfStock = !variant || variant.stock <= 0;

  const add = (goToCheckout = false) => {
    if (!variant || outOfStock) return;
    addItem({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      variantName: variant.name,
      image: product.images[0] || "",
      price: variant.price,
      qty,
      slug: product.slug,
    });
    if (goToCheckout) {
      window.location.href = "/checkout";
    } else {
      toast("Added to cart", "success");
      setDrawerOpen(true);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted">
        <Link href="/" className="hover:text-terracotta-600">Home</Link>
        {category && (
          <span className="flex items-center gap-1">
            <ChevronRight size={14} />
            <Link href={`/c/${category.slug}`} className="hover:text-terracotta-600">{category.name}</Link>
          </span>
        )}
        <ChevronRight size={14} />
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          {product.images.length > 1 && (
            <div className="flex gap-2 sm:flex-col">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImg(i)}
                  className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 ${
                    i === activeImg ? "border-terracotta-500" : "border-sand"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="relative aspect-square flex-1 overflow-hidden rounded-2xl bg-cream">
            {product.images[activeImg] ? (
              <Image src={product.images[activeImg]} alt={product.name} fill priority className="object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-sand">No image</div>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap gap-1.5">
            {product.badges.map((b) => (
              <Badge key={b} tone="leaf">{b}</Badge>
            ))}
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink md:text-3xl">{product.name}</h1>

          {product.ratingCount > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <RatingStars value={product.ratingAvg} size={16} />
              <span className="text-sm text-muted">{product.ratingAvg.toFixed(1)} · {product.ratingCount} reviews</span>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <span className="font-display text-3xl font-bold text-ink">{formatINR(variant?.price || 0)}</span>
            {variant?.compareAtPrice ? (
              <>
                <span className="text-lg text-muted line-through">{formatINR(variant.compareAtPrice)}</span>
                <Badge tone="red">{discount}% OFF</Badge>
              </>
            ) : null}
          </div>
          <p className="text-xs text-muted">Inclusive of all taxes</p>

          {/* Variants */}
          {product.variants.length > 1 && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium">Select option</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariant(v)}
                    disabled={v.stock <= 0}
                    className={`rounded-xl border px-4 py-2 text-sm transition disabled:opacity-40 ${
                      variant?.id === v.id
                        ? "border-terracotta-500 bg-terracotta-50 font-medium text-terracotta-700"
                        : "border-sand hover:border-terracotta-300"
                    }`}
                  >
                    {v.name}
                    <span className="block text-xs text-muted">{formatINR(v.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty + actions */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-sand">
              <button className="grid h-11 w-11 place-items-center text-muted hover:text-ink" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-medium">{qty}</span>
              <button className="grid h-11 w-11 place-items-center text-muted hover:text-ink" onClick={() => setQty((q) => q + 1)}>
                <Plus size={16} />
              </button>
            </div>
            <Button onClick={() => add(false)} disabled={outOfStock} className="flex-1">
              {outOfStock ? "Out of stock" : "Add to cart"}
            </Button>
            <Button variant="secondary" onClick={() => add(true)} disabled={outOfStock} className="flex-1">
              Buy now
            </Button>
          </div>

          {variant && variant.stock > 0 && variant.stock <= 5 && (
            <p className="mt-2 text-sm text-terracotta-600">Only {variant.stock} left in stock!</p>
          )}

          {/* Trust row */}
          <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-cream p-4 text-center text-xs text-muted">
            <div className="flex flex-col items-center gap-1"><Truck size={18} className="text-leaf-600" />Safe delivery</div>
            <div className="flex flex-col items-center gap-1"><RefreshCw size={18} className="text-leaf-600" />7-day replace</div>
            <div className="flex flex-col items-center gap-1"><ShieldCheck size={18} className="text-leaf-600" />Quality checked</div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-6">
              <h3 className="font-display text-lg font-semibold">About this product</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{product.description}</p>
            </div>
          )}

          {/* Scientific + research */}
          {(product.scientificDescription || product.researchPaperLink) && (
            <div className="mt-5 space-y-2 rounded-2xl border border-leaf-200 bg-leaf-50 p-4">
              {product.scientificDescription && (
                <p className="flex gap-2 text-sm text-ink">
                  <FlaskConical size={16} className="mt-0.5 shrink-0 text-leaf-700" />
                  <span><span className="font-medium">Scientific profile:</span> {product.scientificDescription}</span>
                </p>
              )}
              {product.researchPaperLink && (
                <a href={product.researchPaperLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-terracotta-600 hover:underline">
                  <FileText size={15} /> View research paper
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <ReviewSection productId={product.id} ratingAvg={product.ratingAvg} ratingCount={product.ratingCount} />

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 font-display text-2xl font-bold">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
