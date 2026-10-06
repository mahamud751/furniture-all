import type { Metadata } from "next";
import OrderView from "@/components/order/OrderView";

export const metadata: Metadata = { title: "Order" };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <section className="pt-8 pb-20 lg:pt-12 lg:pb-28">
      <div className="site-container">
        <OrderView id={id} />
      </div>
    </section>
  );
}
