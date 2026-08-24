import { MessageCircleMore, Truck, UserRound } from "lucide-react";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

import { Brand } from "@/components/shared/brand";
import { AccountMenu } from "@/components/shared/account-menu";
import { LocaleSwitch } from "@/components/shared/locale-switch";
import { MobileNavigation } from "@/components/shared/mobile-navigation";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getWhatsAppHref } from "@/config/site";
import type { AppLocale } from "@/i18n/routing";
import { getPublicBusinessConfiguration } from "@/lib/business-settings/public-settings";
import { resolveIdentityContext } from "@/lib/auth/identity-context";
import { cn } from "@/utils/cn";

export async function SiteHeader() {
  const [t, locale, business, identity] = await Promise.all([
    getTranslations("Common"),
    getLocale() as Promise<AppLocale>,
    getPublicBusinessConfiguration(),
    resolveIdentityContext(),
  ]);
  const accountHref = identity?.is_staff ? "/dashboard" : identity ? "/account" : "/login";
  const accountLabel = identity?.is_staff ? t("dashboard") : identity ? t("account") : t("login");
  const mobileItems = [
    { href: "/" as const, label: t("home") },
    { href: "/#services" as const, label: t("services") },
    { href: "/#how-it-works" as const, label: t("howItWorks") },
    { href: "/#service-areas" as const, label: t("serviceAreas") },
    { href: "/track" as const, label: t("trackRequest") },
    { href: "/privacy" as const, label: t("privacy") },
    { href: accountHref as "/account" | "/dashboard" | "/login", label: accountLabel },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="container relative flex min-h-20 items-center justify-between gap-4">
        <Brand />
        <nav aria-label={t("primaryNavigation")} className="hidden items-center gap-7 lg:flex">
          <Link
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
            href="/"
          >
            {t("home")}
          </Link>
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
            href="/track"
          >
            {t("trackRequest")}
          </Link>
          <Link
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
            href="/#service-areas"
          >
            {t("serviceAreas")}
          </Link>
          <Link
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
            href="/privacy"
          >
            {t("privacy")}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <a
            aria-label={t("whatsapp")}
            className={cn(
              buttonVariants({ size: "icon", variant: "outline" }),
              "hidden xl:inline-flex",
            )}
            href={getWhatsAppHref(
              locale === "ar"
                ? "مرحباً نقلك، أود الاستفسار عن خدمات النقل."
                : "Hello Naqlk, I would like to ask about your transport services.",
              business.whatsappNumber,
            )}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircleMore aria-hidden="true" className="size-5 text-emerald-600" />
          </a>
          <LocaleSwitch />
          {identity ? (
            <AccountMenu
              accountLabel={t("account")}
              dashboardLabel={t("dashboard")}
              hasCustomerContext={Boolean(identity.customer_account_id)}
              isStaff={identity.is_staff}
              label={accountLabel}
              locale={locale}
              signOutLabel={t("signOut")}
            />
          ) : (
            <Link
              className={cn(
                buttonVariants({ size: "sm", variant: "ghost" }),
                "hidden sm:inline-flex",
              )}
              href="/login"
            >
              <UserRound aria-hidden="true" className="size-4" />
              {accountLabel}
            </Link>
          )}
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
            <Truck aria-hidden="true" className="size-5" />
          </Link>
          <MobileNavigation
            closeLabel={t("closeMenu")}
            items={mobileItems}
            openLabel={t("openMenu")}
            requestLabel={t("startRequest")}
          />
        </div>
      </div>
    </header>
  );
}
