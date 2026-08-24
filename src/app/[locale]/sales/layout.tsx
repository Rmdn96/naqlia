import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

import { StaffPortalShell } from "@/features/staff-portal/components/staff-portal-shell";
import { getPortalContext } from "@/features/staff-portal/services/staff-portal.service";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { follow: false, index: false, noarchive: true, nocache: true },
};

type SalesLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function SalesLayout({ children, params }: SalesLayoutProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const context = await getPortalContext();
  if (!context) redirect(`/${locale}/login?intent=staff&next=/${locale}/sales/leads` as never);
  if (!context.permissions.includes("sales.workspace.read" as never)) notFound();
  return (
    <StaffPortalShell context={context} locale={locale}>
      {children}
    </StaffPortalShell>
  );
}
