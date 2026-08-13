import type { QualityInboxPage } from "@/features/reviews-quality/types/reviews-quality";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

export function QualityInbox({ locale, page }: { locale: AppLocale; page: QualityInboxPage }) {
  const ar = locale === "ar";
  return (
    <section aria-labelledby="quality-inbox-heading">
      <header>
        <p className="text-sm font-black uppercase tracking-wide text-primary">
          {ar ? "إدارة الجودة" : "Quality Management"}
        </p>
        <h1 className="mt-1 text-3xl font-black" id="quality-inbox-heading">
          {ar ? "المراجعات وتنبيهات الجودة" : "Reviews and Quality Alerts"}
        </h1>
      </header>
      <form className="mt-6 grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-4">
        <select
          aria-label={ar ? "التقييم" : "Rating"}
          className="rounded-md border p-3"
          name="rating"
          defaultValue=""
        >
          <option value="">{ar ? "كل التقييمات" : "All ratings"}</option>
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>
              {rating} ★
            </option>
          ))}
        </select>
        <select
          aria-label={ar ? "حالة النشر" : "Publication status"}
          className="rounded-md border p-3"
          name="publication"
          defaultValue=""
        >
          <option value="">{ar ? "كل حالات النشر" : "All publication states"}</option>
          {["private", "pending_publication", "published", "unpublished"].map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          aria-label={ar ? "حالة التنبيه" : "Alert status"}
          className="rounded-md border p-3"
          name="alert"
          defaultValue=""
        >
          <option value="">{ar ? "كل التنبيهات" : "All alerts"}</option>
          {["open", "in_progress", "resolved"].map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button className="rounded-md bg-primary px-4 font-black text-primary-foreground">
          {ar ? "تطبيق" : "Apply"}
        </button>
      </form>
      <div className="mt-5 overflow-x-auto rounded-lg border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b bg-muted/50 text-start">
            <tr>
              {[
                ar ? "الطلب" : "Request",
                ar ? "العميل" : "Customer",
                ar ? "التقييم" : "Rating",
                ar ? "النشر" : "Publication",
                ar ? "الجودة" : "Quality",
                ar ? "التحديث" : "Updated",
              ].map((label) => (
                <th className="p-4 text-start" key={label}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {page.items.map((review) => (
              <tr className="border-b last:border-0" key={review.id}>
                <td className="p-4">
                  <Link
                    className="font-mono font-black text-primary"
                    href={`/quality/reviews/${review.id}`}
                  >
                    {review.reference_number}
                  </Link>
                  <div className="text-xs text-muted-foreground">{review.job_number}</div>
                </td>
                <td className="p-4">{review.customer_name}</td>
                <td className="p-4 font-black">{review.overall_rating} ★</td>
                <td className="p-4">
                  {review.publication_status}
                  {review.is_featured ? " · Featured" : ""}
                </td>
                <td className="p-4">{review.quality_alert_status ?? "—"}</td>
                <td className="p-4">
                  {new Intl.DateTimeFormat(ar ? "ar-SA" : "en-SA", { dateStyle: "medium" }).format(
                    new Date(review.updated_at),
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {page.items.length === 0 && (
          <p className="p-8 text-center text-muted-foreground">
            {ar ? "لا توجد مراجعات مطابقة." : "No matching reviews."}
          </p>
        )}
      </div>
    </section>
  );
}
