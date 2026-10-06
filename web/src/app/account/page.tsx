import type { Metadata } from "next";
import AccountView from "@/components/account/AccountView";

export const metadata: Metadata = { title: "My Account" };

export default function AccountPage() {
  return (
    <section className="pt-10 pb-20 lg:pt-16 lg:pb-28">
      <div className="site-container">
        <AccountView />
      </div>
    </section>
  );
}
