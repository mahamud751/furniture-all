"use client";

import Link from "next/link";
import { useState } from "react";
import Shell from "@/components/Shell";
import { money, when } from "@/lib/api";
import { StatusPill, useResource } from "@/lib/ui";

type Order = {
  id: string;
  number: string;
  name: string;
  phone: string;
  city: string;
  total: number;
  status: string;
  payment: string;
  location: string;
  items: number;
  createdAt: string;
};

const filters = ["all", "received", "confirmed", "processing", "delivered", "cancelled"];

export default function OrdersPage() {
  const [status, setStatus] = useState("all");
  const { data, error, loading } = useResource<Order[]>(`/admin/orders?status=${status}`);
  return (
    <Shell title="Orders">
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {filters.map((item) => (
          <button
            key={item}
            onClick={() => setStatus(item)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${status === item ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-black/5"}`}
          >
            {item === "all" ? "All" : item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>
      {loading && <p className="text-sm text-muted">Loading orders...</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
      {data && (
        <div className="overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-line text-[11px] tracking-[0.14em] text-muted uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-3 py-3 font-semibold">Customer</th>
                  <th className="px-3 py-3 font-semibold">Delivery</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.map((order) => (
                  <tr key={order.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/orders/${order.id}`} className="font-medium underline">{order.number}</Link>
                      <p className="text-xs text-muted">{when(order.createdAt)} · {order.items} items</p>
                    </td>
                    <td className="px-3 py-3">{order.name}<p className="text-xs text-muted">{order.phone}</p></td>
                    <td className="px-3 py-3 text-muted">{order.location === "inside" ? "Inside Dhaka" : "Outside Dhaka"} · {order.payment === "digital" ? "Digital" : "Cash"}</td>
                    <td className="px-3 py-3"><StatusPill status={order.status} /></td>
                    <td className="px-4 py-3 text-right font-medium">{money(order.total)}</td>
                  </tr>
                ))}
                {data.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-muted">No orders in this view.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Shell>
  );
}
