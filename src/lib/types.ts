// Shared domain types for HorticoGen.

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  ancestors: string[]; // category ids, root -> immediate parent
  depth: number;
  image?: string;
  description?: string;
  scientificDescription?: string;
  researchPaperLink?: string;
  order: number;
  productCount?: number;
  createdAt: number;
}

// A category enriched with its computed slug path, e.g. ["indoor","ferns"].
export interface CategoryNode extends Category {
  children: CategoryNode[];
  slugPath: string[];
}

export interface Variant {
  id: string;
  name: string; // e.g. "Small / 4 inch"
  attributes: Record<string, string>; // { Size: "Small", Pot: "Plastic" }
  price: number;
  compareAtPrice?: number;
  stock: number;
  sku?: string;
}

export type ProductStatus = "active" | "draft";

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryAncestors: string[];
  description?: string;
  scientificDescription?: string;
  researchPaperLink?: string;
  images: string[];
  badges: string[]; // e.g. ["Air Purifying", "Pet Safe"]
  variants: Variant[];
  defaultVariantId?: string;
  featured: boolean;
  status: ProductStatus;
  ratingAvg: number;
  ratingCount: number;
  createdAt: number;
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault?: boolean;
}

export type UserRole = "customer" | "admin";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  addresses: Address[];
  role: UserRole;
  createdAt: number;
}

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  variantName: string;
  image: string;
  price: number;
  qty: number;
  slug: string;
}

export type PaymentMethod = "upi" | "bank";
export type PaymentStatus = "pending" | "verified" | "rejected";
export type OrderStatus =
  | "placed"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderStatusEvent {
  status: OrderStatus;
  at: number;
  note?: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  transactionId: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  statusHistory: OrderStatusEvent[];
  adminNote?: string;
  createdAt: number;
}

export type ReviewStatus = "published" | "hidden";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  orderId: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  status: ReviewStatus;
  createdAt: number;
}

// ---- Site settings singletons (collection `settings`) ----

export interface HeroSlide {
  id: string;
  desktopImage: string;
  mobileImage: string;
  heading?: string;
  subheading?: string;
  ctaText?: string;
  ctaLink?: string;
  order: number;
}

export interface HeroSettings {
  slides: HeroSlide[];
}

export interface PaymentSettings {
  upiId: string;
  upiQrImage: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  instructions: string;
}

export type SectionType = "products" | "banner" | "categoryStrip" | "promo";

// How a "products" section decides which products to show.
export type ProductSource = "featured" | "newest" | "onSale" | "category" | "custom";

export type SectionLayout = "grid" | "carousel";

export interface CollectionSection {
  id: string;
  type: SectionType;
  title: string;
  subtitle?: string;
  enabled: boolean;
  order: number;

  // ---- products ----
  source?: ProductSource;
  categoryId?: string; // for source "category" or categoryStrip parent
  productIds?: string[]; // for source "custom" (hand-picked, in order)
  limit?: number; // max items to show
  layout?: SectionLayout; // grid or horizontal carousel
  ctaText?: string;
  ctaLink?: string;

  // ---- banner ----
  desktopImage?: string;
  mobileImage?: string;
  bannerLink?: string;

  // ---- promo (styled colour block, no image) ----
  highlights?: string[]; // small pill labels, e.g. ["Air-purifying", "Pet-safe"]

  // Deprecated: kept so older saved sections still read an image.
  image?: string;
}

export interface HomepageSettings {
  sections: CollectionSection[];
}

export interface HomepageSettings {
  sections: CollectionSection[];
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface GeneralSettings {
  siteName: string;
  logo: string;
  announcementBar: string;
  contactEmail: string;
  contactPhone: string;
  social: SocialLink[];
}

export interface DeliveryRegion {
  id: string;
  region: string; // matched (case-insensitive) against the shipping address state
  charge: number;
}

export interface DeliverySettings {
  freeDeliveryThreshold: number; // 0 disables free delivery
  defaultCharge: number; // used when no region matches
  regions: DeliveryRegion[];
}

export interface FooterColumn {
  id: string;
  title: string;
  links: { label: string; url: string }[];
}

export interface FooterSettings {
  columns: FooterColumn[];
}
