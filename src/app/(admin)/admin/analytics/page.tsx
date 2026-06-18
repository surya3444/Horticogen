"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, PackageX, Search, BellRing } from "lucide-react";
import { AdminHeader, Card, StatCard } from "@/components/admin/ui";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Spinner";
import {
  listProductMetrics,
  listSearchTerms,
  listStockRequests,
  type ProductMetric,
  type SearchTerm,
  type StockRequest,
} from "@/lib/firebase/analytics";
import { listProducts } from "@/lib/firebase/products";
import { formatDateTime } from "@/lib/utils";
import type { Product } from "@/lib/types";

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<ProductMetric[]>([]);
  const [terms, setTerms] = useState<SearchTerm[]>([]);
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [m, t, r, p] = await Promise.all([
        listProductMetrics(),
        listSearchTerms(),
        listStockRequests(),
        listProducts(),
      ]);
      setMetrics(m);
      setTerms(t);
      setRequests(r);
      setProducts(p);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <>
        <AdminHeader title="Analytics" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      </>
    );
  }

  const outOfStockIds = new Set(
    products.filter((p) => p.variants.every((v) => v.stock <= 0)).map((p) => p.id)
  );
  // Demand for sold-out items: metrics for products currently out of stock,
  // ranked by interest (notify requests first, then views).
  const demand = metrics
    .filter((m) => outOfStockIds.has(m.productId))
    .sort((a, b) => (b.notifyRequests || 0) - (a.notifyRequests || 0) || b.views - a.views);
  const unmetSearches = terms.filter((t) => t.lastResultsCount === 0);

  const totalViews = metrics.reduce((n, m) => n + (m.views || 0), 0);

  return (
    <>
      <AdminHeader title="Analytics" description="Product interest, demand for sold-out items & what shoppers search for." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total product views" value={totalViews} icon={Eye} tone="terracotta" />
        <StatCard label="Out-of-stock demand" value={demand.length} icon={PackageX} tone="amber" />
        <StatCard label="Search terms" value={terms.length} icon={Search} tone="ink" />
        <StatCard label="Back-in-stock requests" value={requests.length} icon={BellRing} tone="leaf" />
      </div>

      {/* Out-of-stock demand */}
      <Card className="mt-6">
        <h2 className="mb-1 font-display text-lg font-semibold">Demand for out-of-stock products</h2>
        <p className="mb-4 text-sm text-muted">Sold-out products people are still viewing & requesting — prioritise restocking these.</p>
        {demand.length === 0 ? (
          <p className="py-6 text-center text-muted">No out-of-stock products have interest yet.</p>
        ) : (
          <MetricsTable rows={demand} highlight />
        )}
      </Card>

      {/* Most viewed */}
      <Card className="mt-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Most viewed products</h2>
        {metrics.length === 0 ? (
          <p className="py-6 text-center text-muted">No views recorded yet.</p>
        ) : (
          <MetricsTable rows={metrics.slice(0, 15)} />
        )}
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Searches */}
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold">Top searches</h2>
          {terms.length === 0 ? (
            <p className="py-6 text-center text-muted">No searches recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {terms.slice(0, 15).map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{t.term}</span>
                    {t.lastResultsCount === 0 && <Badge tone="red">no results</Badge>}
                  </span>
                  <span className="text-muted">{t.count}× · {t.lastResultsCount} results</span>
                </li>
              ))}
            </ul>
          )}
          {unmetSearches.length > 0 && (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              💡 <strong>{unmetSearches.length}</strong> search term(s) returned no products — potential products to stock: {unmetSearches.slice(0, 6).map((t) => t.term).join(", ")}.
            </p>
          )}
        </Card>

        {/* Back-in-stock requests */}
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold">Back-in-stock requests</h2>
          {requests.length === 0 ? (
            <p className="py-6 text-center text-muted">No requests yet.</p>
          ) : (
            <ul className="max-h-[420px] space-y-2 overflow-y-auto">
              {requests.map((r) => (
                <li key={r.id} className="rounded-xl border border-sand p-3 text-sm">
                  <p className="font-medium">{r.productName}</p>
                  <p className="text-muted">{r.email} · {formatDateTime(r.at)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

function MetricsTable({ rows, highlight }: { rows: ProductMetric[]; highlight?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-sand text-left text-muted">
            <th className="pb-2 font-medium">Product</th>
            <th className="pb-2 font-medium">Views</th>
            {highlight && <th className="pb-2 font-medium">Views while sold-out</th>}
            <th className="pb-2 font-medium">Notify requests</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m.id} className="border-b border-sand/60 last:border-0">
              <td className="py-2">
                <Link href={`/p/${m.slug}`} target="_blank" className="flex items-center gap-2 hover:text-terracotta-600">
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-cream">
                    {m.image && <Image src={m.image} alt="" fill className="object-cover" />}
                  </div>
                  <span className="font-medium">{m.name}</span>
                </Link>
              </td>
              <td className="py-2">{m.views || 0}</td>
              {highlight && <td className="py-2">{m.outOfStockViews || 0}</td>}
              <td className="py-2">
                {m.notifyRequests ? <Badge tone="amber">{m.notifyRequests}</Badge> : <span className="text-muted">0</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
