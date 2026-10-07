"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, currentUser } from "@/lib/api";

const groups = [
  {
    title: "Overview",
    links: [{ href: "/", label: "Dashboard" }],
  },
  {
    title: "Catalogue",
    links: [
      { href: "/products", label: "Products" },
      { href: "/rooms", label: "Rooms" },
      { href: "/homepage", label: "Homepage" },
    ],
  },
  {
    title: "Sales",
    links: [
      { href: "/orders", label: "Orders" },
      { href: "/customers", label: "Customers" },
    ],
  },
  {
    title: "Content",
    links: [
      { href: "/stores", label: "Stores" },
      { href: "/pages", label: "Pages" },
      { href: "/messages", label: "Messages" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

function active(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Shell({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("furniture-admin-token")) {
      router.replace("/login");
      return;
    }
    setUser(currentUser());
    setReady(true);
  }, [router]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!ready) {
    return <p className="px-6 py-16 text-sm text-muted">Loading admin...</p>;
  }

  const nav = (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6 pb-5">
        <img src="/logo-light.png" alt="Basha Furniture" className="h-20 w-auto" />
        <p className="mt-3 text-[11px] font-semibold tracking-[0.22em] text-white/45 uppercase">Admin</p>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.18em] text-white/35 uppercase">{group.title}</p>
            <div className="space-y-1">
              {group.links.map((link) => {
                const on = active(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block rounded-[6px] px-3 py-2 text-sm ${on ? "bg-white text-ink" : "text-white/78 hover:bg-white/8 hover:text-white"}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-sm font-medium text-white">{user?.name ?? "Admin"}</p>
        <p className="truncate text-xs text-white/45">{user?.email}</p>
        <button
          className="mt-3 text-xs font-medium text-white/70 underline"
          onClick={() => {
            clearSession();
            router.replace("/login");
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-ink lg:block">{nav}</aside>
      {open && <button aria-label="Close menu" className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-ink transition-transform lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
        {nav}
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line bg-canvas/90 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button aria-label="Open menu" className="flex h-10 w-10 items-center justify-center rounded-[5px] border border-line bg-white lg:hidden" onClick={() => setOpen(true)}>
              <span className="flex w-4 flex-col gap-1">
                <span className="h-px bg-ink" />
                <span className="h-px bg-ink" />
                <span className="h-px bg-ink" />
              </span>
            </button>
            <h1 className="text-xl font-medium tracking-tight lg:text-2xl">{title}</h1>
          </div>
          {action}
        </header>
        <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
