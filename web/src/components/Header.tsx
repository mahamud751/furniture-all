"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSite } from "@/lib/site";
import { roomHref, subHref } from "@/lib/shared";
import { useCart } from "./cart/CartProvider";
import {
  BagIcon,
  BagIconFilled,
  CaretDown,
  ChevronRight,
  CloseIcon,
  MailIcon,
  MenuIcon,
  PhoneIcon,
  PinIcon,
  SearchIcon,
  SearchIconFilled,
  TruckIcon,
  UserIcon,
  UserIconFilled,
} from "./icons";

const underline =
  "relative after:absolute after:left-0 after:h-px after:bg-(--primary) after:transition-all after:duration-300 after:ease-linear";

const iconBtn = "group relative flex h-9 w-9 items-center justify-center text-(--primary)";

function isActive(pathname: string, href: string) {
  if (href === "/shop") return pathname === "/shop" || pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const { contact, navLinks, rooms } = useSite();
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openRoom, setOpenRoom] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  // Close overlays whenever the route changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset UI on navigation
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      {/* Desktop top bar */}
      <div className="relative z-36 hidden items-center justify-between gap-4 border-b border-(--tertiary) bg-white px-6 lg:flex xl:px-10">
        <div className="flex h-12 items-center gap-x-3 xl:gap-x-8">
          <span className="flex items-center gap-2 p-2 text-base font-medium text-(--grey-00)">
            English
            <CaretDown className="text-(--primary)" />
          </span>
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-x-2 text-sm font-medium text-(--grey-00)"
          >
            <MailIcon className="size-5 text-(--primary)" />
            {contact.email}
          </a>
          <Link href="/contact-us" className="flex items-center gap-x-2 text-sm font-medium text-(--grey-00)">
            <PhoneIcon className="text-(--grey-00)" />
            Contact
          </Link>
        </div>
        <div className="flex h-12 items-center gap-x-8">
          <div className="flex items-center gap-2 text-sm font-medium text-(--secondary)">
            <TruckIcon className="text-(--secondary)" />
            <span>Deliver to:</span>
            <span className="flex items-center gap-2 text-(--primary)">
              <Image src="/images/flag-bd.webp" alt="Bangladesh" width={20} height={16} />
              Bangladesh
            </span>
          </div>
          <Link
            href="/store-locations"
            className={`${underline} text-sm font-medium after:-bottom-1.5 after:w-0 hover:after:w-full`}
          >
            Store Locations
          </Link>
        </div>
      </div>

      {/* Mobile deliver-to bar */}
      <div className="flex h-9 items-center gap-2 bg-black px-6 text-xs font-medium text-white lg:hidden">
        <PinIcon className="text-white" />
        <span>Deliver to</span>
        <span className="font-semibold">Bangladesh</span>
      </div>

      {/* Main nav */}
      <nav className="relative z-35 w-full max-lg:sticky max-lg:top-0">
        <section className="relative flex items-center justify-between border-b border-(--quaternary) bg-white px-10 backdrop-blur-[48px] max-lg:px-4 max-lg:py-3 lg:h-[71px]">
          <button aria-label="Open Menu" className="lg:hidden" onClick={() => setMenuOpen(true)}>
            <MenuIcon />
          </button>

          <div className="max-lg:absolute max-lg:left-1/2 max-lg:-translate-x-1/2">
            <Link href="/" className="inline-block" aria-label="Savasaachi home">
              <Image
                src="/images/logo.svg"
                alt="Savasaachi Furniture"
                width={267}
                height={48}
                priority
                className="h-9 w-auto max-md:h-7"
              />
            </Link>
          </div>

          <div className="no-scrollbar hidden w-max items-center overflow-auto lg:flex">
            {navLinks.map((link) => (
              <span key={link.href} className="px-2 leading-[71px] xl:px-4">
                <Link
                  href={link.href}
                  className={`${underline} inline-flex whitespace-nowrap text-sm font-medium tracking-[0.48px] text-(--primary) after:bottom-0 hover:after:w-full ${
                    isActive(pathname, link.href) ? "after:w-full" : "after:w-0"
                  }`}
                >
                  {link.label}
                </Link>
              </span>
            ))}
          </div>

          <ul className="flex items-center justify-end gap-x-4 lg:ml-6">
            <li>
              <button aria-label="Search" className={iconBtn} onClick={() => setSearchOpen((v) => !v)}>
                <SearchIcon className="group-hover:opacity-0" />
                <SearchIconFilled className="absolute top-1/2 left-1/2 -translate-1/2 opacity-0 group-hover:opacity-100" />
              </button>
            </li>
            <li className="relative max-lg:hidden">
              <Link href="/account" aria-label="Account" className={iconBtn}>
                <UserIcon className="transition group-hover:opacity-0" />
                <UserIconFilled className="absolute top-1/2 left-1/2 -translate-1/2 opacity-0 transition group-hover:opacity-100" />
              </Link>
            </li>
            <li className="relative max-lg:hidden">
              <Link href="/bag" aria-label="Shopping Bag" className={iconBtn}>
                <BagIcon className="text-(--grey-00) group-hover:opacity-0" />
                <BagIconFilled className="absolute top-1/2 left-1/2 -translate-1/2 text-(--grey-00) opacity-0 group-hover:opacity-100" />
                {count > 0 && (
                  <span className="absolute top-0 -right-1 flex size-4.5 items-center justify-center rounded-full bg-(--primary) text-[10px] font-medium text-white">
                    {count}
                  </span>
                )}
              </Link>
            </li>
          </ul>

          {/* Search drawer */}
          <div
            className={`absolute top-full left-0 z-25 w-full overflow-hidden bg-white transition-all duration-500 ${
              searchOpen ? "h-28 border-t border-(--quaternary) shadow-md" : "h-0"
            }`}
          >
            <div className="mx-auto max-w-193 px-4 pt-6 pb-3">
              <form
                role="search"
                className="flex items-center gap-2 border-b border-(--secondary) px-2 py-3"
                onSubmit={submitSearch}
              >
                <button type="submit" aria-label="Submit Search">
                  <SearchIcon className="text-(--primary)" />
                </button>
                <input
                  ref={searchInput}
                  type="text"
                  name="q"
                  maxLength={40}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search furniture by name or product code"
                  className="flex-1 bg-transparent text-sm outline-none"
                />
                <button type="button" aria-label="Close Search" onClick={() => setSearchOpen(false)}>
                  <CloseIcon className="size-4" />
                </button>
              </form>
            </div>
          </div>
        </section>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 h-full w-full overflow-y-auto bg-light-grey shadow-lg transition-transform duration-300 ease-in-out lg:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="sticky top-0 z-30 flex h-16 items-center justify-center bg-white/90 py-3 shadow-[0_1px_9px_0_rgba(0,0,0,0.04)] backdrop-blur-xs">
          <button
            aria-label="Close Menu"
            className="absolute top-1/2 left-4 -translate-y-1/2"
            onClick={() => setMenuOpen(false)}
          >
            <CloseIcon className="h-9 w-6" />
          </button>
          <Image src="/images/logo.svg" alt="Savasaachi Furniture" width={267} height={48} className="h-7 w-auto" />
        </div>
        <ul className="divide-y divide-(--quaternary) bg-white">
          <li>
            <Link href="/shop" className="flex items-center justify-between px-6 py-4 text-lg font-medium">
              All Furniture
              <ChevronRight className="size-5" />
            </Link>
          </li>
          {rooms.map((room) => {
            const open = openRoom === room.slug;
            return (
              <li key={room.slug}>
                <button
                  onClick={() => setOpenRoom(open ? null : room.slug)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between px-6 py-4 text-base font-medium text-(--primary)"
                >
                  {room.title}
                  <CaretDown className={`size-5 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-[600px]" : "max-h-0"}`}>
                  <ul className="space-y-3 px-8 pb-4 text-sm text-(--secondary)">
                    <li>
                      <Link href={roomHref(room.slug)} className="font-medium text-(--primary)">
                        Shop all {room.title}
                      </Link>
                    </li>
                    {room.children.map((c) => (
                      <li key={c.slug}>
                        <Link href={subHref(room.slug, c.slug)}>{c.title}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="space-y-4 px-6 py-6 pb-32 text-sm font-medium text-(--grey-00)">
          <Link href="/store-locations" className="block">Store Locations</Link>
          <Link href="/contact-us" className="block">Contact Us</Link>
          <a href={`mailto:${contact.email}`} className="flex items-center gap-2">
            <MailIcon className="size-5" />
            {contact.email}
          </a>
          <a href={contact.phoneHref} className="flex items-center gap-2">
            <PhoneIcon className="size-5" />
            {contact.phone}
          </a>
        </div>
      </div>
    </>
  );
}
