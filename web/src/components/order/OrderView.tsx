"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError, api } from "@/lib/http";
import { statusLabel, type PublicOrder } from "@/lib/orders";
import { useSite } from "@/lib/site";
import { formatPrice, productHref } from "@/lib/shared";

const locationLabel = { inside: "Inside Dhaka", outside: "Outside Dhaka" };
const paymentLabel = { digital: "Digital payment", cod: "Cash on delivery" };

function when(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

export default function OrderView({ id }: { id: string }) {
  const { contact } = useSite();
  const [order, setOrder] = useState<PublicOrder | null | undefined>(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    api<PublicOrder>(`/orders/${encodeURIComponent(id)}`)
      .then((next) => {
        setOrder(next);
        setError("");
      })
      .catch((err: unknown) => {
        setOrder(null);
        setError(err instanceof ApiError && err.status !== 404 ? err.message : "");
      });
  }, [id]);

  if (order === undefined) {
    return <p className="py-24 text-center text-sm text-(--secondary)">Loading...</p>;
  }

  if (!order) {
    return (
      <div className="rounded-xl bg-white px-6 py-20 text-center">
        <h1 className="text-2xl font-medium text-(--brand) lg:text-4xl">{error ? "Order unavailable" : "Order not found"}</h1>
        <p className="mt-4 text-(--secondary)">{error || "We could not find this order."}</p>
        <Link href="/" className="mt-8 inline-flex h-12 items-center rounded-[5px] bg-(--primary) px-8 text-sm font-medium text-white">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-semibold tracking-[0.28em] text-(--secondary) uppercase">Order received</p>
      <h1 className="mt-3 text-2xl font-medium text-(--brand) lg:text-5xl">Thank you, {order.customer.firstName}.</h1>
      <p className="mt-4 text-(--secondary)">
        Order ID <span className="font-medium text-(--primary)">{order.id}</span> · {when(order.createdAt)} ·{" "}
        {statusLabel[order.status] ?? order.status}
      </p>
      <p className="mt-3 text-sm leading-6 text-(--secondary)">
        A service associate confirms furniture orders by phone. Keep this order ID ready, and pay the amount due now to
        confirm. Hotline{" "}
        <a href={contact.phoneHref} className="font-medium text-(--primary) underline">{contact.phone}</a>.
      </p>

      <section className="mt-8 rounded-xl bg-white p-5 lg:p-8">
        <h2 className="text-lg font-medium">Items</h2>
        <ul className="mt-4 space-y-4">
          {order.items.map((item) => (
            <li key={item.code} className="flex gap-4">
              <Link href={productHref(item)} className="h-20 w-16 shrink-0 overflow-hidden rounded-md bg-(--tertiary)">
                <Image src={item.image} alt="" width={96} height={120} className="h-full w-full object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={productHref(item)} className="line-clamp-2 text-sm font-medium">{item.title}</Link>
                <p className="mt-1 text-sm text-(--secondary)">Qty {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-2 border-t border-(--quaternary) pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-(--secondary)">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
          {order.discount > 0 && (
            <div className="flex justify-between"><dt className="text-(--secondary)">Digital payment discount</dt><dd>− {formatPrice(order.discount)}</dd></div>
          )}
          <div className="flex justify-between"><dt className="text-(--secondary)">Shipping</dt><dd>{formatPrice(order.shipping)}</dd></div>
          <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
          <div className="flex justify-between"><dt className="text-(--secondary)">Due now</dt><dd className="font-semibold">{formatPrice(order.advance)}</dd></div>
          {order.balance > 0 && (
            <div className="flex justify-between"><dt className="text-(--secondary)">Due on delivery</dt><dd>{formatPrice(order.balance)}</dd></div>
          )}
        </dl>
      </section>

      <section className="mt-4 rounded-xl bg-white p-5 text-sm lg:p-8">
        <h2 className="text-lg font-medium">Delivery</h2>
        <p className="mt-3">{order.customer.firstName} {order.customer.lastName}</p>
        <p className="text-(--secondary)">{order.customer.address}, {order.customer.city}</p>
        <p className="mt-2 text-(--secondary)">{order.customer.phone} · {order.customer.email}</p>
        <p className="mt-3">{locationLabel[order.location]} · {paymentLabel[order.payment]}</p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/shop" className="inline-flex h-12 items-center rounded-[5px] bg-(--primary) px-6 text-sm font-medium text-white">
          Continue shopping
        </Link>
        <Link href="/account" className="inline-flex h-12 items-center rounded-[5px] border border-(--primary) px-6 text-sm font-medium">
          My Account
        </Link>
      </div>
    </div>
  );
}
