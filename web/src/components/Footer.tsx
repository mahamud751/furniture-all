"use client";

import Image from "next/image";
import Link from "next/link";
import { payments } from "@/data/furniture";
import { useSite } from "@/lib/site";
import { FacebookIcon, InstagramIcon } from "./icons";

const heading = "mb-6 text-sm font-semibold tracking-[2.8px] text-(--primary)/40 lg:tracking-[4.2px]";
const list = "space-y-4 *:text-sm *:tracking-[0.32px] *:text-(--primary) md:*:text-base";
const link = "flex flex-wrap items-center justify-start gap-x-1 text-start text-(--primary)";
const col = "min-w-1/3 flex-[calc(20%-16px)] md:min-w-[200px]";

export default function Footer() {
  const { contact, footerColumns } = useSite();
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-334 px-4 lg:px-6">
        <div className="mb-18 flex flex-wrap items-start gap-x-4 gap-y-16 pt-18 sm:mb-18.5 lg:pt-31.25">
          {footerColumns.map((column) => (
            <div key={column.title} className={col}>
              <h4 className={heading}>{column.title}</h4>
              <ul className={list}>
                {column.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className={`${link} underline hover:no-underline`}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className={col}>
            <h4 className={heading}>Service Center</h4>
            <ul className={list}>
              <li>
                <a href={contact.phoneHref} className={link}>{contact.phone}</a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className={link}>{contact.email}</a>
              </li>
              <li>
                <a href={contact.facebook} className={`${link} underline hover:no-underline`}>
                  <FacebookIcon className="size-5" />
                  Facebook
                </a>
              </li>
              <li>
                <a href={contact.instagram} className={`${link} underline hover:no-underline`}>
                  <InstagramIcon className="size-5" />
                  Instagram
                </a>
              </li>
            </ul>
          </div>

          <div className="min-w-[200px] flex-[calc(20%-16px)]">
            <h4 className={heading}>You Can Pay By</h4>
            <ul className="grid grid-cols-12 gap-4">
              {payments.map((p) => (
                <li
                  key={p.name}
                  className="col-span-6 h-10 overflow-hidden rounded-sm border border-(--primary) p-2 sm:col-span-4 lg:col-span-6"
                >
                  <Image src={p.src} alt={p.name} title={p.name} width={100} height={100} className="h-full w-full object-contain" />
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pb-[39px] text-center">
          <p>© {new Date().getFullYear()} ILLIYEEN. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
