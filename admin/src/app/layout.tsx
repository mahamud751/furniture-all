import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const generalSans = localFont({
  src: "./fonts/GeneralSans-Variable.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-general-sans",
});

export const metadata: Metadata = {
  title: "Furniture Admin",
  description: "Manage the ILLIYEEN furniture catalogue, orders, stores, and content.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={generalSans.variable}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
