"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useSite } from "@/context/SiteContext";
import type { CategoryNode } from "@/lib/types";

// Full-width category navigation shown directly below the header.
// Horizontally scrollable so it copes with many categories; on desktop each
// item with children reveals a mega-menu on hover.
export function CategoryBar() {
  const { tree, loading } = useSite();

  if (loading || tree.length === 0) return null;

  return (
    <div className="hidden border-b border-sand bg-white lg:block">
      <div className="no-scrollbar mx-auto max-w-7xl overflow-x-auto px-4 lg:px-6">
        {/* w-max + mx-auto centers the row when it fits, and lets it scroll
            horizontally when there are too many categories. */}
        <nav className="mx-auto flex w-max items-center justify-center gap-1">
          {tree.map((cat) => (
            <CategoryBarItem key={cat.id} cat={cat} />
          ))}
        </nav>
      </div>
    </div>
  );
}

function CategoryBarItem({ cat }: { cat: CategoryNode }) {
  const hasChildren = cat.children.length > 0;
  return (
    <div className="group relative shrink-0">
      <Link
        href={`/c/${cat.slugPath.join("/")}`}
        className="flex items-center gap-1 whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm font-medium text-ink transition-colors hover:border-terracotta-500 hover:text-terracotta-600"
      >
        {cat.name}
        {hasChildren && <ChevronDown size={14} className="text-muted" />}
      </Link>

      {hasChildren && (
        <div className="invisible absolute left-0 top-full z-50 min-w-[560px] max-w-[680px] translate-y-1 rounded-2xl border border-sand bg-white p-5 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
          <div className="grid grid-cols-3 gap-x-6 gap-y-4">
            {cat.children.map((sub) => (
              <div key={sub.id}>
                <Link
                  href={`/c/${sub.slugPath.join("/")}`}
                  className="block text-sm font-semibold text-ink hover:text-terracotta-600"
                >
                  {sub.name}
                </Link>
                {sub.children.length > 0 && (
                  <ul className="mt-2 space-y-1.5">
                    {sub.children.map((leaf) => (
                      <li key={leaf.id}>
                        <Link
                          href={`/c/${leaf.slugPath.join("/")}`}
                          className="text-sm text-muted hover:text-terracotta-600"
                        >
                          {leaf.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact, scrollable chip row for mobile — quick access to top categories
// without opening the hamburger menu.
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
