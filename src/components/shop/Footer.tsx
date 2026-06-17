"use client";

import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { useSite } from "@/context/SiteContext";
import { Logo } from "./Logo";

export function Footer() {
  const { general, footer } = useSite();

  return (
    <footer className="mt-16 border-t border-sand bg-cream">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <div className="space-y-4">
          <Logo logo={general.logo} siteName={general.siteName} />
          <p className="text-sm text-muted">
            Science-backed plants, seeds & garden essentials — grown with care,
            delivered with love.
          </p>
          <div className="flex gap-2">
            {general.social.map((s) => (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                title={s.platform}
                className="grid h-9 w-9 place-items-center rounded-full bg-white text-sm font-semibold text-ink hover:bg-leaf-100 hover:text-leaf-700"
              >
                {s.platform.charAt(0).toUpperCase()}
              </a>
            ))}
          </div>
        </div>

        {footer.columns.map((col) => (
          <div key={col.id}>
            <h4 className="mb-3 text-sm font-semibold text-ink">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.url} className="text-sm text-muted hover:text-terracotta-600">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="mb-3 text-sm font-semibold text-ink">Get in touch</h4>
          <ul className="space-y-2 text-sm text-muted">
            {general.contactEmail && (
              <li className="flex items-center gap-2">
                <Mail size={15} /> {general.contactEmail}
              </li>
            )}
            {general.contactPhone && (
              <li className="flex items-center gap-2">
                <Phone size={15} /> {general.contactPhone}
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-sand">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-muted lg:px-6">
          © {new Date().getFullYear()} {general.siteName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
