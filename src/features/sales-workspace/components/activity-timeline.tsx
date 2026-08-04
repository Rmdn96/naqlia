import { Circle } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Card } from "@/components/ui/card";
import { formatSalesDate } from "@/features/sales-workspace/lib/format";
import type { SalesActivity } from "@/features/sales-workspace/types/sales-workspace";
import type { AppLocale } from "@/i18n/routing";

type ActivityTimelineProps = {
  activities: SalesActivity[];
  locale: AppLocale;
};

export async function ActivityTimeline({ activities, locale }: ActivityTimelineProps) {
  const t = await getTranslations("SalesWorkspace");

  return (
    <Card className="p-5" aria-labelledby="timeline-heading">
      <h2 className="font-black" id="timeline-heading">
        {t("timeline")}
      </h2>
      {activities.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{t("noActivity")}</p>
      ) : (
        <ol className="mt-5 space-y-5 border-s border-border ps-5">
          {activities.map((activity) => (
            <li className="relative" key={activity.id}>
              <Circle
                aria-hidden="true"
                className="absolute -start-[1.85rem] top-1 size-3 fill-primary text-primary"
              />
              <p className="text-sm font-black">{t(`events.${activity.event_key}`)}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {activity.actor?.display_name ?? t("system")} ·{" "}
                {formatSalesDate(activity.occurred_at, locale)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
