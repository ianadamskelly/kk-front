import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ScrollToTop from "@/components/ScrollToTop";
import { CartProvider } from "@/lib/cart";
import { CustomerProvider } from "@/lib/customer";
import { fetchSettings, fetchServices } from "@/lib/api";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch settings + services in parallel for the footer + header.
  const [settings, services] = await Promise.all([
    fetchSettings(),
    fetchServices(),
  ]);
  return (
    <CustomerProvider>
      <CartProvider>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter settings={settings} services={services} />
        <ScrollToTop />
      </CartProvider>
    </CustomerProvider>
  );
}
