import Link from "next/link";
import type { ReactNode } from "react";

export default function SectionHeader({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 flex items-end justify-between self-stretch border-b border-[#DDDDDD] pb-4 lg:mb-10 lg:border-0 lg:pb-0">
      <h2 className="text-2xl leading-[120%] font-medium text-(--primary) capitalize lg:text-3xl xl:text-5xl">
        {title}
      </h2>
      <div className="flex items-center gap-6">
        {href && (
          <Link
            href={href}
            className="text-sm leading-[150%] font-medium whitespace-nowrap text-(--primary) underline lg:text-base"
          >
            Explore All
          </Link>
        )}
        {children}
      </div>
    </div>
  );
}
