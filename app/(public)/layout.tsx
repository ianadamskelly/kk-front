import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ScrollToTop from "@/components/ScrollToTop";
import { CartProvider } from "@/lib/cart";
import { CustomerProvider } from "@/lib/customer";
import { fetchSettings } from "@/lib/api";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await fetchSettings();
  return (
    <CustomerProvider>
      <CartProvider>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter settings={settings} />
        <ScrollToTop />
      </CartProvider>
    </CustomerProvider>
  );
}
