import { ClipboardPenLine } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Brand } from "@/components/shared/brand";
import { LocaleSwitch } from "@/components/shared/locale-switch";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils/cn";

export async function SiteHeader() {
  const t = await getTranslations("Common");

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="container flex min-h-20 items-center justify-between gap-4">
        <Brand />
        <nav aria-label={t("primaryNavigation")} className="hidden items-center gap-7 lg:flex">
          <Link
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
            href="/#services"
          >
            {t("services")}
          </Link>
          <Link
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
            href="/#how-it-works"
          >
            {t("howItWorks")}
          </Link>
          <Link
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
            href="/privacy"
          >
            {t("privacy")}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <LocaleSwitch />
          <Link
            className={cn(
              buttonVariants({ size: "sm", variant: "ghost" }),
              "hidden sm:inline-flex",
            )}
            href="/login"
          >
            {t("login")}
          </Link>
          <Link
            className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}
            href="/request"
          >
            {t("startRequest")}
          </Link>
          <Link
            aria-label={t("startRequest")}
            className={cn(buttonVariants({ size: "icon" }), "sm:hidden")}
            href="/request"
          >
            <ClipboardPenLine aria-hidden="true" className="size-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
