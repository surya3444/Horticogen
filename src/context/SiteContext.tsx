"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { listCategories, buildTree } from "@/lib/firebase/categories";
import {
  getGeneral,
  getFooter,
  getDelivery,
  defaultGeneral,
  defaultFooter,
  defaultDelivery,
} from "@/lib/firebase/settings";
import type {
  CategoryNode,
  DeliverySettings,
  FooterSettings,
  GeneralSettings,
} from "@/lib/types";

interface SiteData {
  tree: CategoryNode[];
  general: GeneralSettings;
  footer: FooterSettings;
  delivery: DeliverySettings;
  loading: boolean;
}

const SiteContext = createContext<SiteData>({
  tree: [],
  general: defaultGeneral,
  footer: defaultFooter,
  delivery: defaultDelivery,
  loading: true,
});

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SiteData>({
    tree: [],
    general: defaultGeneral,
    footer: defaultFooter,
    delivery: defaultDelivery,
    loading: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const [cats, general, footer, delivery] = await Promise.all([
          listCategories(),
          getGeneral(),
          getFooter(),
          getDelivery(),
        ]);
        setData({ tree: buildTree(cats), general, footer, delivery, loading: false });
      } catch (e) {
        console.error("Failed to load site data", e);
        setData((d) => ({ ...d, loading: false }));
      }
    })();
  }, []);

  return <SiteContext.Provider value={data}>{children}</SiteContext.Provider>;
}

export function useSite() {
  return useContext(SiteContext);
}
