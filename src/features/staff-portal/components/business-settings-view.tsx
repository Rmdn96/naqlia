import { Building2, MapPin, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  updateBusinessSettingAction,
  updateServiceAreaAction,
} from "@/features/staff-portal/actions/administration.actions";
import type { BusinessSettingsPayload } from "@/features/staff-portal/types/administration";
import type { AppLocale } from "@/i18n/routing";

export function BusinessSettingsView({
  locale,
  payload,
  result,
}: {
  locale: AppLocale;
  payload: BusinessSettingsPayload;
  result?: string;
}) {
  const ar = locale === "ar";
  const categories = ["contact", "social", "customer", "quotation", "identity"];
  return (
    <div>
      <h1 className="flex items-center gap-2 text-3xl font-black">
        <Building2 className="size-7" />
        {ar ? "إعدادات الأعمال" : "Business Settings"}
      </h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        {ar
          ? "قيم أعمال غير سرية مع اعتماد إعدادات البيئة كخيار احتياطي عند التعذر."
          : "Non-secret business values with environment configuration retained as the availability fallback."}
      </p>
      {result ? (
        <p className="mt-5 rounded-md border bg-card p-3 text-sm" role="status">
          {result}
        </p>
      ) : null}
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        {categories.map((category) => (
          <Card className="p-5" key={category}>
            <h2 className="text-lg font-black capitalize">{category}</h2>
            <div className="mt-4 space-y-4">
              {payload.settings
                .filter((setting) => setting.category === category)
                .map((setting) => (
                  <form
                    action={updateBusinessSettingAction.bind(null, locale)}
                    className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
                    key={setting.setting_key}
                  >
                    <label className="space-y-1 text-sm">
                      <span className="font-bold">{setting.setting_key}</span>
                      <Input defaultValue={setting.value_text ?? ""} name="value" />
                      <input name="key" type="hidden" value={setting.setting_key} />
                    </label>
                    <Button className="self-end" size="icon" type="submit">
                      <Save className="size-4" />
                    </Button>
                  </form>
                ))}
            </div>
          </Card>
        ))}
      </div>
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-xl font-black">
          <MapPin className="size-5" />
          {ar ? "مناطق الخدمة" : "Service Areas"}
        </h2>
        <Card className="mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-start">{ar ? "المدينة" : "City"}</th>
                  <th className="p-3 text-start">{ar ? "الحالة" : "Status"}</th>
                  <th className="p-3 text-start">{ar ? "الترتيب" : "Order"}</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {payload.service_areas.map((city) => (
                  <tr className="border-t" key={city.id}>
                    <td className="p-3 font-bold">{ar ? city.name_ar : city.name_en}</td>
                    <td colSpan={3} className="p-3">
                      <form
                        action={updateServiceAreaAction.bind(null, locale)}
                        className="flex items-center gap-3"
                      >
                        <input name="city" type="hidden" value={city.id} />
                        <select
                          className="h-10 rounded-md border bg-background px-3"
                          defaultValue={city.status}
                          name="status"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                        <Input
                          className="w-24"
                          defaultValue={city.display_order}
                          min={0}
                          name="order"
                          type="number"
                        />
                        <Button size="sm" type="submit">
                          {ar ? "حفظ" : "Save"}
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
