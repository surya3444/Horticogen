"use client";

import { useEffect, useState } from "react";
import { RatingStars, RatingInput } from "@/components/ui/RatingStars";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import {
  listProductReviews,
  userReviewForProduct,
  createReview,
} from "@/lib/firebase/reviews";
import { hasPurchased } from "@/lib/firebase/orders";
import { formatDate } from "@/lib/utils";
import type { Review } from "@/lib/types";

export function ReviewSection({
  productId,
  ratingAvg,
  ratingCount,
}: {
  productId: string;
  ratingAvg: number;
  ratingCount: number;
}) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [existing, setExisting] = useState<Review | null>(null);
  const [showForm, setShowForm] = useState(false);

  // form state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const list = await listProductReviews(productId);
    setReviews(list);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    if (!user) {
      setOrderId(null);
      setExisting(null);
      return;
    }
    (async () => {
      const [purchasedOrder, mine] = await Promise.all([
        hasPurchased(user.uid, productId),
        userReviewForProduct(user.uid, productId),
      ]);
      setOrderId(purchasedOrder);
      setExisting(mine);
    })();
  }, [user, productId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !orderId) return;
    if (!comment.trim()) {
      toast("Please write a few words", "error");
      return;
    }
    setSubmitting(true);
    try {
      await createReview({
        productId,
        userId: user.uid,
        userName: profile?.name || user.displayName || "Customer",
        orderId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });
      toast("Thanks for your review!", "success");
      setShowForm(false);
      setTitle("");
      setComment("");
      await load();
      setExisting(await userReviewForProduct(user.uid, productId));
    } catch (err) {
      console.error(err);
      toast("Could not submit review", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl font-bold">Ratings & Reviews</h2>

      <div className="mt-4 flex flex-wrap items-center gap-6 rounded-2xl bg-cream p-6">
        <div className="text-center">
          <div className="font-display text-4xl font-bold text-ink">
            {ratingCount ? ratingAvg.toFixed(1) : "—"}
          </div>
          <RatingStars value={ratingAvg} className="mt-1" />
          <p className="mt-1 text-xs text-muted">{ratingCount} rating{ratingCount === 1 ? "" : "s"}</p>
        </div>
        <div className="flex-1" />
        <div>
          {!user && (
            <p className="text-sm text-muted">
              <a href="/login" className="font-medium text-terracotta-600 hover:underline">Log in</a> to write a review.
            </p>
          )}
          {user && existing && (
            <p className="text-sm text-muted">You&apos;ve already reviewed this product.</p>
          )}
          {user && !existing && orderId && (
            <Button onClick={() => setShowForm((s) => !s)}>Write a review</Button>
          )}
          {user && !existing && !orderId && (
            <p className="max-w-xs text-sm text-muted">
              Only verified buyers can review. Purchase this product to share your experience.
            </p>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mt-4 space-y-4 rounded-2xl border border-sand p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Your rating</label>
            <RatingInput value={rating} onChange={setRating} />
          </div>
          <Input label="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Loving my new plant!" />
          <Textarea label="Your review" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share how the product arrived, quality, etc." required />
          <div className="flex gap-3">
            <Button type="submit" loading={submitting}>Submit review</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-5">
        {loading ? (
          <p className="text-muted">Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p className="py-6 text-center text-muted">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="border-b border-sand pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-leaf-100 text-sm font-semibold text-leaf-700">
                    {r.userName.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{r.userName}</p>
                    <span className="text-xs text-leaf-600">✓ Verified buyer</span>
                  </div>
                </div>
                <span className="text-xs text-muted">{formatDate(r.createdAt)}</span>
              </div>
              <RatingStars value={r.rating} size={15} className="mt-2" />
              {r.title && <p className="mt-1 text-sm font-semibold">{r.title}</p>}
              <p className="mt-1 text-sm text-muted">{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
