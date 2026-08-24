"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { AppLocale } from "@/i18n/routing";
import { signOutFromBrowser } from "@/lib/auth/sign-out.client";

type StaffSignOutButtonProps = {
  label: string;
  locale: AppLocale;
};

export function StaffSignOutButton({ label, locale }: StaffSignOutButtonProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

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
    <form action="/auth/sign-out" method="post" onSubmit={handleSignOut}>
      <input name="locale" type="hidden" value={locale} />
      <Button disabled={isSigningOut} size="sm" type="submit" variant="outline">
        {label}
      </Button>
    </form>
  );
}
