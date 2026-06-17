"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useSite } from "@/context/SiteContext";
import type { CategoryNode } from "@/lib/types";

// Full-width category navigation shown directly below the header.
// Categories with children reveal a cascading, multi-level flyout on hover
// (supports unlimited nesting depth).
export function CategoryBar() {
  const { tree, loading } = useSite();

  if (loading || tree.length === 0) return null;

  return (
    <div className="hidden border-b border-sand bg-white lg:block">
      {/* No overflow here — an overflow container would clip the dropdowns.
          Categories wrap to a new line if there are too many to fit. */}
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <nav className="flex flex-wrap items-center justify-center gap-x-1">
          {tree.map((cat) => (
            <TopItem key={cat.id} cat={cat} />
          ))}
        </nav>
      </div>
    </div>
  );
}

// Top-level entry in the bar: opens a dropdown of its children below it.
function TopItem({ cat }: { cat: CategoryNode }) {
  const [open, setOpen] = useState(false);
  const hasChildren = cat.children.length > 0;

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={`/c/${cat.slugPath.join("/")}`}
        className="flex items-center gap-1 whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm font-medium text-ink transition-colors hover:border-terracotta-500 hover:text-terracotta-600"
      >
        {cat.name}
        {hasChildren && <ChevronDown size={14} className="text-muted" />}
      </Link>

      {hasChildren && open && (
        <ul className="absolute left-0 top-full z-50 min-w-[15rem] rounded-2xl border border-sand bg-white py-1.5 shadow-xl">
          {cat.children.map((child) => (
            <FlyoutItem key={child.id} node={child} />
          ))}
        </ul>
      )}
    </div>
  );
}

// Recursive submenu row: if it has children, hovering opens a flyout to the
// right — repeated for every deeper level.
function FlyoutItem({ node }: { node: CategoryNode }) {
  const [open, setOpen] = useState(false);
  const hasChildren = node.children.length > 0;

  return (
    <li
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={`/c/${node.slugPath.join("/")}`}
        className="mx-1 flex items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm text-ink hover:bg-cream hover:text-terracotta-600"
      >
        <span className="whitespace-nowrap">{node.name}</span>
        {hasChildren && <ChevronRight size={14} className="shrink-0 text-muted" />}
      </Link>

      {hasChildren && open && (
        <ul className="absolute left-full top-0 z-50 -ml-1 min-w-[14rem] rounded-2xl border border-sand bg-white py-1.5 shadow-xl">
          {node.children.map((child) => (
            <FlyoutItem key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

// Compact, scrollable chip row for mobile — quick access to top categories.
// (Deep nesting is handled by the hamburger menu's expandable tree.)
export function MobileCategoryBar() {
  const { tree, loading } = useSite();
  if (loading || tree.length === 0) return null;

  return (
    <div className="no-scrollbar overflow-x-auto border-b border-sand bg-white lg:hidden">
      <div className="mx-auto flex w-max min-w-full justify-center gap-2 px-4 py-2.5">
        {tree.map((cat) => (
          <Link
            key={cat.id}
            href={`/c/${cat.slugPath.join("/")}`}
            className="shrink-0 whitespace-nowrap rounded-full border border-sand bg-cream px-3.5 py-1.5 text-sm font-medium text-ink hover:border-terracotta-300 hover:text-terracotta-600"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
