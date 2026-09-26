"use client";

import { MessageCircleMore, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { getWhatsAppContactHref, type WhatsAppContact } from "@/config/site";
import { cn } from "@/utils/cn";

type Props = {
  closeLabel: string;
  contacts: readonly WhatsAppContact[];
  direction: "ltr" | "rtl";
  guidance: string;
  message: string;
  openLabel: string;
  showTriggerLabel?: boolean;
  title: string;
  triggerClassName?: string;
};

export function WhatsAppContactChooser({
  closeLabel,
  contacts,
  direction,
  guidance,
  message,
  openLabel,
  showTriggerLabel = false,
  title,
  triggerClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) {
        wasOpen.current = false;
        triggerRef.current?.focus();
      }
      return;
    }

    wasOpen.current = true;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={openLabel}
        className={cn(
          "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border bg-card text-foreground transition hover:border-primary hover:text-primary",
          triggerClassName,
        )}
        onClick={() => setOpen(true)}
        ref={triggerRef}
        type="button"
      >
        <MessageCircleMore aria-hidden="true" className="size-5 text-emerald-600" />
        {showTriggerLabel ? <span>{openLabel}</span> : null}
      </button>
      {open ? (
        <div
          aria-labelledby="whatsapp-contact-dialog-title"
          aria-describedby="whatsapp-contact-dialog-guidance"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-end bg-slate-950/45 p-0 sm:items-center sm:justify-center sm:p-4"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
          role="dialog"
        >
          <div
            className="w-full rounded-t-3xl bg-card p-6 text-card-foreground shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-7"
            dir={direction}
            ref={dialogRef}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black" id="whatsapp-contact-dialog-title">
                  {title}
                </h2>
                <p
                  className="mt-2 text-sm leading-7 text-muted-foreground"
                  id="whatsapp-contact-dialog-guidance"
                >
                  {guidance}
                </p>
              </div>
              <button
                aria-label={closeLabel}
                className="grid size-10 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                onClick={() => setOpen(false)}
                ref={closeRef}
                type="button"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <div className="mt-6 grid gap-3">
              {contacts.map((contact) => (
                <div
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background p-4"
                  key={contact.id}
                >
                  <span className="font-mono text-base font-bold tracking-wide" dir="ltr">
                    {contact.localNumber}
                  </span>
                  <a
                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-black text-white transition hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                    href={getWhatsAppContactHref(contact, message)}
                    onClick={() => setOpen(false)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <MessageCircleMore aria-hidden="true" className="size-5" />
                    {openLabel}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
