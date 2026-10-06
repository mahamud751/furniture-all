import type { Metadata } from "next";
import StoreList from "@/components/stores/StoreList";
import { getStores } from "@/lib/catalog";

export const metadata: Metadata = { title: "Store Locations" };

export default async function StoreLocationsPage() {
  const stores = await getStores();
  return (
    <section className="pt-8 pb-20 lg:pt-12 lg:pb-28">
      <div className="site-container">
        <StoreList stores={stores} />
      </div>
    </section>
  );
}
