import { redirect } from "next/navigation";

import { StaffPortalShell } from "@/features/staff-portal/components/staff-portal-shell";
import { getPortalContext } from "@/features/staff-portal/services/staff-portal.service";
import { routing, type AppLocale } from "@/i18n/routing";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (
    routing.locales.includes(raw as AppLocale) ? raw : routing.defaultLocale
  ) as AppLocale;
  const context = await getPortalContext();
  if (!context) redirect(`/${locale}/login?intent=staff&next=/${locale}/operations/jobs` as never);
  if (!context.permissions.includes("operations.workspace.read" as never))
    redirect(`/${locale}/dashboard` as never);
  return (
    <StaffPortalShell context={context} locale={locale}>
      {children}
    </StaffPortalShell>
  );
}
