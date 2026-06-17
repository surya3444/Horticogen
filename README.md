# 🌿 HorticoGen — Plant E-commerce Platform

A modern e-commerce storefront + admin dashboard for selling plants, seeds, planters and garden essentials. Built with **Next.js (App Router) + TypeScript + Tailwind CSS + Firebase**. Payments are manual (UPI / bank transfer with transaction ID, verified by admin).

## Features

**Storefront**
- Responsive, kyari-inspired UI themed to the HorticoGen palette
- Hero carousel with **separate desktop & mobile images**
- Infinitely nestable categories with image, scientific description & research link
- Products with multiple variants, gallery, scientific profile & research paper link
- Search, sort, category filtering, related products
- Cart (guest + synced on login), drawer, full cart page
- Checkout with manual **UPI QR / bank transfer** + transaction ID
- Order tracking with status timeline
- Purchase-gated ratings & reviews
- Account: profile, phone, multiple addresses, order history

**Admin dashboard** (`/admin`)
- Dashboard with revenue, orders, products, customers & pending-payment alerts
- Categories: nested tree CRUD with image upload, scientific notes, research link
- Products: create/edit with multi-variant editor & image uploads
- Orders: verify/reject payments, update fulfilment status, status history, internal notes
- Reviews moderation (publish / hide / delete)
- Customers list
- Appearance CMS: hero slider, homepage sections, branding/logo/announcement/social/footer
- Payment settings: UPI ID, QR image, bank details, checkout instructions

## Getting started

### 1. Install dependencies
```bash
npm install
```

### 2. Create a Firebase project
1. Create a project at <https://console.firebase.google.com>.
2. **Upgrade to the Blaze (pay-as-you-go) plan** — required to enable Cloud Storage. The free tier covers small stores.
3. Enable **Authentication → Sign-in method → Email/Password**.
4. Create a **Firestore Database** (production mode).
5. Enable **Storage**.
6. Add a **Web app** and copy the SDK config.

### 3. Configure environment
Copy `.env.local.example` to `.env.local` and fill in your Firebase web config. Set `NEXT_PUBLIC_ADMIN_EMAILS` to your admin email(s).

### 4. Paste the security rules (you do this manually)
- **Firestore** → Rules → paste the contents of [`firestore.rules`](./firestore.rules) → Publish.
- **Storage** → Rules → paste the contents of [`storage.rules`](./storage.rules) → Publish.

> ⚠️ In **both** rules files, edit the `adminEmails` / email list so it matches your `NEXT_PUBLIC_ADMIN_EMAILS`. Admin access is enforced by these emails.

### 5. Run the app
```bash
npm run dev
```
Open <http://localhost:3000>.

### 6. Create your admin & seed demo data
1. Register an account in the app using an email from your admin allowlist.
2. Put that email + password into `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in `.env.local`.
3. Seed demo categories, products & settings:
   ```bash
   npm run seed
   ```
4. Visit `/admin` to manage the store.

## Tech notes
- All data access goes through `src/lib/firebase/*` modules.
- Admin status is enforced in the security rules (by email), and mirrored to `users/{uid}.role` for UI gating.
- No Cloud Functions / Admin SDK required — everything runs on the client SDK + rules.

## Project structure
```
src/
  app/
    (shop)/      # storefront (header/footer chrome)
    (admin)/     # admin dashboard (sidebar shell)
  components/
    ui/          # design-system primitives
    shop/        # storefront components
    admin/       # admin components
  context/       # Auth, Cart, Site providers
  lib/
    firebase/    # data-access modules
    types.ts     # domain types
scripts/seed.ts  # demo data seeder
firestore.rules  # paste into Firebase console
storage.rules    # paste into Firebase console
```
