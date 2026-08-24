import { Activity } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ActivityPayload } from "@/features/staff-portal/types/administration";
import type { AppLocale } from "@/i18n/routing";

export function ActivityLogView({
  locale,
  payload,
  query,
}: {
  locale: AppLocale;
  payload: ActivityPayload;
  query: { area?: string; event?: string; search?: string };
}) {
  const ar = locale === "ar";
  return (
    <div>
      <h1 className="flex items-center gap-2 text-3xl font-black">
        <Activity className="size-7" />
        {ar ? "سجل النشاط" : "Activity Log"}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {ar
          ? "سجل للقراءة فقط مع حجب الأسباب والملاحظات الحساسة."
          : "Immutable read-only activity with sensitive reasons and notes redacted."}
      </p>
      <Card className="mt-6 p-5">
        <form className="grid gap-3 md:grid-cols-4" method="get">
          <Input
            defaultValue={query.search}
            name="search"
            placeholder={ar ? "NQ أو اسم المستخدم" : "NQ or user name"}
          />
          <Input defaultValue={query.area} name="area" placeholder={ar ? "المجال" : "Area"} />
          <Input
            defaultValue={query.event}
            name="event"
            placeholder={ar ? "نوع الحدث" : "Event type"}
          />
          <Button type="submit">{ar ? "تصفية" : "Filter"}</Button>
        </form>
      </Card>
      <Card className="mt-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-sm">
            <thead className="bg-muted">
              <tr>
                {[
                  ar ? "الوقت" : "Time",
                  ar ? "المجال" : "Area",
                  ar ? "الحدث" : "Event",
                  ar ? "المرجع" : "Reference",
                  ar ? "الفاعل" : "Actor",
                ].map((h) => (
                  <th className="p-3 text-start" key={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payload.items.map((item) => (
                <tr className="border-t" key={item.id}>
                  <td className="p-3">
                    {new Date(item.occurred_at).toLocaleString(ar ? "ar-SA" : "en-SA")}
                  </td>
                  <td className="p-3">{item.functional_area}</td>
                  <td className="p-3 font-medium">{item.event_key}</td>
                  <td className="p-3">{item.reference_number ?? "—"}</td>
                  <td className="p-3">{item.actor_name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
