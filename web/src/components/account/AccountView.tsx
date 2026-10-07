"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fieldClass, labelClass, primaryButtonClass } from "@/components/fields";
import { api } from "@/lib/http";
import { normalizePhone } from "@/lib/local-store";
import { statusLabel, type PublicOrder } from "@/lib/orders";
import { formatPrice } from "@/lib/shared";
import { authToken, useSession } from "./useSession";

function when(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

export default function AccountView() {
  const { profile, ready, signIn, register, save, exit } = useSession();
  const [orders, setOrders] = useState<PublicOrder[]>([]);
  const [editing, setEditing] = useState(false);
  const [mode, setMode] = useState<"sign-in" | "register">("sign-in");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", password: "" });

  useEffect(() => {
    if (!profile) return;
    const token = authToken();
    if (!token) return;
    api<PublicOrder[]>("/customers/me/orders", { headers: { Authorization: `Bearer ${token}` } })
      .then(setOrders)
      .catch(() => setOrders([]));
  }, [profile]);

  if (!ready) {
    return <p className="py-24 text-center text-sm text-(--secondary)">Loading...</p>;
  }

  const onChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [key]: e.target.value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      if (profile && editing) {
        const next = {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: normalizePhone(form.phone),
          email: form.email.trim(),
          address: profile.address,
          city: profile.city,
          password: form.password,
        };
        if (!next.firstName || !next.lastName || next.phone.length < 11 || !next.email.includes("@")) {
          setError("Enter your name, an 11-digit phone number, and a valid email.");
          return;
        }
        if (next.password && next.password.length < 6) {
          setError("Use at least 6 characters for the password.");
          return;
        }
        await save({ ...next, password: next.password || undefined });
        setEditing(false);
        return;
      }
      if (mode === "sign-in") {
        const phone = normalizePhone(form.phone);
        if (phone.length < 11 || form.password.length < 6) {
          setError("Enter your phone number and password.");
          return;
        }
        await signIn(phone, form.password);
        return;
      }
      const next = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: normalizePhone(form.phone),
        email: form.email.trim(),
        password: form.password,
      };
      if (!next.firstName || !next.lastName || next.phone.length < 11 || !next.email.includes("@") || next.password.length < 6) {
        setError("Enter your name, an 11-digit phone number, a valid email, and a password of at least 6 characters.");
        return;
      }
      await register(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The account could not be saved.");
    } finally {
      setPending(false);
    }
  };

  if (!profile || editing) {
    const creating = !profile && mode === "register";
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="text-center text-2xl font-medium text-(--brand) lg:text-4xl">{profile ? "Personal Details" : "My Account"}</h1>
        <p className="mt-3 text-center text-sm text-(--secondary)">
          {profile ? "Update the details on your account." : "Sign in to see your orders, or create an account."}
        </p>
        <form onSubmit={submit} className="mt-8 space-y-4 rounded-xl bg-white p-6 lg:p-8">
          {(profile || creating) && (
            <>
              <label className="block">
                <span className={labelClass}>First Name</span>
                <input className={fieldClass} value={form.firstName} onChange={onChange("firstName")} autoComplete="given-name" />
              </label>
              <label className="block">
                <span className={labelClass}>Last Name</span>
                <input className={fieldClass} value={form.lastName} onChange={onChange("lastName")} autoComplete="family-name" />
              </label>
            </>
          )}
          <label className="block">
            <span className={labelClass}>Phone Number</span>
            <input className={fieldClass} value={form.phone} onChange={onChange("phone")} inputMode="tel" autoComplete="tel" />
          </label>
          {(profile || creating) && (
            <label className="block">
              <span className={labelClass}>Email</span>
              <input className={fieldClass} type="email" value={form.email} onChange={onChange("email")} autoComplete="email" />
            </label>
          )}
          <label className="block">
            <span className={labelClass}>Password</span>
            <input
              className={fieldClass}
              type="password"
              value={form.password}
              onChange={onChange("password")}
              autoComplete={profile ? "new-password" : "current-password"}
              placeholder={profile ? "Leave blank to keep the current password" : ""}
            />
          </label>
          {error && <p className="text-sm text-(--quinary)">{error}</p>}
          <button type="submit" className={primaryButtonClass} disabled={pending}>
            {pending ? "Please wait..." : profile ? "Save" : mode === "sign-in" ? "Sign In" : "Create Account"}
          </button>
          {profile ? (
            <button type="button" onClick={() => setEditing(false)} className="w-full text-sm font-medium underline">
              Cancel
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode(mode === "sign-in" ? "register" : "sign-in");
                setError("");
              }}
              className="w-full text-sm font-medium underline"
            >
              {mode === "sign-in" ? "Create an account" : "I already have an account"}
            </button>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-medium text-(--brand) lg:text-5xl">My Account</h1>
      <p className="mt-3 text-(--secondary)">Welcome back, {profile.firstName}.</p>

      <section className="mt-8 rounded-xl bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-medium">Personal Details</h2>
          <button
            onClick={() => {
              setForm({
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone,
                email: profile.email,
                password: "",
              });
              setEditing(true);
            }}
            className="text-sm font-medium underline"
          >
            Edit
          </button>
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-(--secondary)">Name</dt>
            <dd>
              {profile.firstName} {profile.lastName}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-(--secondary)">Phone</dt>
            <dd>{profile.phone}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-(--secondary)">Email</dt>
            <dd className="break-all">{profile.email}</dd>
          </div>
        </dl>
        <button onClick={exit} className="mt-6 text-sm font-medium underline">
          Sign Out
        </button>
      </section>

      <section className="mt-6 rounded-xl bg-white p-6">
        <h2 className="text-lg font-medium">Order History</h2>
        {orders.length === 0 ? (
          <p className="mt-4 text-sm text-(--secondary)">You have no orders yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-(--quaternary)">
            {orders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-(--secondary)">
                    {when(order.createdAt)} · {statusLabel[order.status] ?? order.status}
                  </p>
                </div>
                <p className="font-semibold">{formatPrice(order.total)}</p>
                <Link href={`/order/${order.id}`} className="font-medium underline">
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
