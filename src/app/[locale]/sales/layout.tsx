import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { SalesShell } from "@/features/sales-workspace/components/sales-shell";
import { requireSalesWorkspacePermission } from "@/lib/auth/sales-workspace";
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
  setRequestLocale(locale);

  try {
    await requireSalesWorkspacePermission("sales.workspace.read");
  } catch {
    notFound();
  }

  const t = await getTranslations("SalesWorkspace");

  return (
    <SalesShell
      inboxLabel={t("leadInbox")}
      locale={locale}
      signOutLabel={t("signOut")}
      workspaceLabel={t("workspace")}
    >
      {children}
    </SalesShell>
  );
}
