"use client";

import React from "react";
import { Armchair, Boxes, Building2, Route, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { FieldError } from "@/features/public-request/components/field-error";
import type {
  PublicRequestCatalog,
  PublicRequestDraft,
} from "@/features/public-request/types/public-request";
import { cn } from "@/utils/cn";

const SERVICE_ICONS = {
  furniture_moving: Armchair,
  general_cargo_transport: Boxes,
  intercity_transport: Route,
  local_transport: Building2,
};

type ServiceStepProps = {
  catalog: PublicRequestCatalog;
  draft: PublicRequestDraft;
  error?: string;
  onChange: (draft: PublicRequestDraft) => void;
};

export function ServiceStep({ catalog, draft, error, onChange }: ServiceStepProps) {
  const t = useTranslations("Request");
  const eligibleOptions = catalog.options.filter(
    (option) => option.serviceId === null || option.serviceId === draft.serviceId,
  );

  return (
    <fieldset aria-describedby={error ? "service-error" : undefined}>
      <legend className="sr-only">{t("step1Title")}</legend>
      <div className="grid gap-4 md:grid-cols-2">
        {catalog.services.map((service) => {
          const Icon = SERVICE_ICONS[service.key as keyof typeof SERVICE_ICONS] ?? Boxes;
          const selected = draft.serviceId === service.id;

          return (
            <label
              className={cn(
                "relative flex min-h-40 cursor-pointer flex-col rounded-lg border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-soft",
                selected && "border-primary bg-primary/[0.04] ring-2 ring-primary/15",
              )}
              key={service.id}
            >
              <input
                checked={selected}
                className="peer sr-only"
                name="service"
                onChange={() =>
                  onChange({
                    ...draft,
                    selectedOptionIds: [],
                    serviceId: service.id,
                  })
                }
                type="radio"
                value={service.id}
              />
              <span
                aria-hidden="true"
                className="grid size-11 place-items-center rounded-md bg-secondary text-primary"
              >
                <Icon className="size-5" />
              </span>
              <span className="mt-4 font-black">{service.name}</span>
              <span className="mt-2 text-sm leading-6 text-muted-foreground">
                {service.description}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "absolute end-4 top-4 size-5 rounded-full border-2 border-input bg-card",
                  selected && "border-[6px] border-primary",
                )}
              />
            </label>
          );
        })}
      </div>
      <FieldError id="service-error" message={error} />

      {draft.serviceId ? (
        <div className="mt-8 border-t border-border pt-7">
          <div className="flex items-center gap-2">
            <Sparkles aria-hidden="true" className="size-5 text-accent" />
            <h3 className="font-black">{t("optionalServices")}</h3>
            <span className="text-xs font-semibold text-muted-foreground">({t("optional")})</span>
          </div>
          {eligibleOptions.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {eligibleOptions.map((option) => {
                const checked = draft.selectedOptionIds.includes(option.id);

                return (
                  <label
                    className={cn(
                      "flex min-h-11 cursor-pointer items-center gap-3 rounded-full border bg-card px-4 py-2 text-sm font-bold transition hover:border-primary/40",
                      checked && "border-primary bg-primary text-primary-foreground",
                    )}
                    key={option.id}
                  >
                    <input
                      checked={checked}
                      className="sr-only"
                      onChange={() =>
                        onChange({
                          ...draft,
                          selectedOptionIds: checked
                            ? draft.selectedOptionIds.filter((id) => id !== option.id)
                            : [...draft.selectedOptionIds, option.id],
                        })
                      }
                      type="checkbox"
                    />
                    <span aria-hidden="true">{checked ? "✓" : "+"}</span>
                    {option.name}
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">{t("noOptions")}</p>
          )}
        </div>
      ) : null}
    </fieldset>
  );
}
