"use client";

import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/features/public-request/components/field-error";
import type { PublicRequestDraft } from "@/features/public-request/types/public-request";

type ContactStepProps = {
  contact: PublicRequestDraft["contact"];
  errors: Record<string, string | undefined>;
  onChange: (contact: PublicRequestDraft["contact"]) => void;
};

export function ContactStep({ contact, errors, onChange }: ContactStepProps) {
  const t = useTranslations("Request");

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div>
        <Label htmlFor="full-name">
          {t("fullName")} <span className="text-destructive">*</span>
        </Label>
        <Input
          aria-describedby={errors.fullName ? "full-name-error" : undefined}
          aria-invalid={Boolean(errors.fullName)}
          autoComplete="name"
          className="mt-2"
          id="full-name"
          maxLength={150}
          onChange={(event) => onChange({ ...contact, fullName: event.target.value })}
          placeholder={t("fullNamePlaceholder")}
          value={contact.fullName}
        />
        <FieldError id="full-name-error" message={errors.fullName} />
      </div>
      <div>
        <Label htmlFor="mobile">
          {t("mobile")} <span className="text-destructive">*</span>
        </Label>
        <Input
          aria-describedby={errors.mobile ? "mobile-error" : undefined}
          aria-invalid={Boolean(errors.mobile)}
          autoComplete="tel"
          className="mt-2 text-start"
          dir="ltr"
          id="mobile"
          inputMode="tel"
          maxLength={20}
          onChange={(event) => onChange({ ...contact, mobile: event.target.value })}
          placeholder={t("mobilePlaceholder")}
          value={contact.mobile}
        />
        <FieldError id="mobile-error" message={errors.mobile} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="email">
          {t("email")}{" "}
          <span className="text-xs font-medium text-muted-foreground">({t("optional")})</span>
        </Label>
        <Input
          aria-describedby={errors.email ? "email-error" : undefined}
          aria-invalid={Boolean(errors.email)}
          autoComplete="email"
          className="mt-2 text-start"
          dir="ltr"
          id="email"
          maxLength={254}
          onChange={(event) => onChange({ ...contact, email: event.target.value })}
          placeholder={t("emailPlaceholder")}
          type="email"
          value={contact.email}
        />
        <FieldError id="email-error" message={errors.email} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="notes">
          {t("notes")}{" "}
          <span className="text-xs font-medium text-muted-foreground">({t("optional")})</span>
        </Label>
        <Textarea
          className="mt-2"
          id="notes"
          maxLength={3000}
          onChange={(event) => onChange({ ...contact, notes: event.target.value })}
          placeholder={t("notesPlaceholder")}
          value={contact.notes}
        />
      </div>
    </div>
  );
}
