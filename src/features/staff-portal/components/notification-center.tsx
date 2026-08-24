"use client";

import { Bell } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  loadNotificationsAction,
  markNotificationsReadAction,
} from "@/features/staff-portal/actions/staff-portal.actions";
import type { PortalNotification } from "@/features/staff-portal/types/staff-portal";
import { Link } from "@/i18n/navigation";

export function NotificationCenter({
  count,
  label,
  markAllLabel,
}: {
  count: number;
  label: string;
  markAllLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PortalNotification[]>([]);
  const [pending, startTransition] = useTransition();
  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) startTransition(async () => setItems(await loadNotificationsAction()));
  }
  function markAll() {
    startTransition(async () => {
      await markNotificationsReadAction();
      setItems((current) => current.map((item) => ({ ...item, is_read: true })));
    });
  }
  return (
    <div className="relative">
      <Button aria-label={label} onClick={toggle} size="icon" variant="outline">
        <Bell className="size-4" />
        <span className="sr-only">{count}</span>
      </Button>
      {open ? (
        <div className="absolute end-0 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-md border bg-card p-3 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <strong>{label}</strong>
            <Button disabled={pending} onClick={markAll} size="sm" variant="ghost">
              {markAllLabel}
            </Button>
          </div>
          <div className="mt-2 max-h-80 overflow-auto">
            {items.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">—</p>
            ) : (
              items.map((item) => (
                <Link
                  className={`block border-b p-3 text-sm last:border-0 ${item.is_read ? "text-muted-foreground" : "font-bold"}`}
                  href={item.path as never}
                  key={item.id}
                >
                  {item.reference_number ? `${item.reference_number} · ` : ""}
                  {item.event_key}
                </Link>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
