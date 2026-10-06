import type { Metadata } from "next";
import CheckoutView from "@/components/checkout/CheckoutView";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <section className="pt-8 pb-20 lg:pt-12 lg:pb-28">
      <div className="site-container">
        <CheckoutView />
      </div>
    </section>
  );
}
