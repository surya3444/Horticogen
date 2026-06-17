"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ChevronRight, ChevronDown } from "lucide-react";
import type { CategoryNode } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

export function MobileNav({
  open,
  onClose,
  tree,
}: {
  open: boolean;
  onClose: () => void;
  tree: CategoryNode[];
}) {
  const { user, isAdmin } = useAuth();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-sand p-4">
          <span className="font-display text-lg font-semibold">Menu</span>
          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>
        <nav className="p-2">
          {tree.map((cat) => (
            <MobileNavItem key={cat.id} cat={cat} onNavigate={onClose} />
          ))}
        </nav>
        <div className="border-t border-sand p-4 text-sm">
          <Link href={user ? "/account" : "/login"} onClick={onClose} className="block py-2 font-medium">
            {user ? "My Account" : "Login / Register"}
          </Link>
          <Link href="/account/orders" onClick={onClose} className="block py-2 text-muted">
            My Orders
          </Link>
          {isAdmin && (
            <Link href="/admin" onClick={onClose} className="block py-2 font-medium text-terracotta-600">
              Admin Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function MobileNavItem({ cat, onNavigate }: { cat: CategoryNode; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const hasChildren = cat.children.length > 0;
  return (
    <div>
      <div className="flex items-center justify-between rounded-lg hover:bg-sand">
        <Link
          href={`/c/${cat.slugPath.join("/")}`}
          onClick={onNavigate}
          className="flex-1 px-3 py-2.5 text-sm font-medium"
        >
          {cat.name}
        </Link>
        {hasChildren && (
          <button onClick={() => setOpen((o) => !o)} className="px-3 py-2.5 text-muted">
            {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        )}
      </div>
      {hasChildren && open && (
        <div className="ml-3 border-l border-sand pl-2">
          {cat.children.map((sub) => (
            <MobileNavItem key={sub.id} cat={sub} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
}
