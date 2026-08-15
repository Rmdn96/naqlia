import { ShieldCheck } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { RolePermissionItem } from "@/features/staff-portal/types/administration";
import type { AppLocale } from "@/i18n/routing";

export function RolesPermissionsView({
  items,
  locale,
}: {
  items: RolePermissionItem[];
  locale: AppLocale;
}) {
  const ar = locale === "ar";
  return (
    <div>
      <h1 className="flex items-center gap-2 text-3xl font-black">
        <ShieldCheck className="size-7" />
        {ar ? "الأدوار والصلاحيات" : "Roles & Permissions"}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {ar
          ? "عرض للهيكل المعتمد فقط. لا يتضمن هذا الإصدار إنشاء أدوار مخصصة."
          : "Read-only view of the approved model. Custom role editing is not part of v1."}
      </p>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {items.map((role) => (
          <Card className="p-5" key={role.role_key}>
            <h2 className="text-xl font-black">{ar ? role.name_ar : role.name_en}</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {role.permissions.map((permission) => (
                <li className="rounded bg-muted px-3 py-2" key={permission}>
                  {permission}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
