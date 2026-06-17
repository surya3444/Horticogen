"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Check, X } from "lucide-react";
import type { Product, Variant } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ui/Toast";
import { RatingStars } from "@/components/ui/RatingStars";
import { Badge } from "@/components/ui/Badge";
import { formatINR, discountPercent, cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [picking, setPicking] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const defaultVariant =
    product.variants.find((v) => v.id === product.defaultVariantId) ||
    product.variants[0];
  const hasVariants = product.variants.length > 1;
  const allOut = product.variants.every((v) => v.stock <= 0);

  // Lowest in-stock price drives the "from" label when there are variants.
  const prices = product.variants.map((v) => v.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const discount = discountPercent(defaultVariant?.price || 0, defaultVariant?.compareAtPrice);

  const addVariant = (v: Variant) => {
    addItem({
      productId: product.id,
      variantId: v.id,
      name: product.name,
      variantName: v.name,
      image: product.images[0] || "",
      price: v.price,
      qty: 1,
      slug: product.slug,
    });
    toast("Added to cart", "success");
    setPicking(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const onAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (allOut) return;
    // Single variant → add straight away. Multiple → let the user choose.
    if (!hasVariants && defaultVariant) {
      addVariant(defaultVariant);
    } else {
      setPicking((p) => !p);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-sand bg-white transition hover:shadow-lg">
      <Link href={`/p/${product.slug}`} className="relative block aspect-square overflow-hidden bg-cream">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-sand">No image</div>
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {discount > 0 && <Badge tone="red">{discount}% OFF</Badge>}
          {product.badges.slice(0, 1).map((b) => (
            <Badge key={b} tone="leaf">
              {b}
            </Badge>
          ))}
        </div>
        {allOut && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/70 py-1 text-center text-xs font-medium text-white">
            Out of stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <Link href={`/p/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink hover:text-terracotta-600">
            {product.name}
          </h3>
        </Link>

        {product.ratingCount > 0 && (
          <div className="mt-1 flex items-center gap-1">
            <RatingStars value={product.ratingAvg} size={13} />
            <span className="text-xs text-muted">({product.ratingCount})</span>
          </div>
        )}

        <div className="mt-2 flex items-center gap-2">
          {hasVariants && <span className="text-xs text-muted">from</span>}
          <span className="font-display text-base font-semibold text-ink">
            {formatINR(hasVariants ? minPrice : defaultVariant?.price || 0)}
          </span>
          {!hasVariants && defaultVariant?.compareAtPrice ? (
            <span className="text-xs text-muted line-through">
              {formatINR(defaultVariant.compareAtPrice)}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onAddClick}
          disabled={allOut}
          className={cn(
            "mt-2.5 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
            justAdded
              ? "bg-leaf-600 text-white"
              : "bg-terracotta-500 text-white hover:bg-terracotta-600"
          )}
        >
          {justAdded ? (
            <>
              <Check size={16} /> Added
            </>
          ) : allOut ? (
            "Out of stock"
          ) : (
            <>
              <ShoppingBag size={16} /> Add to cart
            </>
          )}
        </button>
      </div>

      {/* Variant chooser — appears only after clicking "Add to cart" */}
      {picking && hasVariants && (
        <>
          <div className="absolute inset-0 z-10" onClick={() => setPicking(false)} />
          <div className="absolute inset-x-0 bottom-0 z-20 rounded-t-2xl border-t border-sand bg-white p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] animate-fade-in">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">Choose an option</span>
              <button onClick={() => setPicking(false)} className="text-muted hover:text-ink" aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="max-h-44 space-y-1.5 overflow-y-auto">
              {product.variants.map((v) => {
                const disabled = v.stock <= 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => addVariant(v)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition",
                      disabled
                        ? "cursor-not-allowed border-sand opacity-50"
                        : "border-sand hover:border-terracotta-400 hover:bg-terracotta-50"
                    )}
                  >
                    <span className="font-medium text-ink">
                      {v.name}
                      {disabled && <span className="ml-1 text-xs text-muted">(out of stock)</span>}
                    </span>
                    <span className="font-semibold text-ink">{formatINR(v.price)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
