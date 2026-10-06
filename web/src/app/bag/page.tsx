import type { Metadata } from "next";
import BagView from "@/components/bag/BagView";

export const metadata: Metadata = { title: "Shopping Bag" };

export default function BagPage() {
  return (
    <section className="pt-8 pb-20 lg:pt-12 lg:pb-28">
      <div className="site-container">
        <BagView />
      </div>
    </section>
  );
}
