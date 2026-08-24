import { ClipboardList, Inbox } from "lucide-react";
import type { ReactNode } from "react";

import { StaffSignOutButton } from "@/features/staff-auth/components/staff-sign-out-button";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

type SalesShellProps = {
  children: ReactNode;
  inboxLabel: string;
  locale: AppLocale;
  signOutLabel: string;
  workspaceLabel: string;
};

export function SalesShell({
  children,
  inboxLabel,
  locale,
  signOutLabel,
  workspaceLabel,
}: SalesShellProps) {
  return (
    <main className="min-h-[70vh] bg-muted/30" id="main-content">
      <div className="border-b border-border bg-card">
        <div className="container flex min-h-16 flex-wrap items-center gap-x-6 gap-y-2 py-3">
          <div className="flex items-center gap-2 font-black text-foreground">
            <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
              <ClipboardList aria-hidden="true" className="size-5" />
            </span>
            <span>{workspaceLabel}</span>
          </div>
          <nav aria-label={workspaceLabel} className="flex items-center gap-1">
            <Link
              className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground"
              href="/sales/leads"
            >
              <Inbox aria-hidden="true" className="size-4" />
              {inboxLabel}
            </Link>
          </nav>
          <div className="ms-auto">
            <StaffSignOutButton label={signOutLabel} locale={locale} />
          </div>
        </div>
      </div>
      {children}
    </main>
  );
}
