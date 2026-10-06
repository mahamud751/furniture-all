"use client";

import Link from "next/link";
import Shell from "@/components/Shell";
import { money, when } from "@/lib/api";
import { StatusPill, useResource } from "@/lib/ui";

type Dashboard = {
  products: number;
  rooms: number;
  stores: number;
  pages: number;
  customers: number;
  orders: number;
  unreadMessages: number;
  revenue: number;
  byStatus: Record<string, number>;
  recentOrders: {
    id: string;
    number: string;
    name: string;
    phone: string;
    total: number;
    status: string;
    items: number;
    createdAt: string;
  }[];
};

const cards = [
  ["Products", "products", "/products"],
  ["Orders", "orders", "/orders"],
  ["Customers", "customers", "/customers"],
  ["Messages", "unreadMessages", "/messages"],
] as const;

export default function DashboardPage() {
  const { data, error, loading } = useResource<Dashboard>("/admin/dashboard");

  return (
    <Shell title="Dashboard">
      {loading && <p className="text-sm text-muted">Loading the desk...</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
      {data && (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(([label, key, href]) => (
              <Link key={key} href={href} className="rounded-xl bg-white p-5 ring-1 ring-black/5">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">{label}</p>
                <p className="mt-3 text-3xl font-medium tracking-tight">{data[key]}</p>
                {key === "unreadMessages" && <p className="mt-1 text-xs text-muted">Unread</p>}
              </Link>
            ))}
          </section>
          <section className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="rounded-xl bg-white p-5 ring-1 ring-black/5">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">Revenue</p>
              <p className="mt-3 text-2xl font-medium">{money(data.revenue)}</p>
              <p className="mt-1 text-xs text-muted">Open and completed orders. Cancelled orders are left out.</p>
              <ul className="mt-5 space-y-2 text-sm">
                {Object.entries(data.byStatus).map(([status, count]) => (
                  <li key={status} className="flex items-center justify-between">
                    <StatusPill status={status} />
                    <span className="font-medium">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="font-medium">Recent orders</h2>
                <Link href="/orders" className="text-sm underline">
                  All orders
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-y border-line text-[11px] tracking-[0.14em] text-muted uppercase">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Order</th>
                      <th className="px-3 py-3 font-semibold">Customer</th>
                      <th className="px-3 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-line last:border-0">
                        <td className="px-5 py-3">
                          <Link href={`/orders/${order.id}`} className="font-medium underline">
                            {order.number}
                          </Link>
                          <p className="text-xs text-muted">{when(order.createdAt)}</p>
                        </td>
                        <td className="px-3 py-3">
                          {order.name}
                          <p className="text-xs text-muted">{order.phone}</p>
                        </td>
                        <td className="px-3 py-3">
                          <StatusPill status={order.status} />
                        </td>
                        <td className="px-5 py-3 text-right font-medium">{money(order.total)}</td>
                      </tr>
                    ))}
                    {data.recentOrders.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-10 text-center text-muted">
                          No orders yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          <p className="text-sm text-muted">
            {data.rooms} rooms · {data.stores} stores · {data.pages} pages
          </p>
        </div>
      )}
    </Shell>
  );
}
