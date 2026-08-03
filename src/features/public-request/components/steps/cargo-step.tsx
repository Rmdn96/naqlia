"use client";

import { ImagePlus, PackageOpen, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ChangeEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/features/public-request/components/field-error";

export type SelectedPhoto = {
  file: File;
  id: string;
};

type CargoStepProps = {
  cargoDescription: string;
  errors: Record<string, string | undefined>;
  fileError?: string;
  onCargoChange: (value: string) => void;
  onFilesChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onQuantityChange: (value: string) => void;
  onRemovePhoto: (id: string) => void;
  photos: SelectedPhoto[];
  quantity: string;
};

export function CargoStep({
  cargoDescription,
  errors,
  fileError,
  onCargoChange,
  onFilesChange,
  onQuantityChange,
  onRemovePhoto,
  photos,
  quantity,
}: CargoStepProps) {
  const t = useTranslations("Request");

  return (
    <div className="grid gap-7">
      <div>
        <Label htmlFor="cargo-description">
          {t("cargoDescription")} <span className="text-destructive">*</span>
        </Label>
        <Textarea
          aria-describedby={errors.cargoDescription ? "cargo-description-error" : undefined}
          aria-invalid={Boolean(errors.cargoDescription)}
          className="mt-2"
          id="cargo-description"
          maxLength={2000}
          onChange={(event) => onCargoChange(event.target.value)}
          placeholder={t("cargoPlaceholder")}
          value={cargoDescription}
        />
        <FieldError id="cargo-description-error" message={errors.cargoDescription} />
      </div>
      <div className="max-w-xs">
        <Label htmlFor="cargo-quantity">
          {t("quantity")}{" "}
          <span className="text-xs font-medium text-muted-foreground">({t("optional")})</span>
        </Label>
        <Input
          aria-describedby={errors.quantity ? "cargo-quantity-error" : undefined}
          aria-invalid={Boolean(errors.quantity)}
          className="mt-2"
          id="cargo-quantity"
          inputMode="numeric"
          max="100000"
          min="1"
          onChange={(event) => onQuantityChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder={t("quantityPlaceholder")}
          type="text"
          value={quantity}
        />
        <FieldError id="cargo-quantity-error" message={errors.quantity} />
      </div>
      <section className="rounded-lg border border-dashed border-primary/35 bg-primary/[0.025] p-5">
        <div className="flex gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-md bg-secondary text-primary">
            <PackageOpen aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h3 className="font-black">{t("photos")}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{t("photosHint")}</p>
          </div>
        </div>
        <label className="mt-5 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-bold shadow-sm transition hover:bg-muted">
          <ImagePlus aria-hidden="true" className="size-4" />
          {t("choosePhotos")}
          <input
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            multiple
            onChange={onFilesChange}
            type="file"
          />
        </label>
        <FieldError id="photo-error" message={fileError} />
        {photos.length > 0 ? (
          <ul className="mt-5 grid gap-2" role="list">
            {photos.map(({ file, id }) => (
              <li className="flex min-w-0 items-center gap-3 rounded-md bg-card px-3 py-2" key={id}>
                <ImagePlus aria-hidden="true" className="size-4 shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold" dir="auto">
                  {file.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </span>
                <Button
                  aria-label={t("removePhoto", { name: file.name })}
                  onClick={() => onRemovePhoto(id)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
        <p className="mt-4 text-xs leading-5 text-muted-foreground">{t("filesNotRestored")}</p>
      </section>
    </div>
  );
}
