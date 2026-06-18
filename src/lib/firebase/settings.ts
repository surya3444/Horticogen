import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./client";
import type {
  CollectionSection,
  DeliverySettings,
  FooterSettings,
  GeneralSettings,
  HeroSettings,
  HomepageSettings,
  PaymentSettings,
  SectionType,
} from "@/lib/types";

type SettingsDoc = "hero" | "payment" | "homepage" | "general" | "footer" | "delivery";

async function read<T>(name: SettingsDoc, fallback: T): Promise<T> {
  const snap = await getDoc(doc(db, "settings", name));
  if (!snap.exists()) return fallback;
  return { ...fallback, ...(snap.data() as Partial<T>) };
}

async function write<T extends object>(name: SettingsDoc, data: T) {
  await setDoc(doc(db, "settings", name), data, { merge: true });
}

// ---- Defaults ----
export const defaultHero: HeroSettings = { slides: [] };
export const defaultPayment: PaymentSettings = {
  upiId: "",
  upiQrImage: "",
  bankName: "",
  accountName: "",
  accountNumber: "",
  ifsc: "",
  instructions:
    "Pay using the UPI ID / QR or bank transfer above, then paste your transaction reference ID below to confirm your order.",
};
// The curated starter layout — used as the default for fresh installs and by
// the admin "Load starter layout" button. `idPrefix` keeps ids unique when
// appended to an existing config.
export function starterSections(idPrefix = "s"): CollectionSection[] {
  return [
    { id: `${idPrefix}-cats`, type: "categoryStrip", title: "Shop by Category", subtitle: "Find the perfect green companion", order: 1, enabled: true },
    { id: `${idPrefix}-featured`, type: "products", source: "featured", title: "Our Favourite Picks", subtitle: "Hand-selected best-sellers", layout: "carousel", limit: 10, order: 2, enabled: true },
    {
      id: `${idPrefix}-promo`,
      type: "promo",
      title: "Grown with science, delivered with love",
      subtitle: "Every HorticoGen plant comes with research-backed care notes so your greens thrive — not just survive.",
      highlights: ["🌱 Air-purifying", "🐾 Pet-safe options", "📄 Research links"],
      order: 3,
      enabled: true,
    },
    { id: `${idPrefix}-offers`, type: "products", source: "onSale", title: "Deals & Offers", subtitle: "Limited-time discounts", layout: "carousel", limit: 10, order: 4, enabled: true },
    { id: `${idPrefix}-new`, type: "products", source: "newest", title: "New Arrivals", layout: "grid", limit: 8, order: 5, enabled: true },
  ];
}

export const defaultHomepage: HomepageSettings = { sections: starterSections() };
export const defaultGeneral: GeneralSettings = {
  siteName: "HorticoGen",
  logo: "",
  announcementBar: "Free delivery on orders above ₹699 🌱",
  contactEmail: "support@horticogen.com",
  contactPhone: "+91 90000 00000",
  social: [],
};
export const defaultDelivery: DeliverySettings = {
  freeDeliveryThreshold: 699,
  defaultCharge: 49,
  regions: [],
};
export const defaultFooter: FooterSettings = {
  columns: [
    {
      id: "shop",
      title: "Shop",
      links: [
        { label: "All Plants", url: "/c/plants" },
        { label: "Planters", url: "/c/planters" },
        { label: "Seeds", url: "/c/seeds" },
      ],
    },
    {
      id: "help",
      title: "Help",
      links: [
        { label: "Track Order", url: "/account/orders" },
        { label: "Contact Us", url: "/contact" },
      ],
    },
  ],
};

// ---- Readers ----
export const getHero = () => read("hero", defaultHero);
export const getPayment = () => read("payment", defaultPayment);
// Migrate older saved sections (e.g. type "featuredProducts") to the current
// shape so the editor and renderer never choke on legacy data.
function normalizeSection(s: CollectionSection): CollectionSection {
  const legacy = s.type as string;
  const next: CollectionSection = { ...s };
  if (legacy === "featuredProducts") {
    next.type = "products";
    next.source = next.source || "featured";
  } else if (!["products", "banner", "categoryStrip", "promo"].includes(legacy)) {
    next.type = "products";
  }
  return next;
}

export async function getHomepage(): Promise<HomepageSettings> {
  const hp = await read("homepage", defaultHomepage);
  return { sections: (hp.sections || []).map(normalizeSection) };
}
export const getGeneral = () => read("general", defaultGeneral);
export const getFooter = () => read("footer", defaultFooter);
export const getDelivery = () => read("delivery", defaultDelivery);

// ---- Writers ----
export const saveHero = (d: HeroSettings) => write("hero", d);
export const savePayment = (d: PaymentSettings) => write("payment", d);
export const saveHomepage = (d: HomepageSettings) => write("homepage", d);
export const saveGeneral = (d: GeneralSettings) => write("general", d);
export const saveFooter = (d: FooterSettings) => write("footer", d);
export const saveDelivery = (d: DeliverySettings) => write("delivery", d);
