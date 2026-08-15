"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils/cn";

type Item = {
  href:
    | "/"
    | "/#services"
    | "/#how-it-works"
    | "/#service-areas"
    | "/account"
    | "/dashboard"
    | "/login"
    | "/privacy"
    | "/request"
    | "/track";
  label: string;
};

export function MobileNavigation({
  closeLabel,
  items,
  openLabel,
  requestLabel,
}: {
  closeLabel: string;
  items: Item[];
  openLabel: string;
  requestLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    firstLink.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);
  return (
    <div className="lg:hidden">
      <button
        aria-expanded={open}
        aria-controls="mobile-navigation-panel"
        aria-label={open ? closeLabel : openLabel}
        className="grid size-11 place-items-center rounded-lg border border-border bg-card"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {open ? (
          <X aria-hidden="true" className="size-5" />
        ) : (
          <Menu aria-hidden="true" className="size-5" />
        )}
      </button>
      {open ? (
        <div
          className="absolute inset-x-0 top-full border-b border-border bg-card p-4 shadow-xl"
          id="mobile-navigation-panel"
        >
          <nav className="container grid gap-1" aria-label={openLabel}>
            {items.map((item, index) => (
              <Link
                className="rounded-lg px-4 py-3 text-sm font-bold hover:bg-secondary"
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
                ref={index === 0 ? firstLink : undefined}
              >
                {item.label}
              </Link>
            ))}
            <Link
              className={cn(buttonVariants(), "mt-2")}
              href="/request"
              onClick={() => setOpen(false)}
            >
              {requestLabel}
            </Link>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
