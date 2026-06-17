import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./client";
import type {
  DeliverySettings,
  FooterSettings,
  GeneralSettings,
  HeroSettings,
  HomepageSettings,
  PaymentSettings,
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
export const defaultHomepage: HomepageSettings = { sections: [] };
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
export const getHomepage = () => read("homepage", defaultHomepage);
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
