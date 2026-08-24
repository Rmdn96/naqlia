import type { Metadata } from "next";
import { RolesPermissionsView } from "@/features/staff-portal/components/roles-permissions-view";
import { getRolesPermissions } from "@/features/staff-portal/services/administration.service";
import type { AppLocale } from "@/i18n/routing";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function RolesPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  return <RolesPermissionsView items={await getRolesPermissions()} locale={locale} />;
}
