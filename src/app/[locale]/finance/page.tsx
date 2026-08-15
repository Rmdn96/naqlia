import { CircleDollarSign } from "lucide-react";

import { PortalDashboardView } from "@/features/staff-portal/components/portal-dashboard";
import { getPortalDashboard } from "@/features/staff-portal/services/staff-portal.service";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export default async function FinancePage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  const dashboard = await getPortalDashboard();
  return (
    <section>
      <p className="mb-5 flex items-center gap-2 rounded-md border bg-card p-4 text-sm text-muted-foreground">
        <CircleDollarSign className="size-5 shrink-0 text-primary" />
        {locale === "ar"
          ? "تعرض هذه المرحلة القيم التجارية المعتمدة فقط، ولا تمثل نظاماً محاسبياً."
          : "This v1 view exposes approved commercial values only; it is not an accounting system."}
      </p>
      <PortalDashboardView dashboard={dashboard} locale={locale} />
    </section>
  );
}
