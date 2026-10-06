import Link from "next/link";

export type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ crumbs, className = "" }: { crumbs: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ul className="relative z-10 flex flex-wrap items-center gap-2 text-sm">
        {crumbs.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-2">
            {i > 0 && <span className="text-(--primary)/30">/</span>}
            {c.href ? (
              <Link href={c.href} className="font-medium text-(--primary) underline hover:no-underline">
                {c.label}
              </Link>
            ) : (
              <span className="font-medium text-(--primary)/50">{c.label}</span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
