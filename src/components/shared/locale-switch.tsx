"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";

export function LocaleSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Common");
  const targetLocale = locale === "ar" ? "en" : "ar";

  return (
    <Link
      aria-label={t("switchLocaleLabel")}
      className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-bold transition hover:bg-muted"
      href={pathname}
      locale={targetLocale}
    >
      <Languages aria-hidden="true" className="size-4" />
      <span>{t("switchLocale")}</span>
    </Link>
  );
}
