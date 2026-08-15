import {
  BadgeCheck,
  BriefcaseBusiness,
  FileText,
  Link2,
  PackageCheck,
  UserRound,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  claimCustomerRequestAction,
  openAccountTrackingAction,
  updateCustomerAccountAction,
} from "@/features/customer-account/actions/customer-account.actions";
import type { CustomerAccountDashboard } from "@/features/customer-account/types/customer-account";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils/cn";

export function CustomerAccountView({
  dashboard,
  isStaff,
  locale,
  result,
}: {
  dashboard: CustomerAccountDashboard;
  isStaff: boolean;
  locale: AppLocale;
  result?: string;
}) {
  const ar = locale === "ar";
  const activeOrders = dashboard.orders.filter(
    (order) => !["completed", "cancelled"].includes(order.execution_status),
  );
  const completedOrders = dashboard.orders.filter(
    (order) => order.execution_status === "completed",
  );
  return (
    <main className="container py-10" id="main-content">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black text-primary">
            {ar ? "حساب العميل" : "Customer Account"}
          </p>
          <h1 className="mt-1 text-3xl font-black">{ar ? "حسابي في نقلك" : "My Naqlk account"}</h1>
        </div>
        {isStaff ? (
          <Link className={buttonVariants({ variant: "outline" })} href="/dashboard">
            <BriefcaseBusiness className="size-4" />
            {ar ? "لوحة العمل" : "Work Dashboard"}
          </Link>
        ) : null}
      </div>
      {result ? (
        <p className="mt-5 rounded-md border bg-card p-3 text-sm" role="status">
          {result === "profile_updated"
            ? ar
              ? "تم تحديث الملف الشخصي."
              : "Profile updated."
            : result === "claim_linked"
              ? ar
                ? "تم ربط الطلب بحسابك."
                : "Request linked to your account."
              : ar
                ? "تعذر التحقق من الرابط الآمن."
                : "The secure link could not be verified."}
        </p>
      ) : null}
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-xl font-black">
            <UserRound className="size-5" />
            {ar ? "الملف الشخصي" : "Profile"}
          </h2>
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            <p>{dashboard.profile.email}</p>
            <p className="flex items-center gap-1">
              <BadgeCheck className="size-4" />
              {dashboard.profile.email_verified
                ? ar
                  ? "بريد موثق"
                  : "Verified email"
                : ar
                  ? "بانتظار التحقق"
                  : "Pending verification"}
            </p>
          </div>
          <form action={updateCustomerAccountAction.bind(null, locale)} className="mt-5 space-y-4">
            <Input
              defaultValue={dashboard.profile.display_name ?? ""}
              maxLength={120}
              name="displayName"
              placeholder={ar ? "الاسم" : "Name"}
              required
            />
            <Input
              defaultValue={dashboard.profile.mobile_number ?? ""}
              inputMode="tel"
              name="mobile"
              placeholder={ar ? "الجوال (اختياري)" : "Mobile (optional)"}
            />
            <Button type="submit">{ar ? "حفظ" : "Save"}</Button>
          </form>
        </Card>
        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-xl font-black">
            <Link2 className="size-5" />
            {ar ? "ربط طلب ضيف" : "Link a Guest request"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {ar
              ? "الصق رابط عرض السعر أو التتبع الآمن. رقم NQ أو بيانات التواصل وحدها لا تكفي للربط."
              : "Paste a secure quotation or tracking link. An NQ reference or contact details alone can never claim a request."}
          </p>
          <form action={claimCustomerRequestAction.bind(null, locale)} className="mt-5 space-y-4">
            <Input
              autoComplete="off"
              name="secureUrl"
              placeholder="https://…/track/…"
              required
              type="url"
            />
            <Button type="submit">{ar ? "تحقق واربط" : "Verify and link"}</Button>
          </form>
        </Card>
      </section>
      <AccountSection icon={FileText} title={ar ? "طلباتي" : "My Requests"}>
        <AccountTable
          rows={dashboard.requests.map((item) => [
            item.reference_number,
            locale === "ar" ? item.service_name_ar : item.service_name_en,
            item.status,
          ])}
        />
      </AccountSection>
      <AccountSection icon={FileText} title={ar ? "عروض الأسعار" : "Quotations"}>
        <AccountTable
          rows={dashboard.quotations.map((item) => [
            `${item.quotation_number} v${item.revision_number}`,
            item.reference_number,
            item.status,
          ])}
        />
      </AccountSection>
      <AccountSection icon={PackageCheck} title={ar ? "الطلبات النشطة" : "Active Orders"}>
        <AccountTable
          rows={activeOrders.map((item) => [
            item.order_number,
            item.reference_number,
            item.job_status ?? item.execution_status,
          ])}
        />
      </AccountSection>
      <AccountSection icon={PackageCheck} title={ar ? "الطلبات المكتملة" : "Completed Orders"}>
        <AccountTable
          rows={completedOrders.map((item) => [
            item.order_number,
            item.reference_number,
            item.review_submitted
              ? ar
                ? "تم التقييم"
                : "Reviewed"
              : ar
                ? "متاح للتقييم"
                : "Review available",
          ])}
        />
      </AccountSection>
      {dashboard.orders.some((order) => order.job_id) ? (
        <section className="mt-8">
          <h2 className="text-xl font-black">{ar ? "التتبع والتقييم" : "Tracking & Reviews"}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {dashboard.orders
              .filter((order) => order.job_id)
              .map((order) => (
                <Card className="flex items-center justify-between gap-4 p-4" key={order.id}>
                  <span>
                    <strong className="block">{order.reference_number}</strong>
                    <span className="text-sm text-muted-foreground">{order.job_number}</span>
                  </span>
                  <form action={openAccountTrackingAction.bind(null, locale)}>
                    <input name="job" type="hidden" value={order.job_id ?? ""} />
                    <Button size="sm" type="submit">
                      {order.review_available
                        ? ar
                          ? "التتبع أو التقييم"
                          : "Track or review"
                        : ar
                          ? "فتح التتبع"
                          : "Open tracking"}
                    </Button>
                  </form>
                </Card>
              ))}
          </div>
        </section>
      ) : null}
      <div className="mt-8">
        <Link className={cn(buttonVariants(), "w-full sm:w-auto")} href="/request">
          {ar ? "إنشاء طلب جديد كضيف أو عميل" : "Create a new Guest or account request"}
        </Link>
      </div>
    </main>
  );
}

function AccountSection({
  children,
  icon: Icon,
  title,
}: {
  children: React.ReactNode;
  icon: typeof FileText;
  title: string;
}) {
  return (
    <section className="mt-8">
      <h2 className="flex items-center gap-2 text-xl font-black">
        <Icon className="size-5" />
        {title}
      </h2>
      <Card className="mt-4 overflow-hidden">{children}</Card>
    </section>
  );
}

function AccountTable({ rows }: { rows: string[][] }) {
  if (rows.length === 0) return <p className="p-6 text-sm text-muted-foreground">—</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] text-sm">
        <tbody>
          {rows.map((row) => (
            <tr className="border-b last:border-0" key={row.join(":")}>
              {row.map((cell) => (
                <td className="p-4" key={cell}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
