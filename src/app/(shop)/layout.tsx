import { SiteProvider } from "@/context/SiteContext";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { CartDrawer } from "@/components/shop/CartDrawer";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </SiteProvider>
  );
}
