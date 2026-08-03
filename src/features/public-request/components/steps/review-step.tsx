"use client";

import { CheckCircle2, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/features/public-request/components/field-error";
import type { SelectedPhoto } from "@/features/public-request/components/steps/cargo-step";
import type {
  PublicRequestCatalog,
  PublicRequestDraft,
} from "@/features/public-request/types/public-request";
import { Link } from "@/i18n/navigation";

type ReviewSectionProps = {
  children: React.ReactNode;
  onEdit: () => void;
  title: string;
};

function ReviewSection({ children, onEdit, title }: ReviewSectionProps) {
  const t = useTranslations("Request");

  return (
    <section className="rounded-lg border border-border bg-muted/35 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-black">{title}</h3>
        <Button onClick={onEdit} size="sm" type="button" variant="ghost">
          <Pencil aria-hidden="true" className="size-4" />
          {t("edit")}
        </Button>
      </div>
      <div className="mt-3 text-sm leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}

type ReviewStepProps = {
  catalog: PublicRequestCatalog;
  consentError?: string;
  draft: PublicRequestDraft;
  onConsentChange: (accepted: boolean) => void;
  onEdit: (step: number) => void;
  photos: SelectedPhoto[];
};

export function ReviewStep({
  catalog,
  consentError,
  draft,
  onConsentChange,
  onEdit,
  photos,
}: ReviewStepProps) {
  const t = useTranslations("Request");
  const service = catalog.services.find((item) => item.id === draft.serviceId);
  const optionNames = catalog.options
    .filter((option) => draft.selectedOptionIds.includes(option.id))
    .map((option) => option.name);
  const pickupCity = catalog.cities.find((city) => city.id === draft.pickup.cityId);
  const deliveryCity = catalog.cities.find((city) => city.id === draft.delivery.cityId);

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <ReviewSection onEdit={() => onEdit(1)} title={t("reviewService")}>
          <p className="font-bold text-foreground">{service?.name ?? t("noValue")}</p>
          <p>{optionNames.length > 0 ? optionNames.join("، ") : t("noValue")}</p>
        </ReviewSection>
        <ReviewSection onEdit={() => onEdit(2)} title={t("reviewRoute")}>
          <p>
            <span className="font-bold text-foreground">{t("pickup")}: </span>
            {pickupCity?.name}, {draft.pickup.formattedAddress}
          </p>
          <p>
            <span className="font-bold text-foreground">{t("delivery")}: </span>
            {deliveryCity?.name}, {draft.delivery.formattedAddress}
          </p>
        </ReviewSection>
        <ReviewSection onEdit={() => onEdit(3)} title={t("reviewCargo")}>
          <p className="font-bold text-foreground">{draft.cargoDescription}</p>
          <p>
            {t("quantity")}: {draft.quantity || t("noValue")}
          </p>
          <p>
            {t("reviewPhotos")}: {t("photoCount", { count: photos.length })}
          </p>
        </ReviewSection>
        <ReviewSection onEdit={() => onEdit(4)} title={t("reviewContact")}>
          <p className="font-bold text-foreground">{draft.contact.fullName}</p>
          <p>
            <bdi dir="ltr">{draft.contact.mobile}</bdi>
          </p>
          <p dir="auto">{draft.contact.email || t("noValue")}</p>
        </ReviewSection>
      </div>

      <div className="mt-6 rounded-lg border border-primary/25 bg-primary/[0.035] p-4 sm:p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            aria-describedby={consentError ? "consent-error" : "consent-hint"}
            aria-invalid={Boolean(consentError)}
            checked={draft.consentAccepted}
            className="mt-1 size-5 shrink-0 accent-primary"
            onChange={(event) => onConsentChange(event.target.checked)}
            type="checkbox"
          />
          <span className="text-sm font-semibold leading-7">
            {t("consent")}{" "}
            <Link
              className="font-black text-primary underline underline-offset-4"
              href="/privacy"
              target="_blank"
            >
              {t("privacyLink")}
            </Link>
          </span>
        </label>
        <FieldError id="consent-error" message={consentError} />
        <p
          className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground"
          id="consent-hint"
        >
          <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
          {t("submissionHint")}
        </p>
      </div>
    </div>
  );
}
