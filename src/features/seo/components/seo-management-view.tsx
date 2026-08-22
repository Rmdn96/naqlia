import { CheckCircle2, Eye, SearchCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  saveCitySeoContentAction,
  setCitySeoStateAction,
} from "@/features/seo/actions/seo.actions";
import type { AdminCitySeoItem, AdminCitySeoPayload } from "@/features/seo/types/seo";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

function TextField({ label, name, value }: { label: string; name: string; value: string | null }) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <Input defaultValue={value ?? ""} name={name} required />
    </label>
  );
}

function Editor({ item, locale }: { item: AdminCitySeoItem; locale: AppLocale }) {
  const ar = locale === "ar";
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">
            {item.locale === "ar" ? "المحتوى العربي" : "English content"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {item.contentStatus} · {item.indexable ? "Indexable" : "Noindex"}
          </p>
        </div>
        {item.contentStatus === "published" ? (
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-primary"
            href={`/${item.slug}` as never}
            target="_blank"
          >
            <Eye className="size-4" /> {ar ? "معاينة" : "Preview"}
          </Link>
        ) : null}
      </div>
      {item.readinessIssues.length ? (
        <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
          <strong>{ar ? "متطلبات الجاهزية:" : "Readiness requirements:"}</strong>{" "}
          {item.readinessIssues.join(", ")}
        </div>
      ) : (
        <p className="mt-4 flex items-center gap-2 text-sm font-bold text-emerald-700">
          <CheckCircle2 className="size-4" />{" "}
          {ar ? "المحتوى مستوفٍ لمتطلبات الجاهزية" : "Content passes readiness validation"}
        </p>
      )}
      <form action={saveCitySeoContentAction.bind(null, locale)} className="mt-6 grid gap-5">
        <input name="content" type="hidden" value={item.id} />
        <input name="expectedVersion" type="hidden" value={item.version} />
        <TextField label="Slug" name="slug" value={item.slug} />
        <TextField label={ar ? "عنوان SEO" : "SEO title"} name="seoTitle" value={item.seoTitle} />
        <TextField
          label={ar ? "الوصف التعريفي" : "Meta description"}
          name="metaDescription"
          value={item.metaDescription}
        />
        <TextField
          label={ar ? "عنوان الصفحة" : "Page heading"}
          name="pageHeading"
          value={item.pageHeading}
        />
        {[
          ["introduction", ar ? "المقدمة" : "Introduction", item.introduction],
          [
            "serviceAreaContent",
            ar ? "محتوى نطاق الخدمة" : "Service-area content",
            item.serviceAreaContent,
          ],
          [
            "neighborhoodCoverage",
            ar ? "الأحياء والتغطية (اختياري)" : "Coverage detail (optional)",
            item.neighborhoodCoverage,
          ],
        ].map(([name, label, value]) => (
          <label className="grid gap-2 text-sm font-bold" key={name}>
            {label}
            <Textarea defaultValue={value ?? ""} name={name ?? ""} rows={5} />
          </label>
        ))}
        <fieldset className="grid gap-4">
          <legend className="font-black">{ar ? "الأسئلة الشائعة" : "FAQs"}</legend>
          {[0, 1, 2, 3].map((index) => (
            <div className="grid gap-2 md:grid-cols-2" key={index}>
              <Input
                defaultValue={item.faqs[index]?.question ?? ""}
                name={`faq_${index}_first`}
                placeholder={ar ? "السؤال" : "Question"}
              />
              <Input
                defaultValue={item.faqs[index]?.answer ?? ""}
                name={`faq_${index}_second`}
                placeholder={ar ? "الإجابة" : "Answer"}
              />
            </div>
          ))}
        </fieldset>
        <fieldset className="grid gap-4">
          <legend className="font-black">{ar ? "المسارات الفعلية" : "Real routes"}</legend>
          {[0, 1, 2, 3].map((index) => (
            <div className="grid gap-2 md:grid-cols-2" key={index}>
              <Input
                defaultValue={item.routes[index]?.label ?? ""}
                name={`route_${index}_first`}
                placeholder={ar ? "اسم المسار" : "Route label"}
              />
              <Input
                defaultValue={item.routes[index]?.description ?? ""}
                name={`route_${index}_second`}
                placeholder={ar ? "الوصف" : "Description"}
              />
            </div>
          ))}
        </fieldset>
        <Button type="submit">{ar ? "حفظ كمسودة" : "Save as draft"}</Button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
        {(["draft", "ready", "published"] as const).map((status) => (
          <form action={setCitySeoStateAction.bind(null, locale)} key={status}>
            <input name="content" type="hidden" value={item.id} />
            <input name="status" type="hidden" value={status} />
            <input
              name="indexable"
              type="hidden"
              value={status === "published" ? "true" : "false"}
            />
            <Button
              size="sm"
              type="submit"
              variant={status === "published" ? "default" : "outline"}
            >
              {status === "draft"
                ? ar
                  ? "إلغاء النشر"
                  : "Unpublish"
                : status === "ready"
                  ? ar
                    ? "جاهز"
                    : "Mark ready"
                  : ar
                    ? "نشر وفهرسة"
                    : "Publish & index"}
            </Button>
          </form>
        ))}
      </div>
    </Card>
  );
}

export function SeoManagementView({
  locale,
  payload,
  result,
  selected,
}: {
  locale: AppLocale;
  payload: AdminCitySeoPayload;
  result?: string;
  selected?: string;
}) {
  const ar = locale === "ar";
  const cityIds = [...new Set(payload.items.map((item) => item.cityId))];
  const selectedItem =
    payload.items.find((item) => item.id === selected) ??
    payload.items.find((item) => item.cityId === selected) ??
    payload.items[0];
  const items = selectedItem
    ? payload.items.filter((item) => item.cityId === selectedItem.cityId)
    : [];
  return (
    <div>
      <h1 className="flex items-center gap-2 text-3xl font-black">
        <SearchCheck className="size-7" />
        {ar ? "إدارة SEO المحلي" : "Local SEO Management"}
      </h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        {ar
          ? "حالة التشغيل منفصلة عن جاهزية المحتوى والفهرسة. لا يُنشر محتوى ناقص."
          : "Operational availability is separate from content readiness and indexing. Incomplete content is never indexed."}
      </p>
      {result ? (
        <p className="mt-4 rounded-md border bg-card p-3" role="status">
          {result}
        </p>
      ) : null}
      <Card className="mt-7 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-start">{ar ? "المدينة" : "City"}</th>
                <th className="p-3 text-start">{ar ? "التشغيل" : "Operational"}</th>
                <th className="p-3 text-start">AR</th>
                <th className="p-3 text-start">EN</th>
              </tr>
            </thead>
            <tbody>
              {cityIds.map((cityId) => {
                const cityItems = payload.items.filter((item) => item.cityId === cityId);
                const city = cityItems[0];
                return (
                  <tr className="border-t" key={cityId}>
                    <td className="p-3">
                      <Link
                        className="font-black text-primary"
                        href={`/settings/seo?city=${cityId}` as never}
                      >
                        {ar ? city.cityNameAr : city.cityNameEn}
                      </Link>
                    </td>
                    <td className="p-3">{city.cityStatus}</td>
                    {(["ar", "en"] as const).map((language) => {
                      const content = cityItems.find((item) => item.locale === language);
                      return (
                        <td className="p-3" key={language}>
                          {content?.contentStatus ?? "missing"} ·{" "}
                          {content?.indexable ? "index" : "noindex"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        {items.map((item) => (
          <Editor item={item} key={item.id} locale={locale} />
        ))}
      </div>
    </div>
  );
}
