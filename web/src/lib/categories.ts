import categoriesJson from "@/data/categories.json";

export type SubCategory = { slug: string; title: string; codes: string[] };
export type Room = { slug: string; title: string; codes: string[]; children: SubCategory[] };

/** Rooms with their subcategories (empty subcategories hidden). */
export const rooms: Room[] = (categoriesJson.rooms as Room[]).map((r) => ({
  ...r,
  children: r.children.filter((c) => c.codes.length > 0),
}));

/** Navigation-only view of the tree, without product codes (safe for client bundles). */
export const roomNav = rooms.map((r) => ({
  slug: r.slug,
  title: r.title,
  children: r.children.map((c) => ({ slug: c.slug, title: c.title })),
}));

export const allCodes: string[] = categoriesJson.all;
