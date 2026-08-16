"use client";

import { LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { signOutFromBrowser } from "@/lib/auth/sign-out.client";
import { cn } from "@/utils/cn";

type AccountMenuProps = {
  accountLabel: string;
  dashboardLabel: string;
  hasCustomerContext: boolean;
  isStaff: boolean;
  label: string;
  locale: AppLocale;
  signOutLabel: string;
};

export function AccountMenu({
  accountLabel,
  dashboardLabel,
  hasCustomerContext,
  isStaff,
  label,
  locale,
  signOutLabel,
}: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);

  function closeMenu({ restoreFocus = false } = {}) {
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  }

  useEffect(() => {
    if (!open) return;
    firstItemRef.current?.focus();

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) closeMenu();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function handleMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
      return;
    }

    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])'),
    );
    if (items.length === 0) return;
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : event.key === "ArrowDown"
            ? (currentIndex + 1 + items.length) % items.length
            : (currentIndex - 1 + items.length) % items.length;
    items[nextIndex]?.focus();
  }

  async function handleSignOut(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSigningOut(true);
    try {
      await signOutFromBrowser(locale);
    } catch {
      setIsSigningOut(false);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "px-2 sm:px-3")}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown") return;
          event.preventDefault();
          setOpen(true);
        }}
        ref={triggerRef}
        type="button"
      >
        <UserRound aria-hidden="true" className="size-4" />
        <span className="hidden sm:inline">{label}</span>
      </button>
      {open ? (
        <div
          aria-label={label}
          className="absolute end-0 top-full z-50 mt-2 min-w-48 rounded-xl border border-border bg-card p-1.5 shadow-xl"
          id={menuId}
          onKeyDown={handleMenuKeyDown}
          role="menu"
        >
          {isStaff ? (
            <Link
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold hover:bg-secondary focus:bg-secondary focus:outline-none"
              href="/dashboard"
              onClick={() => closeMenu()}
              ref={firstItemRef}
              role="menuitem"
            >
              <LayoutDashboard aria-hidden="true" className="size-4" />
              {dashboardLabel}
            </Link>
          ) : null}
          {hasCustomerContext ? (
            <Link
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold hover:bg-secondary focus:bg-secondary focus:outline-none"
              href="/account"
              onClick={() => closeMenu()}
              ref={isStaff ? undefined : firstItemRef}
              role="menuitem"
            >
              <UserRound aria-hidden="true" className="size-4" />
              {accountLabel}
            </Link>
          ) : null}
          <form action="/auth/sign-out" method="post" onSubmit={handleSignOut}>
            <input name="locale" type="hidden" value={locale} />
            <button
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-start text-sm font-bold text-destructive hover:bg-secondary focus:bg-secondary focus:outline-none disabled:opacity-60"
              disabled={isSigningOut}
              role="menuitem"
              type="submit"
            >
              <LogOut aria-hidden="true" className="size-4" />
              {signOutLabel}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
