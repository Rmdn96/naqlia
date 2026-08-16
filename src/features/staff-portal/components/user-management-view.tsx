import { UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  cancelInvitationAction,
  changeStaffRoleAction,
  inviteStaffAction,
  resendInvitationAction,
  setStaffAccessAction,
} from "@/features/staff-portal/actions/administration.actions";
import type { UserListPayload } from "@/features/staff-portal/types/administration";
import { getAdministrationResultMessage } from "@/features/staff-portal/lib/invitation-status";
import type { AppLocale } from "@/i18n/routing";

const roles = ["super_admin", "sales", "operations", "finance", "customer_service"];

export function UserManagementView({
  locale,
  payload,
  query,
  result,
}: {
  locale: AppLocale;
  payload: UserListPayload;
  query: { role?: string; search?: string; status?: string };
  result?: string;
}) {
  const ar = locale === "ar";
  const resultMessage = getAdministrationResultMessage(locale, result);
  return (
    <div>
      <h1 className="flex items-center gap-2 text-3xl font-black">
        <Users className="size-7" />
        {ar ? "إدارة المستخدمين" : "User Management"}
      </h1>
      {resultMessage ? (
        <p className="mt-4 rounded-md border bg-card p-3 text-sm" role="status">
          {resultMessage}
        </p>
      ) : null}
      <Card className="mt-6 p-5">
        <form className="grid gap-3 md:grid-cols-4" method="get">
          <Input
            defaultValue={query.search}
            name="search"
            placeholder={ar ? "بحث بالاسم أو البريد" : "Search name or email"}
          />
          <select
            className="h-10 rounded-md border bg-background px-3"
            defaultValue={query.role ?? ""}
            name="role"
          >
            <option value="">{ar ? "كل الأدوار" : "All roles"}</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border bg-background px-3"
            defaultValue={query.status ?? ""}
            name="status"
          >
            <option value="">{ar ? "كل الحالات" : "All statuses"}</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          <Button type="submit">{ar ? "تصفية" : "Filter"}</Button>
        </form>
      </Card>
      <Card className="mt-8 p-5">
        <h2 className="flex items-center gap-2 text-xl font-black">
          <UserPlus className="size-5" />
          {ar ? "دعوة موظف" : "Invite employee"}
        </h2>
        <form
          action={inviteStaffAction.bind(null, locale)}
          className="mt-4 grid gap-3 md:grid-cols-4"
        >
          <Input name="name" placeholder={ar ? "الاسم" : "Name"} required />
          <Input name="email" placeholder="email@example.com" required type="email" />
          <select className="h-10 rounded-md border bg-background px-3" name="role">
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <Button type="submit">{ar ? "إرسال الدعوة" : "Send invitation"}</Button>
        </form>
      </Card>
      <Card className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[70rem] text-sm">
            <thead className="bg-muted">
              <tr>
                {[
                  ar ? "المستخدم" : "User",
                  ar ? "الدور" : "Role",
                  ar ? "الوصول" : "Access",
                  ar ? "الدعوة" : "Invitation",
                  ar ? "آخر دخول" : "Last login",
                  ar ? "إجراءات" : "Actions",
                ].map((h) => (
                  <th className="p-3 text-start" key={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payload.items.map((user) => (
                <tr className="border-t align-top" key={user.id}>
                  <td className="p-3">
                    <strong>{user.display_name ?? "—"}</strong>
                    <span className="block text-muted-foreground">{user.email}</span>
                  </td>
                  <td className="p-3">{user.role_key ?? "—"}</td>
                  <td className="p-3">{user.staff_access_status}</td>
                  <td className="p-3">{user.invitation_status ?? "—"}</td>
                  <td className="p-3">
                    {user.last_login_at
                      ? new Date(user.last_login_at).toLocaleString(ar ? "ar-SA" : "en-SA")
                      : "—"}
                  </td>
                  <td className="space-y-2 p-3">
                    <form action={changeStaffRoleAction.bind(null, locale)} className="flex gap-2">
                      <input name="profile" type="hidden" value={user.id} />
                      <select
                        className="h-9 rounded border bg-background px-2"
                        defaultValue={user.role_key ?? "sales"}
                        name="role"
                      >
                        {roles.map((role) => (
                          <option key={role}>{role}</option>
                        ))}
                      </select>
                      <Input
                        className="w-48"
                        name="reason"
                        placeholder={ar ? "سبب التغيير (مطلوب)" : "Change reason (required)"}
                        required
                      />
                      <Button size="sm">{ar ? "تغيير" : "Change"}</Button>
                    </form>
                    {user.role_key ? (
                      <form action={setStaffAccessAction.bind(null, locale)} className="flex gap-2">
                        <input name="profile" type="hidden" value={user.id} />
                        <input
                          name="active"
                          type="hidden"
                          value={user.staff_access_status === "active" ? "false" : "true"}
                        />
                        <Input
                          className="w-48"
                          name="reason"
                          placeholder={ar ? "سبب الإجراء (مطلوب)" : "Action reason (required)"}
                          required
                        />
                        <Button size="sm" variant="outline">
                          {user.staff_access_status === "active"
                            ? ar
                              ? "تعطيل"
                              : "Deactivate"
                            : ar
                              ? "إعادة تفعيل"
                              : "Reactivate"}
                        </Button>
                      </form>
                    ) : null}
                    {user.invitation_id && user.invitation_status === "pending" ? (
                      <>
                        <form action={resendInvitationAction.bind(null, locale)}>
                          <input name="invitation" type="hidden" value={user.invitation_id} />
                          <Button size="sm" variant="outline">
                            {ar ? "إعادة الإرسال" : "Resend"}
                          </Button>
                        </form>
                        <form
                          action={cancelInvitationAction.bind(null, locale)}
                          className="flex gap-2"
                        >
                          <input name="invitation" type="hidden" value={user.invitation_id} />
                          <Input
                            className="w-48"
                            name="reason"
                            placeholder={ar ? "سبب إلغاء الدعوة" : "Cancellation reason"}
                            required
                          />
                          <Button size="sm" variant="destructive">
                            {ar ? "إلغاء الدعوة" : "Cancel invite"}
                          </Button>
                        </form>
                      </>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
