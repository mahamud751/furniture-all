import Image from "next/image";
import Link from "next/link";
export default function HeroBanner({
  hero,
}: {
  hero: { desktop: string; mobile: string; href: string };
}) {
  return (
    <section className="pt-6">
      <div className="site-container">
        <Link href={hero.href} className="block overflow-hidden rounded-xl">
          <Image
            src={hero.mobile}
            alt="Furniture"
            width={722}
            height={722}
            priority
            sizes="100vw"
            className="h-auto w-full lg:hidden"
          />
          <Image
            src={hero.desktop}
            alt="Furniture"
            width={1608}
            height={402}
            priority
            sizes="(min-width: 1480px) 1552px, (min-width: 1200px) 1232px, 100vw"
            className="hidden h-auto w-full lg:block"
          />
        </Link>
      </div>
    </section>
  );
}
