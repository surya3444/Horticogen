"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Package, LogOut } from "lucide-react";
import { AuthGuard } from "@/components/Guards";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/account", label: "Profile", icon: User },
  { href: "/account/orders", label: "My Orders", icon: Package },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, logout } = useAuth();
  const router = useRouter();

  return (
    <AuthGuard>
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
        <h1 className="font-display text-2xl font-bold">My Account</h1>
        <p className="text-sm text-muted">Hi {profile?.name || "there"} 👋</p>

        <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr]">
          <aside className="h-fit rounded-2xl border border-sand bg-white p-2">
            {tabs.map((t) => {
              const active = pathname === t.href || (t.href !== "/account" && pathname.startsWith(t.href));
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium",
                    active ? "bg-terracotta-50 text-terracotta-700" : "text-ink hover:bg-sand"
                  )}
                >
                  <t.icon size={18} /> {t.label}
                </Link>
              );
            })}
            <button
              onClick={async () => {
                await logout();
                router.push("/");
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-sand"
            >
              <LogOut size={18} /> Log out
            </button>
          </aside>
          <div>{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}
