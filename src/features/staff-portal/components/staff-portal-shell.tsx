"use client";

import {
  Activity,
  BellRing,
  BriefcaseBusiness,
  Building2,
  Gauge,
  Menu,
  Settings,
  Shield,
  Star,
  Truck,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import { BrandMark } from "@/components/shared/brand";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/features/staff-portal/components/global-search";
import { NotificationCenter } from "@/features/staff-portal/components/notification-center";
import { ThemeToggle } from "@/features/staff-portal/components/theme-toggle";
import { getPortalCopy } from "@/features/staff-portal/lib/copy";
import type { PortalContext } from "@/features/staff-portal/types/staff-portal";
import { StaffSignOutButton } from "@/features/staff-auth/components/staff-sign-out-button";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

export function StaffPortalShell({
  children,
  context,
  locale,
}: {
  children: React.ReactNode;
  context: PortalContext;
  locale: AppLocale;
}) {
  const [drawer, setDrawer] = useState(false);
  const t = getPortalCopy(locale);
  const permission = (value: string) => context.permissions.includes(value as never);
  const links = [
    { href: "/dashboard", icon: Gauge, label: t.dashboard, show: true },
    {
      href: "/sales/leads",
      icon: BriefcaseBusiness,
      label: t.sales,
      show: permission("sales.workspace.read"),
    },
    {
      href: "/operations/jobs",
      icon: Truck,
      label: t.operations,
      show: permission("operations.workspace.read"),
    },
    {
      href: "/quality/reviews",
      icon: Star,
      label: t.quality,
      show: permission("quality.workspace.read"),
    },
    {
      href: "/finance",
      icon: BellRing,
      label: t.finance,
      show: permission("finance.dashboard.read"),
    },
    {
      href: "/settings/business",
      icon: Settings,
      label: t.businessSettings,
      show: permission("settings.business.read"),
    },
    {
      href: "/admin/users",
      icon: Users,
      label: t.users,
      show: permission("administration.users.read"),
    },
    { href: "/admin/roles", icon: Shield, label: t.roles, show: permission("identity.role.read") },
    {
      href: "/admin/activity",
      icon: Activity,
      label: t.activity,
      show: permission("administration.audit.read"),
    },
  ].filter((item) => item.show);
  const navigation = (
    <>
      <div className="flex items-center justify-between border-b p-5">
        <BrandMark locale={locale} />
        <Button
          aria-label="Close"
          className="lg:hidden"
          onClick={() => setDrawer(false)}
          size="icon"
          variant="ghost"
        >
          <X className="size-5" />
        </Button>
      </div>
      <nav className="space-y-1 p-3" aria-label={t.dashboard}>
        {links.map(({ href, icon: Icon, label }) => (
          <Link
            className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground"
            href={href as never}
            key={href}
            onClick={() => setDrawer(false)}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto border-t p-3">
        <Link
          className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-bold hover:bg-muted"
          href="/account"
        >
          <Building2 className="size-4" />
          {t.account}
        </Link>
      </div>
    </>
  );
  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-72 flex-col border-e bg-card lg:flex">
        {navigation}
      </aside>
      {drawer ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setDrawer(false)}
          />
          <aside className="absolute inset-y-0 start-0 flex w-[min(20rem,88vw)] flex-col bg-card shadow-2xl">
            {navigation}
          </aside>
        </div>
      ) : null}
      <div className="lg:ms-72">
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
          <div className="flex min-h-16 items-center gap-3 px-4 lg:px-6">
            <Button
              aria-label="Menu"
              className="lg:hidden"
              onClick={() => setDrawer(true)}
              size="icon"
              variant="outline"
            >
              <Menu className="size-5" />
            </Button>
            {permission("portal.search.read") ? (
              <GlobalSearch label={t.search} />
            ) : (
              <div className="flex-1" />
            )}
            <NotificationCenter
              count={context.unread_count}
              label={t.notifications}
              markAllLabel={locale === "ar" ? "تحديد الكل كمقروء" : "Mark all read"}
            />
            <ThemeToggle label={locale === "ar" ? "تبديل المظهر" : "Toggle theme"} />
            <StaffSignOutButton label={t.signOut} locale={locale} />
          </div>
        </header>
        <div className="mx-auto max-w-[100rem] p-4 lg:p-8" id="main-content">
          {children}
        </div>
      </div>
    </div>
  );
}
