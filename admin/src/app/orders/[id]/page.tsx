"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { media, money, send, when } from "@/lib/api";
import { Banner, btn, btnGhost, field, label, StatusPill, useResource } from "@/lib/ui";

type Order = {
  id: string;
  number: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  location: string;
  payment: string;
  status: string;
  note: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  advance: number;
  balance: number;
  createdAt: string;
  items: { id: string; title: string; code: string; quantity: number; price: number; image: string; slug: string }[];
};

const statuses = ["received", "confirmed", "processing", "delivered", "cancelled"];

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, error, reload } = useResource<Order>(`/admin/orders/${params.id}`);
  const [status, setStatus] = useState("received");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!data) return;
    setStatus(data.status);
    setNote(data.note);
  }, [data]);

  const save = async () => {
    setPending(true);
    setMessage("");
    try {
      await send(`/admin/orders/${params.id}`, { status, note }, "PUT");
      await reload();
      setMessage("Order updated.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not update the order.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Shell title={data ? data.number : "Order"} action={<Link href="/orders" className={btnGhost}>All orders</Link>}>
      {error && <p className="text-sm text-danger">{error}</p>}
      {data && (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-xl bg-white p-5 ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">{when(data.createdAt)}</p>
                <h2 className="mt-1 text-xl font-medium">{data.firstName} {data.lastName}</h2>
              </div>
              <StatusPill status={data.status} />
            </div>
            <ul className="mt-6 divide-y divide-line">
              {data.items.map((item) => (
                <li key={item.id} className="flex gap-3 py-3">
                  <span className="h-16 w-12 overflow-hidden rounded-md bg-[#f2f2f2]">
                    {item.image && <img src={media(item.image)} alt="" className="h-full w-full object-cover" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{item.title}</span>
                    <span className="text-xs text-muted">{item.code} · qty {item.quantity}</span>
                  </span>
                  <span className="text-sm font-medium">{money(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{money(data.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Discount</dt><dd>{money(data.discount)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{money(data.shipping)}</dd></div>
              <div className="flex justify-between font-medium"><dt>Total</dt><dd>{money(data.total)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Due now</dt><dd>{money(data.advance)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Due on delivery</dt><dd>{money(data.balance)}</dd></div>
            </dl>
          </section>
          <aside className="space-y-4">
            <section className="rounded-xl bg-white p-5 text-sm ring-1 ring-black/5">
              <h2 className="font-medium">Delivery</h2>
              <p className="mt-3">{data.address}, {data.city}</p>
              <p className="mt-2 text-muted">{data.phone}<br />{data.email}</p>
              <p className="mt-3">{data.location === "inside" ? "Inside Dhaka" : "Outside Dhaka"} · {data.payment === "digital" ? "Digital payment" : "Cash on delivery"}</p>
            </section>
            <section className="space-y-3 rounded-xl bg-white p-5 ring-1 ring-black/5">
              <label className="block">
                <span className={label}>Status</span>
                <select className={field} value={status} onChange={(e) => setStatus(e.target.value)}>
                  {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="block">
                <span className={label}>Internal note</span>
                <textarea className="min-h-24 w-full rounded-[5px] border border-line px-3 py-2 text-sm outline-none focus:border-ink" value={note} onChange={(e) => setNote(e.target.value)} />
              </label>
              <Banner>{message.startsWith("Order") ? "" : message}</Banner>
              {message.startsWith("Order") && <p className="text-sm text-[#1f7a4d]">{message}</p>}
              <button className={`${btn} w-full`} onClick={save} disabled={pending}>{pending ? "Saving..." : "Update order"}</button>
            </section>
          </aside>
        </div>
      )}
    </Shell>
  );
}
