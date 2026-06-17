"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, User, Menu } from "lucide-react";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { CategoryBar, MobileCategoryBar } from "./CategoryBar";
import { SearchBox } from "./SearchBox";
import { useSite } from "@/context/SiteContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const { tree, general } = useSite();
  const { count, setDrawerOpen } = useCart();
  const { user, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {general.announcementBar && (
        <div className="bg-leaf-700 text-center text-xs sm:text-sm font-medium text-white py-2 px-4">
          {general.announcementBar}
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-sand bg-white/95 backdrop-blur">
        {/* Top row: menu, logo, search, account, cart */}
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:px-6">
          <button
            className="lg:hidden text-ink"
            onClick={() => setMobileOpen(true)}
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>

          <Logo logo={general.logo} siteName={general.siteName} />

          {/* Search (desktop) with live suggestions */}
          <SearchBox className="ml-auto hidden max-w-md flex-1 md:block" />

          <div className="ml-auto flex items-center gap-1 md:ml-2">
            <Link
              href="/search"
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-sand md:hidden"
              aria-label="Search"
            >
              <Search size={20} />
            </Link>
            <Link
              href={user ? "/account" : "/login"}
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-sand"
              aria-label="Account"
            >
              <User size={20} />
            </Link>
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-sand"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-terracotta-500 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category navigation row */}
        <CategoryBar />
        <MobileCategoryBar />

        {isAdmin && (
          <div className="bg-terracotta-50 text-center text-xs text-terracotta-700 py-1">
            <Link href="/admin" className="font-medium hover:underline">
              You are an admin — open the dashboard →
            </Link>
          </div>
        )}
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} tree={tree} />
    </>
  );
}
