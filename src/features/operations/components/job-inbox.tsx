import { Link } from "@/i18n/navigation";

import type { OperationsInboxPage } from "@/features/operations/types/operations";
import type { AppLocale } from "@/i18n/routing";

const labels = {
  ar: {
    title: "مساحة عمل العمليات",
    subtitle: "إدارة الوظائف والرحلات من جدولة التنفيذ حتى التسليم.",
    search: "ابحث برقم NQ أو العميل أو الجوال",
    all: "كل الحالات",
    empty: "لا توجد وظائف مطابقة.",
    trips: "رحلات",
    attention: "يتطلب متابعة",
  },
  en: {
    title: "Operations Workspace",
    subtitle: "Manage Jobs and Trips from scheduling through delivery.",
    search: "Search NQ reference, customer, or mobile",
    all: "All statuses",
    empty: "No matching Jobs.",
    trips: "Trips",
    attention: "Needs attention",
  },
};

export function JobInbox({ locale, page }: { locale: AppLocale; page: OperationsInboxPage }) {
  const t = labels[locale];
  return (
    <>
      <div className="mb-7">
        <h1 className="text-3xl font-black">{t.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.subtitle}</p>
      </div>
      <form className="mb-6 grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-[1fr_15rem_auto]">
        <input className="min-h-11 rounded-md border px-3" name="search" placeholder={t.search} />
        <select className="min-h-11 rounded-md border px-3" name="status">
          <option value="">{t.all}</option>
          {[
            "unscheduled",
            "scheduled",
            "in_progress",
            "awaiting_customer_confirmation",
            "completed",
            "cancelled",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button className="min-h-11 rounded-md bg-primary px-5 font-bold text-primary-foreground">
          {locale === "ar" ? "تصفية" : "Filter"}
        </button>
      </form>
      <div className="grid gap-4">
        {page.items.length === 0 ? (
          <p className="rounded-lg border bg-card p-8 text-center">{t.empty}</p>
        ) : (
          page.items.map((job) => (
            <Link
              className="rounded-lg border bg-card p-5 transition hover:border-primary"
              href={`/operations/jobs/${job.id}`}
              key={job.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="font-mono text-primary">{job.reference_number}</strong>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold">
                      {job.status}
                    </span>
                    {job.attention_required && (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                        {t.attention}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-2 text-lg font-black">{job.customer_name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {locale === "ar" ? job.service_name_ar : job.service_name_en} ·{" "}
                    {locale === "ar" ? job.pickup_city_ar : job.pickup_city_en}
                  </p>
                </div>
                <div className="text-end text-sm">
                  <p>{job.job_number}</p>
                  <p className="mt-1 font-bold">
                    {job.trip_count} {t.trips}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
