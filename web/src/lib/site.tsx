"use client";

import { createContext, useContext } from "react";
import type { SiteData } from "./site-data";

export type { SiteData } from "./site-data";

const SiteContext = createContext<SiteData | null>(null);

export function SiteProvider({ site, children }: { site: SiteData; children: React.ReactNode }) {
  return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const site = useContext(SiteContext);
  if (!site) throw new Error("Store settings are unavailable.");
  return site;
}
