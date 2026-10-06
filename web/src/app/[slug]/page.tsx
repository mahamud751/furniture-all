import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import RichText from "@/components/RichText";
import { getContentPage } from "@/lib/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: (await getContentPage(slug))?.title ?? "Not found" };
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getContentPage(slug);
  if (!page) notFound();

  return (
    <section className="pt-8 pb-20 lg:pt-12 lg:pb-28">
      <div className="site-container">
        <Breadcrumbs className="mb-6" crumbs={[{ label: "Home", href: "/" }, { label: page.title }]} />
        <h1 className="mb-8 text-2xl leading-[120%] font-medium lg:text-5xl">{page.title}</h1>
        <article className="rounded-xl bg-white p-5 lg:p-10">
          <RichText html={page.html} />
        </article>
      </div>
    </section>
  );
}
