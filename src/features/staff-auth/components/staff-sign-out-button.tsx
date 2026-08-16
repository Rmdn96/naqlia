"use client";

import { Button } from "@/components/ui/button";
import type { AppLocale } from "@/i18n/routing";

type StaffSignOutButtonProps = {
  label: string;
  locale: AppLocale;
};

export function StaffSignOutButton({ label, locale }: StaffSignOutButtonProps) {
  return (
    <form action="/auth/sign-out" method="post">
      <input name="locale" type="hidden" value={locale} />
      <Button size="sm" type="submit" variant="outline">
        {label}
      </Button>
    </form>
  );
}
