"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import { useSite } from "@/context/SiteContext";

export default function ContactPage() {
  const { general } = useSite();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
      <h1 className="font-display text-3xl font-bold">Get in touch</h1>
      <p className="mt-2 text-muted">We&apos;d love to help you grow. Reach us anytime.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-sand bg-white p-5 text-center">
          <Mail className="mx-auto h-7 w-7 text-leaf-600" />
          <p className="mt-2 text-sm font-medium">Email</p>
          <p className="text-sm text-muted">{general.contactEmail}</p>
        </div>
        <div className="rounded-2xl border border-sand bg-white p-5 text-center">
          <Phone className="mx-auto h-7 w-7 text-leaf-600" />
          <p className="mt-2 text-sm font-medium">Phone</p>
          <p className="text-sm text-muted">{general.contactPhone}</p>
        </div>
        <div className="rounded-2xl border border-sand bg-white p-5 text-center">
          <MapPin className="mx-auto h-7 w-7 text-leaf-600" />
          <p className="mt-2 text-sm font-medium">Support</p>
          <p className="text-sm text-muted">Mon–Sat, 10am–7pm</p>
        </div>
      </div>
    </div>
  );
}
