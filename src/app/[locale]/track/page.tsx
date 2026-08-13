import type { Metadata } from "next";
import { recoverTrackingAction } from "@/features/operations/actions/operations.actions";
import type { AppLocale } from "@/i18n/routing";
export const metadata: Metadata = { robots: { follow: false, index: false } };
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const ar = locale === "ar";
  return (
    <main className="mx-auto min-h-[70vh] max-w-lg px-4 py-14">
      <h1 className="text-3xl font-black">{ar ? "تتبع طلبك" : "Track your order"}</h1>
      <p className="mt-3 text-muted-foreground">
        {ar
          ? "أدخل رقم الطلب ورقم الجوال لإصدار رابط تتبع آمن."
          : "Enter the request reference and mobile number to issue a secure tracking link."}
      </p>
      {query.error && (
        <p className="mt-5 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {ar ? "تعذر التحقق من البيانات." : "We could not verify those details."}
        </p>
      )}
      <form
        action={recoverTrackingAction.bind(null, locale)}
        className="mt-7 space-y-4 rounded-lg border bg-card p-5"
      >
        <label className="block font-bold">
          {ar ? "رقم الطلب" : "Request reference"}
          <input
            className="mt-2 min-h-12 w-full rounded-md border px-3"
            name="reference"
            placeholder="NQ-YYYYMM-000001"
            required
          />
        </label>
        <label className="block font-bold">
          {ar ? "رقم الجوال" : "Mobile number"}
          <input
            className="mt-2 min-h-12 w-full rounded-md border px-3"
            name="mobile"
            inputMode="tel"
            required
          />
        </label>
        <button className="min-h-12 w-full rounded-md bg-primary font-bold text-primary-foreground">
          {ar ? "متابعة آمنة" : "Continue securely"}
        </button>
      </form>
    </main>
  );
}
