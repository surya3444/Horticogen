"use client";

import { useSite } from "@/context/SiteContext";

// Floating WhatsApp chat button (bottom-right). Uses the contact phone set in
// Admin → Branding & Footer. Hidden if no number is configured.
export function FloatingWhatsApp() {
  const { general } = useSite();

  const digits = (general.contactPhone || "").replace(/\D/g, "");
  if (!digits) return null;

  const message = encodeURIComponent(
    `Hi ${general.siteName || "HorticoGen"}! I have a question about your products.`
  );
  const href = `https://wa.me/${digits}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg shadow-[#25D366]/30 transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
    >
      <svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor" aria-hidden="true">
        <path d="M16.04 3C9.4 3 4 8.4 4 15.04c0 2.12.55 4.18 1.6 6L4 29l8.13-1.55a12 12 0 0 0 3.9.65h.01c6.64 0 12.04-5.4 12.04-12.04C28.08 8.4 22.68 3 16.04 3Zm0 21.93h-.01a10 10 0 0 1-5.1-1.4l-.36-.22-4.83.92.96-4.7-.24-.38a9.9 9.9 0 0 1-1.52-5.3c0-5.5 4.48-9.98 10-9.98 2.67 0 5.18 1.04 7.06 2.93a9.92 9.92 0 0 1 2.92 7.06c0 5.5-4.48 9.99-9.99 9.99Zm5.48-7.48c-.3-.15-1.78-.88-2.05-.98-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.07-.13-.27-.2-.57-.35Z" />
      </svg>
      <span className="hidden text-sm font-semibold sm:inline">Chat with us</span>
    </a>
  );
}
