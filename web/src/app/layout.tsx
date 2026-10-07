import type { Metadata } from "next";
import localFont from "next/font/local";
import { CartProvider } from "@/components/cart/CartProvider";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MobileBottomNav from "@/components/MobileBottomNav";
import SiteMap from "@/components/SiteMap";
import { getSite } from "@/lib/catalog";
import { SiteProvider } from "@/lib/site";
import "./globals.css";

const generalSans = localFont({
  src: "./fonts/GeneralSans-Variable.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-general-sans",
});

export const metadata: Metadata = {
  title: { default: "Basha Furniture", template: "%s | Basha Furniture" },
  description: "Shop furniture by room — bedroom, living room, dining room, office and study furniture.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const site = await getSite();
  return (
    <html lang="en" className={generalSans.variable}>
      <body className="relative antialiased">
        <SiteProvider site={site}>
          <CartProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <SiteMap />
            <MobileBottomNav />
          </CartProvider>
        </SiteProvider>
      </body>
    </html>
  );
}
