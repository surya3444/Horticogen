"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { AdminHeader, Card } from "@/components/admin/ui";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Spinner";
import { listUsers } from "@/lib/firebase/users";
import { formatDate } from "@/lib/utils";
import type { UserProfile } from "@/lib/types";

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { listUsers().then((u) => { setUsers(u); setLoading(false); }); }, []);

  return (
    <>
      <AdminHeader title="Customers" description="Everyone who has registered on your store." />
      <Card>
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center text-muted">
            <Users className="h-10 w-10 text-sand" />
            <p>No customers yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sand text-left text-muted">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Phone</th>
                  <th className="pb-2 font-medium">Addresses</th>
                  <th className="pb-2 font-medium">Joined</th>
                  <th className="pb-2 font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.uid} className="border-b border-sand/60 last:border-0">
                    <td className="py-3 font-medium">{u.name || "—"}</td>
                    <td className="py-3 text-muted">{u.email}</td>
                    <td className="py-3 text-muted">{u.phone || "—"}</td>
                    <td className="py-3 text-muted">{u.addresses?.length || 0}</td>
                    <td className="py-3 text-muted">{formatDate(u.createdAt)}</td>
                    <td className="py-3"><Badge tone={u.role === "admin" ? "terracotta" : "neutral"}>{u.role}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
