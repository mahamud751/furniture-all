"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/account/useSession";
import { useCart } from "@/components/cart/CartProvider";
import DeliveryNote from "@/components/DeliveryNote";
import { fieldClass, labelClass, primaryButtonClass } from "@/components/fields";
import { authToken } from "@/components/account/useSession";
import { apiSend } from "@/lib/http";
import { normalizePhone } from "@/lib/local-store";
import { quote, type PayMethod, type ShipLocation } from "@/lib/pricing";
import { useSite } from "@/lib/site";
import { formatPrice, productHref } from "@/lib/shared";

export default function CheckoutView() {
  const router = useRouter();
  const { items, subtotal, ready, clear } = useCart();
  const { profile, ready: sessionReady } = useSession();
  const { delivery, promoBanner } = useSite();
  const locations: { id: ShipLocation; label: string; note: string }[] = [
    { id: "inside", label: "Inside Dhaka", note: `${delivery.advancePercent}% advance now. Balance on delivery.` },
    { id: "outside", label: "Outside Dhaka", note: "Full payment before delivery." },
  ];
  const payments: { id: PayMethod; label: string; note: string }[] = [
    { id: "cod", label: "Cash on delivery", note: "Pay the balance when the furniture arrives, inside Dhaka." },
    {
      id: "digital",
      label: "Digital payment",
      note: `Save ${delivery.digitalPaymentDiscountPercent}% on the furniture when you pay in full.`,
    },
  ];
  const [location, setLocation] = useState<ShipLocation>("inside");
  const [payment, setPayment] = useState<PayMethod>("cod");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  });
  const [seeded, setSeeded] = useState(false);
  if (sessionReady && !seeded) {
    setSeeded(true);
    if (profile) {
      setForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        email: profile.email,
        address: profile.address ?? "",
        city: profile.city ?? "",
      });
    }
  }

  const totals = useMemo(() => quote(subtotal, location, payment, delivery), [subtotal, location, payment, delivery]);

  if (!ready || !sessionReady) {
    return <p className="py-24 text-center text-sm text-(--secondary)">Loading...</p>;
  }

  if (items.length === 0) {
    if (placing) return <p className="py-24 text-center text-sm text-(--secondary)">Loading...</p>;
    return (
      <div className="rounded-xl bg-white px-6 py-20 text-center">
        <h1 className="text-2xl font-medium text-(--brand) lg:text-4xl">Checkout</h1>
        <p className="mt-4 text-(--secondary)">Your bag is empty. Please go back to the shop.</p>
        <Link href="/shop" className="mt-8 inline-flex h-12 items-center rounded-[5px] bg-(--primary) px-8 text-sm font-medium text-white">
          Continue shopping
        </Link>
      </div>
    );
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [key]: e.target.value }));
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const customer = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: normalizePhone(form.phone),
      email: form.email.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
    };
    if (!customer.firstName || !customer.lastName || customer.phone.length < 11 || !customer.email.includes("@")) {
      setError("Enter your name, an 11-digit phone number, and a valid email.");
      return;
    }
    if (!customer.address || !customer.city) {
      setError("Enter the delivery address and city.");
      return;
    }
    if (!accepted) {
      setError("Please accept the terms to place the order.");
      return;
    }
    setError("");
    setPlacing(true);
    try {
      const order = await apiSend<{ id: string }>(
        "/orders",
        {
          items: items.map((item) => ({ code: item.code, quantity: item.quantity })),
          ...customer,
          location,
          payment,
        },
        authToken(),
      );
      clear();
      router.push(`/order/${order.id}`);
    } catch (err) {
      setPlacing(false);
      setError(err instanceof Error ? err.message : "The order could not be placed.");
    }
  };

  return (
    <>
      <h1 className="text-2xl leading-[120%] font-medium text-(--brand) lg:text-5xl">Checkout</h1>
      <div className="mt-6 rounded-lg bg-black px-4 py-3 text-center text-sm font-medium text-white lg:text-base">
        {promoBanner}
      </div>

      <form onSubmit={placeOrder} className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-8">
          <section className="rounded-xl bg-white p-5 lg:p-8">
            <h2 className="text-lg font-medium">Billing Details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelClass}>First Name</span>
                <input className={fieldClass} value={form.firstName} onChange={set("firstName")} autoComplete="given-name" />
              </label>
              <label className="block">
                <span className={labelClass}>Last Name</span>
                <input className={fieldClass} value={form.lastName} onChange={set("lastName")} autoComplete="family-name" />
              </label>
              <label className="block">
                <span className={labelClass}>Phone Number</span>
                <input className={fieldClass} value={form.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" />
              </label>
              <label className="block">
                <span className={labelClass}>Email</span>
                <input className={fieldClass} type="email" value={form.email} onChange={set("email")} autoComplete="email" />
              </label>
              <label className="block sm:col-span-2">
                <span className={labelClass}>Address</span>
                <input className={fieldClass} value={form.address} onChange={set("address")} autoComplete="street-address" />
              </label>
              <label className="block sm:col-span-2">
                <span className={labelClass}>City</span>
                <input className={fieldClass} value={form.city} onChange={set("city")} autoComplete="address-level2" />
              </label>
            </div>
          </section>

          <section className="rounded-xl bg-white p-5 lg:p-8">
            <h2 className="text-lg font-medium">Shipping location</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {locations.map((option) => (
                <label
                  key={option.id}
                  className={`cursor-pointer rounded-[5px] border p-4 ${
                    location === option.id ? "border-(--primary)" : "border-(--primary)/16"
                  }`}
                >
                  <input
                    type="radio"
                    name="location"
                    className="sr-only"
                    checked={location === option.id}
                    onChange={() => setLocation(option.id)}
                  />
                  <span className="block text-sm font-medium">{option.label}</span>
                  <span className="mt-1 block text-sm text-(--secondary)">{option.note}</span>
                </label>
              ))}
            </div>
            <DeliveryNote className="mt-4" />
          </section>

          <section className="rounded-xl bg-white p-5 lg:p-8">
            <h2 className="text-lg font-medium">Choose your payment method</h2>
            <div className="mt-4 grid gap-3">
              {payments.map((option) => (
                <label
                  key={option.id}
                  className={`cursor-pointer rounded-[5px] border p-4 ${
                    payment === option.id ? "border-(--primary)" : "border-(--primary)/16"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="sr-only"
                    checked={payment === option.id}
                    onChange={() => setPayment(option.id)}
                  />
                  <span className="block text-sm font-medium">{option.label}</span>
                  <span className="mt-1 block text-sm text-(--secondary)">{option.note}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="rounded-xl bg-white p-6 lg:sticky lg:top-6">
          <h2 className="text-lg font-medium">Order Summary</h2>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item.code} className="flex gap-3">
                <Link href={productHref(item)} className="h-16 w-13 shrink-0 overflow-hidden rounded bg-(--tertiary)">
                  <Image src={item.image} alt="" width={80} height={100} className="h-full w-full object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium">{item.title}</p>
                  <p className="text-sm text-(--secondary)">Qty {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-(--quaternary) pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-(--secondary)">Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between">
                <dt className="text-(--secondary)">Digital payment discount</dt>
                <dd>− {formatPrice(totals.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-(--secondary)">Shipping</dt>
              <dd>{formatPrice(totals.shipping)}</dd>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(totals.total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-(--secondary)">Due now</dt>
              <dd className="font-semibold">{formatPrice(totals.advance)}</dd>
            </div>
            {totals.balance > 0 && (
              <div className="flex justify-between">
                <dt className="text-(--secondary)">Due on delivery</dt>
                <dd>{formatPrice(totals.balance)}</dd>
              </div>
            )}
          </dl>
          <label className="mt-5 flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 size-4 accent-(--primary)"
            />
            <span>
              I read and accept the{" "}
              <Link href="/terms-conditions" className="underline">Terms & Conditions</Link> and{" "}
              <Link href="/payment-policy" className="underline">Payment Policy</Link>.
            </span>
          </label>
          {error && <p className="mt-3 text-sm text-(--quinary)">{error}</p>}
          <button type="submit" disabled={placing} className={`${primaryButtonClass} mt-5`}>
            {placing ? "Placing Order..." : "Place Order"}
          </button>
        </aside>
      </form>
    </>
  );
}
