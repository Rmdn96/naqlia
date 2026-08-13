import {
  completeJobAction,
  conditionTripAction,
  createTripAction,
  issueTrackingAction,
  scheduleTripAction,
  transitionTripAction,
} from "@/features/operations/actions/operations.actions";
import type { OperationsJobDetail } from "@/features/operations/types/operations";
import type { AppLocale } from "@/i18n/routing";

export function JobDetail({ detail, locale }: { detail: OperationsJobDetail; locale: AppLocale }) {
  const ar = locale === "ar";
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono font-black text-primary">{detail.lead.reference_number}</p>
          <h1 className="mt-1 text-3xl font-black">
            {ar ? "الوظيفة التشغيلية" : "Operational Job"} {detail.job.job_number}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {detail.lead.customer_name} · {detail.lead.mobile_number}
          </p>
        </div>
        <span className="rounded-full border bg-card px-4 py-2 text-sm font-black">
          {detail.job.status}
        </span>
      </header>
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-lg border bg-card p-5">
          <h2 className="font-black">
            {ar ? "السياق التجاري (للقراءة فقط)" : "Commercial context (read only)"}
          </h2>
          <p className="mt-3">{ar ? detail.lead.service_name_ar : detail.lead.service_name_en}</p>
          <p className="mt-2 text-2xl font-black">
            {detail.order.total_amount} {detail.order.currency}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {detail.quotation.quotation_number} v{detail.quotation.revision_number}
          </p>
        </article>
        <article className="rounded-lg border bg-card p-5">
          <h2 className="font-black">{ar ? "الاستلام" : "Pickup"}</h2>
          <p className="mt-3 text-sm">{detail.pickup.formatted_address}</p>
        </article>
        <article className="rounded-lg border bg-card p-5">
          <h2 className="font-black">{ar ? "التسليم" : "Delivery"}</h2>
          <p className="mt-3 text-sm">{detail.delivery.formatted_address}</p>
        </article>
      </section>
      <section className="rounded-lg border bg-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">{ar ? "الرحلات" : "Trips"}</h2>
            <p className="text-sm text-muted-foreground">
              {ar
                ? "يمكن للوظيفة الواحدة احتواء عدة رحلات."
                : "One Job can contain multiple Trips."}
            </p>
          </div>
          <form action={createTripAction.bind(null, detail.job.id, locale)}>
            <button className="min-h-11 rounded-md bg-primary px-4 font-bold text-primary-foreground">
              {ar ? "إضافة رحلة" : "Add Trip"}
            </button>
          </form>
        </div>
        <div className="mt-5 grid gap-4">
          {detail.trips.map((trip) => (
            <article className="rounded-md border p-4" key={trip.id}>
              <div className="flex justify-between gap-3">
                <h3 className="font-black">
                  {ar ? "رحلة" : "Trip"} {trip.trip_number}
                </h3>
                <span className="text-sm font-bold">{trip.status}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {ar ? "العمال" : "Workers"}: {trip.workers_count} · {ar ? "الحالة" : "Condition"}:{" "}
                {trip.condition}
              </p>
              <details className="mt-4">
                <summary className="cursor-pointer font-bold">
                  {ar ? "الجدولة والتعيين" : "Schedule and assign"}
                </summary>
                <form
                  action={scheduleTripAction.bind(null, detail.job.id, trip.id, locale)}
                  className="mt-3 grid gap-3 md:grid-cols-2"
                >
                  {[
                    ["pickupStart", ar ? "بداية الاستلام" : "Pickup start"],
                    ["pickupEnd", ar ? "نهاية الاستلام" : "Pickup end"],
                    ["deliveryStart", ar ? "بداية التسليم" : "Delivery start"],
                    ["deliveryEnd", ar ? "نهاية التسليم" : "Delivery end"],
                  ].map(([name, label]) => (
                    <label className="text-sm font-bold" key={name}>
                      {label}
                      <input
                        className="mt-1 min-h-11 w-full rounded-md border px-3"
                        name={name}
                        type="datetime-local"
                        required
                      />
                    </label>
                  ))}
                  <select className="min-h-11 rounded-md border px-3" name="driverId">
                    <option value="">{ar ? "السائق" : "Driver"}</option>
                    {detail.resources.drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.display_name}
                      </option>
                    ))}
                  </select>
                  <select className="min-h-11 rounded-md border px-3" name="vehicleId">
                    <option value="">{ar ? "المركبة" : "Vehicle"}</option>
                    {detail.resources.vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.vehicle_type} · {v.plate_number}
                      </option>
                    ))}
                  </select>
                  <input
                    className="min-h-11 rounded-md border px-3"
                    defaultValue={trip.workers_count}
                    max="100"
                    min="0"
                    name="workersCount"
                    type="number"
                  />
                  <input
                    className="min-h-11 rounded-md border px-3"
                    name="reason"
                    placeholder={ar ? "سبب التغيير/التجاوز" : "Change/override reason"}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input name="override" type="checkbox" />
                    {ar ? "تأكيد تجاوز تعارض" : "Confirm conflict override"}
                  </label>
                  <button className="min-h-11 rounded-md bg-primary px-4 font-bold text-primary-foreground">
                    {ar ? "حفظ" : "Save"}
                  </button>
                </form>
              </details>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <form
                  action={transitionTripAction.bind(null, detail.job.id, trip.id, locale)}
                  className="flex gap-2"
                >
                  <select className="min-h-11 flex-1 rounded-md border px-2" name="status">
                    {[
                      "confirmed",
                      "en_route_pickup",
                      "loading",
                      "in_transit",
                      "arrived",
                      "delivered",
                      "cancelled",
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <button className="rounded-md border px-3 font-bold">
                    {ar ? "تحديث" : "Update"}
                  </button>
                </form>
                <form
                  action={conditionTripAction.bind(null, detail.job.id, trip.id, locale)}
                  className="grid gap-2"
                >
                  <select className="min-h-11 rounded-md border px-2" name="condition">
                    {["normal", "delayed", "paused", "operational_issue"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <input
                    className="min-h-11 rounded-md border px-2"
                    name="reason"
                    placeholder={ar ? "السبب الداخلي" : "Internal reason"}
                  />
                  <button className="rounded-md border px-3 py-2 font-bold">
                    {ar ? "حفظ الحالة" : "Save condition"}
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="flex flex-wrap gap-3 rounded-lg border bg-card p-5">
        <form action={issueTrackingAction.bind(null, detail.job.id, locale)}>
          <button className="min-h-11 rounded-md border px-4 font-bold">
            {ar ? "إصدار/تدوير رابط التتبع" : "Issue/rotate tracking link"}
          </button>
        </form>
        {detail.job.status === "awaiting_customer_confirmation" && (
          <form
            action={completeJobAction.bind(null, detail.job.id, locale)}
            className="flex flex-wrap gap-2"
          >
            <input
              className="min-h-11 rounded-md border px-3"
              minLength={8}
              name="reason"
              placeholder={ar ? "سبب الإكمال اليدوي" : "Manual completion reason"}
              required
            />
            <button className="rounded-md bg-primary px-4 font-bold text-primary-foreground">
              {ar ? "إكمال يدوي" : "Manual complete"}
            </button>
          </form>
        )}
      </section>
      <section className="rounded-lg border bg-card p-5">
        <h2 className="text-xl font-black">{ar ? "سجل النشاط" : "Activity Timeline"}</h2>
        <ol className="mt-4 space-y-3 border-s ps-5">
          {detail.activity.map((item) => (
            <li key={item.id}>
              <p className="font-bold">{item.event_key}</p>
              <p className="text-xs text-muted-foreground">
                {new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-SA", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Asia/Riyadh",
                }).format(new Date(item.occurred_at))}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
