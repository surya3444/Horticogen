"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderTree,
  Package,
  ShoppingCart,
  Star,
  Users,
  Image as ImageIcon,
  Wallet,
  Menu,
  X,
  Store,
  LogOut,
  BarChart3,
} from "lucide-react";
import { Logo } from "@/components/shop/Logo";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/appearance/hero", label: "Hero Slider", icon: ImageIcon },
  { href: "/admin/appearance/homepage", label: "Homepage", icon: LayoutDashboard },
  { href: "/admin/appearance/general", label: "Branding & Footer", icon: Store },
  { href: "/admin/settings/payment", label: "Payment & Delivery", icon: Wallet },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const isActive = (item: (typeof nav)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Logo />
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">Admin</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              isActive(item) ? "bg-terracotta-500 text-white" : "text-ink hover:bg-sand"
            )}
          >
            <item.icon size={18} /> {item.label}
          </Link>
        ))}
      </nav>
      <div className="space-y-1 border-t border-sand p-3">
        <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-sand">
          <Store size={18} /> View store
        </Link>
        <button
          onClick={async () => { await logout(); router.push("/"); }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-sand"
        >
          <LogOut size={18} /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sand bg-white lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-3 text-muted"><X size={22} /></button>
            {SidebarContent}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-sand bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setOpen(true)}><Menu size={24} /></button>
          <Logo />
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
