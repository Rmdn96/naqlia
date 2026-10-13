"use client";

import { MessageCircleMore, Phone, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  CONTACT_NUMBERS,
  getContactTelephoneHref,
  getContactWhatsAppHref,
  type ContactNumber,
} from "@/config/contact";
import { cn } from "@/utils/cn";

type ContactNumberPickerProps = {
  message: string;
  allowCall?: boolean;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
};

export function ContactNumberPicker({
  allowCall = false,
  ariaLabel,
  children,
  className,
  message,
}: ContactNumberPickerProps) {
  const t = useTranslations("ContactPicker");
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) triggerRef.current?.focus();
  }, [open]);

  return (
    <>
      <button
        aria-haspopup="dialog"
        aria-label={ariaLabel}
        className={className}
        onClick={() => setOpen(true)}
        ref={triggerRef}
        type="button"
      >
        {children}
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/55 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            aria-labelledby="contact-number-picker-title"
            aria-modal="true"
            className="max-h-[min(90vh,34rem)] w-full max-w-md overflow-y-auto rounded-xl bg-card p-5 shadow-2xl sm:p-6"
            dir="auto"
            onMouseDown={(event) => event.stopPropagation()}
            ref={dialogRef}
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black" id="contact-number-picker-title">
                  {t("title")}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("description")}</p>
              </div>
              <Button
                aria-label={t("close")}
                onClick={() => setOpen(false)}
                ref={closeRef}
                size="icon"
                variant="ghost"
              >
                <X aria-hidden="true" className="size-5" />
              </Button>
            </div>
            {CONTACT_NUMBERS.length ? (
              <div className="mt-5 grid gap-3">
                {CONTACT_NUMBERS.map((contact) => (
                  <ContactOption
                    allowCall={allowCall}
                    contact={contact}
                    key={contact.id}
                    message={message}
                    onComplete={() => setOpen(false)}
                    t={t}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-5 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                {t("unavailable")}
              </p>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}

function ContactOption({
  allowCall,
  contact,
  message,
  onComplete,
  t,
}: {
  allowCall: boolean;
  contact: ContactNumber;
  message: string;
  onComplete: () => void;
  t: (key: string) => string;
}) {
  const whatsappHref = getContactWhatsAppHref(contact.phone, message);
  const telephoneHref = getContactTelephoneHref(contact.phone);
  return (
    <div className="rounded-lg border p-4">
      <p className="font-bold" dir="ltr">
        {contact.phone}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {whatsappHref ? (
          <a
            className={cn(buttonVariants({ size: "sm" }), "bg-emerald-600 hover:bg-emerald-700")}
            href={whatsappHref}
            onClick={onComplete}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircleMore aria-hidden="true" className="size-4" />
            {t("whatsapp")}
          </a>
        ) : null}
        {allowCall && telephoneHref ? (
          <a
            className={buttonVariants({ size: "sm", variant: "outline" })}
            href={telephoneHref}
            onClick={onComplete}
          >
            <Phone aria-hidden="true" className="size-4" />
            {t("call")}
          </a>
        ) : null}
      </div>
    </div>
  );
}
