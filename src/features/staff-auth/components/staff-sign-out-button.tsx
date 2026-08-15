"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { AppLocale } from "@/i18n/routing";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type StaffSignOutButtonProps = {
  label: string;
  locale: AppLocale;
};

export function StaffSignOutButton({ label, locale }: StaffSignOutButtonProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    window.location.assign(`/${locale}/login`);
  }

  return (
    <Button disabled={isSigningOut} onClick={handleSignOut} size="sm" variant="outline">
      {label}
    </Button>
  );
}
