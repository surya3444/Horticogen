"use client";

import { useEffect, useState } from "react";
import { Star, Eye, EyeOff, Trash2 } from "lucide-react";
import { AdminHeader, Card } from "@/components/admin/ui";
import { Badge } from "@/components/ui/Badge";
import { RatingStars } from "@/components/ui/RatingStars";
import { Skeleton } from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { listAllReviews, setReviewStatus, deleteReview } from "@/lib/firebase/reviews";
import { formatDate } from "@/lib/utils";
import type { Review } from "@/lib/types";

export default function AdminReviewsPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<Review | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => { setReviews(await listAllReviews()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const toggle = async (r: Review) => {
    try {
      await setReviewStatus(r.id, r.status === "published" ? "hidden" : "published");
      toast("Review updated", "success");
      await load();
    } catch { toast("Update failed", "error"); }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteReview(deleting.id);
      toast("Review deleted", "success");
      setDeleting(null);
      await load();
    } catch { toast("Could not delete", "error"); }
    finally { setBusy(false); }
  };

  return (
    <>
      <AdminHeader title="Reviews" description="Moderate customer ratings & reviews." />
      <Card>
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center text-muted">
            <Star className="h-10 w-10 text-sand" />
            <p>No reviews yet.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-xl border border-sand p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{r.userName}</span>
                      <RatingStars value={r.rating} size={14} />
                      <Badge tone={r.status === "published" ? "leaf" : "neutral"}>{r.status}</Badge>
                    </div>
                    {r.title && <p className="mt-1 text-sm font-semibold">{r.title}</p>}
                    <p className="mt-0.5 text-sm text-muted">{r.comment}</p>
                    <p className="mt-1 text-xs text-muted">{formatDate(r.createdAt)} · product {r.productId.slice(0, 6)}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => toggle(r)} title={r.status === "published" ? "Hide" : "Publish"} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-sand">
                      {r.status === "published" ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button onClick={() => setDeleting(r)} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-red-100 hover:text-red-700"><Trash2 size={16} /></button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ConfirmDialog
        open={!!deleting}
        title="Delete review"
        message="Delete this review permanently?"
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
        loading={busy}
      />
    </>
  );
}
