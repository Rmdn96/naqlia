import { ShieldCheck } from "lucide-react";

import { BrandMark } from "@/components/shared/brand";
import { LocaleSwitch } from "@/components/shared/locale-switch";
import { StaffSignOutButton } from "@/features/staff-auth/components/staff-sign-out-button";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

export function QualityShell({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: AppLocale;
}) {
  const ar = locale === "ar";
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-5">
            <BrandMark locale={locale} />
            <Link className="flex items-center gap-2 text-sm font-black" href="/quality/reviews">
              <ShieldCheck className="size-4" />
              {ar ? "المراجعات والجودة" : "Reviews & Quality"}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <LocaleSwitch />
            <StaffSignOutButton label={ar ? "تسجيل الخروج" : "Sign out"} locale={locale} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
