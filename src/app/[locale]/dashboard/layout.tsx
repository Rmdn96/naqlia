import { redirect } from "next/navigation";

import { StaffPortalShell } from "@/features/staff-portal/components/staff-portal-shell";
import { getPortalContext } from "@/features/staff-portal/services/staff-portal.service";
import type { AppLocale } from "@/i18n/routing";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as AppLocale;
  const context = await getPortalContext();
  if (!context) redirect(`/${locale}/login?intent=staff&next=/${locale}/dashboard` as never);
  return (
    <StaffPortalShell context={context} locale={locale}>
      {children}
    </StaffPortalShell>
  );
}
