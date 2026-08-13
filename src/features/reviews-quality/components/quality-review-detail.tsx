import {
  setReviewPublicationAction,
  updateQualityAlertAction,
} from "@/features/reviews-quality/actions/reviews-quality.actions";
import type { QualityReviewDetail } from "@/features/reviews-quality/types/reviews-quality";
import type { AppLocale } from "@/i18n/routing";

export function QualityReviewDetailView({
  capabilities,
  detail,
  locale,
}: {
  capabilities: { canManageAlerts: boolean; canManagePublication: boolean };
  detail: QualityReviewDetail;
  locale: AppLocale;
}) {
  const ar = locale === "ar";
  const review = detail.review;
  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono font-black text-primary">{detail.lead.reference_number}</p>
        <h1 className="mt-1 text-3xl font-black">{ar ? "تفاصيل المراجعة" : "Review details"}</h1>
        <p className="mt-2 text-muted-foreground">
          {detail.lead.customer_name} · {detail.job.job_number}
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">{ar ? "التقييم العام" : "Overall rating"}</p>
          <p className="mt-2 text-4xl font-black">{review.overall_rating} ★</p>
        </article>
        <article className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">{ar ? "حالة النشر" : "Publication"}</p>
          <p className="mt-2 font-black">{review.publication_status}</p>
          <p className="mt-1 text-sm">
            {review.publication_consent
              ? ar
                ? "موافقة موجودة"
                : "Consent granted"
              : ar
                ? "لا توجد موافقة"
                : "No consent"}
          </p>
        </article>
        <article className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">{ar ? "الإبراز" : "Featured"}</p>
          <p className="mt-2 font-black">
            {review.is_featured ? (ar ? "مُبرز" : "Featured") : ar ? "غير مُبرز" : "Not featured"}
          </p>
        </article>
      </section>
      <section className="rounded-lg border bg-card p-5">
        <h2 className="font-black">{ar ? "تقييم الخدمة" : "Service feedback"}</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">{ar ? "الالتزام" : "Punctuality"}</dt>
            <dd>{review.punctuality_rating ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">{ar ? "العناية" : "Handling"}</dt>
            <dd>{review.handling_rating ?? "—"}</dd>
          </div>
        </dl>
        {review.comment && (
          <p className="mt-4 whitespace-pre-wrap rounded-md bg-secondary p-4">{review.comment}</p>
        )}
      </section>
      <section className="rounded-lg border bg-card p-5">
        <h2 className="font-black">{ar ? "تقييم السائقين" : "Driver ratings"}</h2>
        <div className="mt-3 space-y-2">
          {detail.driver_ratings.map((rating) => (
            <p key={rating.driver_id}>
              {rating.display_name}: <strong>{rating.rating} ★</strong>
            </p>
          ))}
          {detail.driver_ratings.length === 0 && <p className="text-muted-foreground">—</p>}
        </div>
      </section>
      {capabilities.canManagePublication && (
        <form
          action={setReviewPublicationAction.bind(null, review.id, locale)}
          className="rounded-lg border bg-card p-5"
        >
          <h2 className="font-black">{ar ? "إدارة النشر" : "Publication controls"}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {["publish", "unpublish", "feature", "unfeature"].map((action) => (
              <button
                className="rounded-md border px-4 py-2 font-bold"
                key={action}
                name="action"
                value={action}
              >
                {action}
              </button>
            ))}
          </div>
        </form>
      )}
      {capabilities.canManageAlerts && detail.quality_alert && (
        <section className="rounded-lg border border-red-200 bg-card p-5">
          <h2 className="font-black text-red-700">
            {ar ? "تنبيه جودة" : "Quality Alert"} · {detail.quality_alert.status}
          </h2>
          <form
            action={updateQualityAlertAction.bind(null, review.id, detail.quality_alert.id, locale)}
            className="mt-4 grid gap-3"
          >
            <select
              className="rounded-md border p-3"
              defaultValue={detail.quality_alert.status}
              name="status"
            >
              {["open", "in_progress", "resolved"].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
            <textarea
              className="min-h-20 rounded-md border p-3"
              maxLength={2000}
              name="note"
              placeholder={ar ? "ملاحظة متابعة داخلية" : "Internal follow-up note"}
            />
            <textarea
              className="min-h-20 rounded-md border p-3"
              maxLength={2000}
              name="resolution"
              placeholder={
                ar ? "ملخص الحل (مطلوب عند الحل)" : "Resolution summary (required when resolving)"
              }
            />
            <button className="min-h-11 rounded-md bg-primary px-4 font-black text-primary-foreground">
              {ar ? "حفظ المتابعة" : "Save follow-up"}
            </button>
          </form>
          <div className="mt-5 space-y-3">
            {detail.quality_notes.map((note) => (
              <article className="rounded-md bg-secondary p-3" key={note.id}>
                <p>{note.note}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {note.actor_name} ·{" "}
                  {new Date(note.created_at).toLocaleString(ar ? "ar-SA" : "en-SA")}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
