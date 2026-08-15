import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { StaffPortalShell } from "@/features/staff-portal/components/staff-portal-shell";
import { getPortalContext } from "@/features/staff-portal/services/staff-portal.service";
import type { AppLocale } from "@/i18n/routing";

export const metadata: Metadata = {
  robots: { follow: false, index: false, noarchive: true, nocache: true },
};

export default async function FinanceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as AppLocale;
  const context = await getPortalContext();
  if (!context) redirect(`/${locale}/login?intent=staff&next=/${locale}/finance` as never);
  if (!context.permissions.includes("finance.dashboard.read")) notFound();
  return (
    <StaffPortalShell context={context} locale={locale}>
      {children}
    </StaffPortalShell>
  );
}
