import { getWhatsAppHref } from "@/config/site";
import {
  confirmReceiptAction,
  requestCancellationAction,
} from "@/features/operations/actions/operations.actions";
import type { TrackingPayload } from "@/features/operations/types/operations";
import { CustomerReviewForm } from "@/features/reviews-quality/components/customer-review-form";
import type { CustomerReviewContext } from "@/features/reviews-quality/types/reviews-quality";
import type { AppLocale } from "@/i18n/routing";
import type { PublicBusinessConfiguration } from "@/lib/business-settings/public-settings";

export function TrackingView({
  business,
  data,
  locale,
  reviewContext,
  token,
}: {
  business: PublicBusinessConfiguration;
  data: TrackingPayload;
  locale: AppLocale;
  reviewContext: CustomerReviewContext | null;
  token: string;
}) {
  const ar = locale === "ar";
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <p className="font-mono font-black text-primary">{data.lead.reference_number}</p>
      <h1 className="mt-2 text-3xl font-black">{ar ? "تتبع طلبك" : "Track your order"}</h1>
      <p className="mt-3 text-muted-foreground">
        {ar ? data.lead.service_name_ar : data.lead.service_name_en}
      </p>
      <section className="mt-7 rounded-lg border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-black">{ar ? "حالة التنفيذ" : "Execution status"}</h2>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
            {data.job.status}
          </span>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">{ar ? "الاستلام" : "Pickup"}</p>
            <p>{data.pickup.formatted_address}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{ar ? "التسليم" : "Delivery"}</p>
            <p>{data.delivery.formatted_address}</p>
          </div>
        </div>
      </section>
      <section className="mt-5 space-y-3">
        {data.trips.map((trip, index) => {
          const driver =
            trip.driver && typeof trip.driver === "object" && !Array.isArray(trip.driver)
              ? (trip.driver as { display_name?: string; mobile_number?: string })
              : null;
          const vehicle =
            trip.vehicle && typeof trip.vehicle === "object" && !Array.isArray(trip.vehicle)
              ? (trip.vehicle as { plate_number?: string; vehicle_type?: string })
              : null;
          const driverDigits = driver?.mobile_number?.replace(/\D/g, "");
          return (
            <article
              className="rounded-lg border bg-card p-5"
              key={String(trip.trip_number ?? index)}
            >
              <div className="flex justify-between">
                <strong>
                  {ar ? "رحلة" : "Trip"} {String(trip.trip_number)}
                </strong>
                <span>{String(trip.status)}</span>
              </div>
              {trip.condition !== "normal" && (
                <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
                  {String(
                    ar
                      ? (trip.customer_message_ar ??
                          "يوجد تحديث على تنفيذ طلبك، وفريق نقلك يتابع الأمر.")
                      : (trip.customer_message_en ??
                          "There is an update to your delivery. The Naqlk team is following up."),
                  )}
                </p>
              )}
              {(driver || vehicle) && (
                <div className="mt-4 rounded-md bg-secondary p-4">
                  <p className="font-bold">{ar ? "فريق الرحلة الحالي" : "Current Trip team"}</p>
                  {driver?.display_name && (
                    <p className="mt-2 text-sm">
                      {ar ? "السائق" : "Driver"}: {driver.display_name}
                    </p>
                  )}
                  {vehicle?.vehicle_type && (
                    <p className="mt-1 text-sm">
                      {ar ? "المركبة" : "Vehicle"}: {vehicle.vehicle_type}
                      {vehicle.plate_number ? ` · ${vehicle.plate_number}` : ""}
                    </p>
                  )}
                  {driverDigits && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        className="rounded-md border px-3 py-2 text-sm font-bold"
                        href={`tel:+${driverDigits}`}
                      >
                        {ar ? "اتصال بالسائق" : "Call Driver"}
                      </a>
                      <a
                        className="rounded-md border px-3 py-2 text-sm font-bold"
                        href={`https://wa.me/${driverDigits}`}
                        rel="noreferrer"
                      >
                        {ar ? "واتساب السائق" : "WhatsApp Driver"}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </section>
      <a
        className="mt-7 inline-flex min-h-12 items-center rounded-md bg-emerald-600 px-5 font-bold text-white"
        href={getWhatsAppHref(
          ar
            ? `مرحباً نقلك، أحتاج مساعدة بخصوص الطلب ${data.lead.reference_number}`
            : `Hello Naqlk, I need help with request ${data.lead.reference_number}`,
          business.whatsappNumber,
        )}
        rel="noreferrer"
      >
        {ar ? "تواصل مع نقلك" : "Contact Naqlk"}
      </a>
      {data.job.status === "awaiting_customer_confirmation" && (
        <form action={confirmReceiptAction.bind(null, token, locale)} className="mt-5">
          <button className="min-h-12 rounded-md bg-primary px-5 font-bold text-primary-foreground">
            {ar ? "تأكيد الاستلام" : "Confirm receipt"}
          </button>
        </form>
      )}
      {!(["completed", "cancelled"] as string[]).includes(data.job.status) &&
        data.cancellation_status !== "pending" && (
          <form
            action={requestCancellationAction.bind(null, token, locale)}
            className="mt-5 rounded-lg border p-4"
          >
            <label className="text-sm font-bold">
              {ar ? "سبب طلب الإلغاء (اختياري)" : "Cancellation reason (optional)"}
              <textarea
                className="mt-2 min-h-20 w-full rounded-md border p-3"
                maxLength={500}
                name="reason"
              />
            </label>
            <button className="mt-3 min-h-11 rounded-md border px-4 font-bold">
              {ar ? "طلب إلغاء" : "Request cancellation"}
            </button>
          </form>
        )}
      {data.job.status === "completed" && reviewContext && (
        <CustomerReviewForm
          context={reviewContext}
          googleReviewUrl={business.googleReviewUrl}
          locale={locale}
          token={token}
        />
      )}
    </main>
  );
}
