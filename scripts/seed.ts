/**
 * Seed script — populates Firestore with demo categories, products and site
 * settings so the storefront looks alive immediately.
 *
 * Because security rules require an admin, this signs in with an admin account
 * first. Set these in `.env.local` before running `npm run seed`:
 *
 *   SEED_ADMIN_EMAIL=admin@horticogen.com   (must be in your rules allowlist)
 *   SEED_ADMIN_PASSWORD=your-password       (register this user in the app first)
 *
 * Usage:  npm run seed
 */
import "dotenv/config";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
} from "firebase/firestore";

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(cfg);
const auth = getAuth(app);
const db = getFirestore(app);

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;

async function addCategory(data: {
  name: string;
  slug: string;
  parentId: string | null;
  ancestors: string[];
  image: string;
  description?: string;
  scientificDescription?: string;
  researchPaperLink?: string;
  order: number;
}) {
  const ref = await addDoc(collection(db, "categories"), {
    ...data,
    depth: data.ancestors.length,
    description: data.description || "",
    scientificDescription: data.scientificDescription || "",
    researchPaperLink: data.researchPaperLink || "",
    productCount: 0,
    createdAt: Date.now(),
  });
  return ref.id;
}

async function addProduct(p: {
  name: string;
  slug: string;
  categoryId: string;
  categoryAncestors: string[];
  description: string;
  scientificDescription?: string;
  researchPaperLink?: string;
  images: string[];
  badges: string[];
  variants: { name: string; price: number; compareAtPrice?: number; stock: number }[];
  featured?: boolean;
}) {
  const variants = p.variants.map((v, i) => ({
    id: `v${i + 1}`,
    name: v.name,
    attributes: { Size: v.name },
    price: v.price,
    compareAtPrice: v.compareAtPrice || 0,
    stock: v.stock,
    sku: `${p.slug}-${i + 1}`,
  }));
  await addDoc(collection(db, "products"), {
    name: p.name,
    slug: p.slug,
    categoryId: p.categoryId,
    categoryAncestors: p.categoryAncestors,
    description: p.description,
    scientificDescription: p.scientificDescription || "",
    researchPaperLink: p.researchPaperLink || "",
    images: p.images,
    badges: p.badges,
    variants,
    defaultVariantId: "v1",
    featured: p.featured || false,
    status: "active",
    ratingAvg: 0,
    ratingCount: 0,
    createdAt: Date.now(),
  });
}

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env.local (register the admin in the app first)."
    );
  }
  console.log("Signing in as", email);
  await signInWithEmailAndPassword(auth, email, password);

  console.log("Seeding categories…");
  // Root categories
  const plants = await addCategory({
    name: "Plants",
    slug: "plants",
    parentId: null,
    ancestors: [],
    image: img("photo-1485955900006-10f4d324d411"),
    description: "Healthy, hand-picked plants delivered to your door.",
    scientificDescription:
      "Live botanical specimens cultivated under controlled greenhouse conditions.",
    order: 1,
  });
  const planters = await addCategory({
    name: "Planters",
    slug: "planters",
    parentId: null,
    ancestors: [],
    image: img("photo-1485955900006-10f4d324d411"),
    description: "Pots and planters in every size and material.",
    order: 2,
  });
  const seeds = await addCategory({
    name: "Seeds",
    slug: "seeds",
    parentId: null,
    ancestors: [],
    image: img("photo-1416879595882-3373a0480b5b"),
    description: "Premium seeds for flowers, herbs and vegetables.",
    order: 3,
  });

  // Sub-categories of Plants
  const indoor = await addCategory({
    name: "Indoor Plants",
    slug: "indoor-plants",
    parentId: plants,
    ancestors: [plants],
    image: img("photo-1463320726281-696a485928c7"),
    description: "Air-purifying greens that thrive indoors.",
    scientificDescription:
      "Shade-tolerant species adapted to low-light interior environments.",
    order: 1,
  });
  const outdoor = await addCategory({
    name: "Outdoor Plants",
    slug: "outdoor-plants",
    parentId: plants,
    ancestors: [plants],
    image: img("photo-1466692476868-aef1dfb1e735"),
    description: "Hardy plants for balconies and gardens.",
    order: 2,
  });

  // Sub-sub-categories of Indoor Plants (3rd level)
  const ferns = await addCategory({
    name: "Ferns",
    slug: "ferns",
    parentId: indoor,
    ancestors: [plants, indoor],
    image: img("photo-1502331538081-041522531548"),
    description: "Lush, feathery ferns for humid corners.",
    scientificDescription:
      "Pteridophytes reproducing via spores; prefer indirect light & humidity.",
    researchPaperLink: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2756050/",
    order: 1,
  });
  const succulents = await addCategory({
    name: "Succulents",
    slug: "succulents",
    parentId: indoor,
    ancestors: [plants, indoor],
    image: img("photo-1459411552884-841db9b3cc2a"),
    description: "Low-maintenance water-storing beauties.",
    order: 2,
  });

  console.log("Seeding products…");
  await addProduct({
    name: "Boston Fern",
    slug: "boston-fern",
    categoryId: ferns,
    categoryAncestors: [plants, indoor],
    description:
      "A classic air-purifying fern with arching fronds. Loves indirect light and regular misting.",
    scientificDescription:
      "Nephrolepis exaltata — a humidity-loving epiphytic fern noted for formaldehyde removal.",
    researchPaperLink: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2756050/",
    images: [img("photo-1502331538081-041522531548"), img("photo-1463320726281-696a485928c7")],
    badges: ["Air Purifying", "Pet Safe"],
    variants: [
      { name: "Small / 4 inch", price: 349, compareAtPrice: 499, stock: 25 },
      { name: "Medium / 6 inch", price: 599, compareAtPrice: 799, stock: 12 },
    ],
    featured: true,
  });
  await addProduct({
    name: "Echeveria Succulent",
    slug: "echeveria-succulent",
    categoryId: succulents,
    categoryAncestors: [plants, indoor],
    description:
      "Rosette-shaped succulent that needs minimal watering. Perfect for desks and windowsills.",
    scientificDescription:
      "Echeveria elegans — a CAM-photosynthesis succulent storing water in fleshy leaves.",
    images: [img("photo-1459411552884-841db9b3cc2a")],
    badges: ["Low Maintenance", "Drought Tolerant"],
    variants: [
      { name: "2 inch", price: 199, stock: 40 },
      { name: "4 inch", price: 349, compareAtPrice: 449, stock: 18 },
    ],
    featured: true,
  });
  await addProduct({
    name: "Ceramic Pot — Speckled White",
    slug: "ceramic-pot-speckled-white",
    categoryId: planters,
    categoryAncestors: [],
    description: "Hand-glazed ceramic planter with a drainage hole and matching tray.",
    images: [img("photo-1485955900006-10f4d324d411")],
    badges: ["Handmade"],
    variants: [
      { name: "Small", price: 449, stock: 30 },
      { name: "Large", price: 749, compareAtPrice: 899, stock: 15 },
    ],
    featured: true,
  });
  await addProduct({
    name: "Tulsi (Holy Basil) Seeds",
    slug: "tulsi-holy-basil-seeds",
    categoryId: seeds,
    categoryAncestors: [],
    description: "Aromatic, medicinal herb seeds. High germination rate, easy to grow.",
    scientificDescription:
      "Ocimum tenuiflorum — an adaptogenic herb rich in eugenol and ursolic acid.",
    researchPaperLink: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4296439/",
    images: [img("photo-1416879595882-3373a0480b5b")],
    badges: ["Medicinal", "High Germination"],
    variants: [{ name: "Pack of 50", price: 99, stock: 100 }],
    featured: true,
  });
  await addProduct({
    name: "Marigold Plant",
    slug: "marigold-plant",
    categoryId: outdoor,
    categoryAncestors: [plants],
    description: "Bright, cheerful blooms that are great natural pest repellents.",
    scientificDescription:
      "Tagetes erecta — releases thiophenes that deter nematodes in soil.",
    images: [img("photo-1466692476868-aef1dfb1e735")],
    badges: ["Pest Repellent", "Outdoor"],
    variants: [{ name: "Medium / 6 inch", price: 249, stock: 50 }],
  });

  console.log("Seeding site settings…");
  await setDoc(doc(db, "settings", "hero"), {
    slides: [
      {
        id: "s1",
        desktopImage: img("photo-1466692476868-aef1dfb1e735"),
        mobileImage: img("photo-1463320726281-696a485928c7"),
        heading: "Bring nature home 🌿",
        subheading: "Science-backed plants, seeds & planters delivered to your door.",
        ctaText: "Shop Plants",
        ctaLink: "/c/plants",
        order: 1,
      },
      {
        id: "s2",
        desktopImage: img("photo-1485955900006-10f4d324d411"),
        mobileImage: img("photo-1459411552884-841db9b3cc2a"),
        heading: "Planters for every corner",
        subheading: "Handmade ceramic & self-watering pots.",
        ctaText: "Shop Planters",
        ctaLink: "/c/planters",
        order: 2,
      },
    ],
  });

  await setDoc(doc(db, "settings", "homepage"), {
    sections: [
      { id: "h1", type: "categoryStrip", title: "Shop by Category", order: 1, enabled: true },
      { id: "h2", type: "featuredProducts", title: "Our Favourite Picks", subtitle: "Hand-selected best-sellers", order: 2, enabled: true },
    ],
  });

  await setDoc(doc(db, "settings", "general"), {
    siteName: "HorticoGen",
    logo: "",
    announcementBar: "🌱 Free delivery on orders above ₹699  •  Easy 7-day replacement",
    contactEmail: "support@horticogen.com",
    contactPhone: "+91 90000 00000",
    social: [
      { platform: "Instagram", url: "https://instagram.com" },
      { platform: "Facebook", url: "https://facebook.com" },
    ],
  });

  await setDoc(doc(db, "settings", "delivery"), {
    freeDeliveryThreshold: 699,
    defaultCharge: 49,
    regions: [
      { id: "r1", region: "Maharashtra", charge: 39 },
      { id: "r2", region: "Karnataka", charge: 59 },
    ],
  });

  await setDoc(doc(db, "settings", "payment"), {
    upiId: "horticogen@upi",
    upiQrImage: "",
    bankName: "HDFC Bank",
    accountName: "HorticoGen Pvt Ltd",
    accountNumber: "1234567890",
    ifsc: "HDFC0001234",
    instructions:
      "Pay using the UPI ID / QR or bank transfer, then paste your transaction reference ID below to confirm your order. We verify payments within a few hours.",
  });

  await setDoc(doc(db, "settings", "footer"), {
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
          { label: "My Account", url: "/account" },
        ],
      },
    ],
  });

  console.log("\n✅ Seed complete!");
  process.exit(0);
}

main().catch((e) => {
  console.error("\n❌ Seed failed:", e.message || e);
  process.exit(1);
});
