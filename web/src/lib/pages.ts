import pagesJson from "@/data/pages.json";

type RawPage = { title: string; html: string };

const pages = pagesJson as Record<string, RawPage>;

function decodeTitle(text: string) {
  return text.replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

export function getContentPage(slug: string) {
  const page = pages[slug];
  if (!page?.html.trim()) return undefined;
  return { slug, title: decodeTitle(page.title), html: page.html };
}

export function contentSlugs() {
  return Object.keys(pages).filter((slug) => Boolean(pages[slug]?.html.trim()));
}
