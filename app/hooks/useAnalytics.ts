// hooks/useAnalytics.ts
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { pageview } from "@/lib/gtag";

export function useAnalytics(): void {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      // Construire l'URL complète avec les paramètres de recherche
      const searchString = searchParams.toString();
      const url = searchString ? `${pathname}?${searchString}` : pathname;

      pageview(url);
    }
  }, [pathname, searchParams]);
}
