import { ArrowUpLeft, ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { getPortalCopy } from "@/features/staff-portal/lib/copy";
import type { PortalDashboard } from "@/features/staff-portal/types/staff-portal";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

export function PortalDashboardView({
  dashboard,
  locale,
}: {
  dashboard: PortalDashboard;
  locale: AppLocale;
}) {
  const ar = locale === "ar";
  const t = getPortalCopy(locale);
  const Arrow = ar ? ArrowUpLeft : ArrowUpRight;
  return (
    <div>
      <p className="text-sm font-black text-primary">{dashboard.role_key.replaceAll("_", " ")}</p>
      <h1 className="mt-1 text-3xl font-black">{t.dashboard}</h1>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(dashboard.metrics).map(([key, value]) => (
          <Card className="p-5" key={key}>
            <p className="text-sm text-muted-foreground">{key.replaceAll("_", " ")}</p>
            <p className="mt-2 text-3xl font-black">
              {Number(value).toLocaleString(ar ? "ar-SA" : "en-SA", { maximumFractionDigits: 2 })}
            </p>
          </Card>
        ))}
      </section>
      <section className="mt-10">
        <h2 className="text-xl font-black">{t.actionCenter}</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {dashboard.actions.map((action) => (
            <Link
              className="flex items-center justify-between rounded-lg border bg-card p-5 hover:border-primary/40"
              href={action.path as never}
              key={action.key}
            >
              <span>
                <strong className="block">{action.key.replaceAll("_", " ")}</strong>
                <span className="text-sm text-muted-foreground">{action.count}</span>
              </span>
              <Arrow className="size-5" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
