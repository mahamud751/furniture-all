"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./cart/CartProvider";
import { BagIconFilled, HomeIcon, MapIcon, UserIconFilled } from "./icons";

const items = [
  { label: "Home", href: "/", Icon: HomeIcon, iconClass: "h-4.5 w-4.25" },
  { label: "Store Locations", href: "/store-locations", Icon: MapIcon, iconClass: "" },
  { label: "Shopping Bag", href: "/bag", Icon: BagIconFilled, iconClass: "" },
  { label: "Account", href: "/account", Icon: UserIconFilled, iconClass: "" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <div className="fixed right-0 bottom-0 left-0 z-30 w-full border-t-[0.333px] border-(--primary)/30 bg-white/75 pt-3 pb-8 backdrop-blur-[50px] lg:hidden">
      <ul className="flex items-stretch justify-between px-4">
        {items.map(({ label, href, Icon, iconClass }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex h-full w-full flex-col items-center justify-center gap-1 text-xs font-medium ${
                  active ? "text-(--primary)" : "text-(--secondary)"
                }`}
              >
                <span className="relative">
                  <Icon className={iconClass} />
                  {href === "/bag" && count > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 flex size-4 items-center justify-center rounded-full bg-(--primary) text-[10px] text-white">
                      {count}
                    </span>
                  )}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
