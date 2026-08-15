import { redirect } from "next/navigation";

import { QualityShell } from "@/features/reviews-quality/components/quality-shell";
import { routing, type AppLocale } from "@/i18n/routing";
import { AuthorizationError } from "@/lib/auth/authorization";
import { requireQualityWorkspacePermission } from "@/lib/auth/quality-workspace";

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
  try {
    await requireQualityWorkspacePermission("quality.workspace.read");
  } catch (error) {
    if (error instanceof AuthorizationError)
      redirect(`/${locale}/staff/sign-in?next=/${locale}/quality/reviews`);
    throw error;
  }
  return <QualityShell locale={locale}>{children}</QualityShell>;
}
