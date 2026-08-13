import { redirect } from "next/navigation";

import { OperationsShell } from "@/features/operations/components/operations-shell";
import { routing, type AppLocale } from "@/i18n/routing";
import { AuthorizationError } from "@/lib/auth/authorization";
import { requireOperationsWorkspacePermission } from "@/lib/auth/operations-workspace";

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
    await requireOperationsWorkspacePermission("operations.workspace.read");
  } catch (error) {
    if (error instanceof AuthorizationError)
      redirect(`/${locale}/staff/sign-in?next=/${locale}/operations/jobs`);
    throw error;
  }
  return <OperationsShell locale={locale}>{children}</OperationsShell>;
}
