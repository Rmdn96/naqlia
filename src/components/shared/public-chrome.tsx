"use client";

import { usePathname } from "next/navigation";

export function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const staff =
    /^\/(ar|en)\/(dashboard|sales|operations|quality|finance|settings|admin)(?:\/|$)/.test(
      pathname,
    );
  return staff ? null : children;
}
