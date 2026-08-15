"use client";

import { ClipboardPenLine } from "lucide-react";
import { usePathname } from "next/navigation";

import { Link } from "@/i18n/navigation";

export function MobileRequestCta({ label }: { label: string }) {
  const pathname = usePathname();
  if (
    /\/(request|quote|track|login|signup|forgot-password|reset-password|account|dashboard|sales|operations|quality|finance|settings|admin)(?:\/|$)/.test(
      pathname,
    )
  )
    return null;
  return (
    <div className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 lg:hidden">
      <Link
        className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-black text-primary-foreground shadow-2xl"
        href="/request"
      >
        <ClipboardPenLine aria-hidden="true" className="size-5" />
        {label}
      </Link>
    </div>
  );
}
