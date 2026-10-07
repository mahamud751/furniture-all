"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, setSession } from "@/lib/api";
import { Banner, btn, field, label } from "@/lib/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@basha.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const result = await api<{ token: string; admin: { name: string; email: string } }>("/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setSession(result.token, result.admin);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
      setPending(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1fr)]">
      <section className="hidden flex-col justify-between bg-ink px-12 py-12 text-white lg:flex">
        <div>
          <img src="/logo-light.png" alt="Basha Furniture" className="h-12 w-auto" />
          <h1 className="mt-10 max-w-md text-5xl leading-[1.05] font-medium">Furniture, managed with care.</h1>
          <p className="mt-6 max-w-sm text-base leading-7 text-white/65">
            Catalogue, orders, stores, pages, and the homepage all come from the local database.
          </p>
        </div>
        <p className="text-sm text-white/40">Local operations desk</p>
      </section>
      <section className="flex items-center justify-center px-6 py-16">
        <form onSubmit={submit} className="w-full max-w-md">
          <img src="/logo.png" alt="Basha Furniture" className="h-10 w-auto lg:hidden" />
          <h2 className="mt-3 text-3xl font-medium">Sign in</h2>
          <p className="mt-2 text-sm text-muted">Use the seeded admin account for this machine.</p>
          <div className="mt-8 space-y-4">
            <label className="block">
              <span className={label}>Email</span>
              <input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
            </label>
            <label className="block">
              <span className={label}>Password</span>
              <input className={field} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </label>
            <Banner>{error}</Banner>
            <button className={`${btn} w-full`} disabled={pending}>
              {pending ? "Signing in..." : "Sign in"}
            </button>
            <p className="text-xs leading-5 text-muted">admin@basha.local · Admin@12345</p>
          </div>
        </form>
      </section>
    </div>
  );
}
