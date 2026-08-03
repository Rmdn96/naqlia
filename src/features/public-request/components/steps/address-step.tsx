"use client";

import { LocateFixed, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/features/public-request/components/field-error";
import type {
  PublicCatalogCity,
  RequestAddressDraft,
} from "@/features/public-request/types/public-request";

type AddressFieldsProps = {
  address: RequestAddressDraft;
  cities: PublicCatalogCity[];
  errors: Record<string, string | undefined>;
  idPrefix: "delivery" | "pickup";
  onChange: (address: RequestAddressDraft) => void;
  title: string;
};

function AddressFields({ address, cities, errors, idPrefix, onChange, title }: AddressFieldsProps) {
  const t = useTranslations("Request");
  const [locationStatus, setLocationStatus] = useState<"error" | "idle" | "locating" | "success">(
    address.latitude === null ? "idle" : "success",
  );
  const cityErrorId = `${idPrefix}-city-error`;
  const addressErrorId = `${idPrefix}-address-error`;

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocationStatus("error");
      return;
    }

    setLocationStatus("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onChange({
          ...address,
          latitude: Number(coords.latitude.toFixed(6)),
          longitude: Number(coords.longitude.toFixed(6)),
        });
        setLocationStatus("success");
      },
      () => setLocationStatus("error"),
      { enableHighAccuracy: false, maximumAge: 60000, timeout: 8000 },
    );
  };

  return (
    <section className="rounded-lg border border-border bg-muted/45 p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-md bg-card text-primary shadow-sm">
          <MapPin aria-hidden="true" className="size-5" />
        </span>
        <h3 className="font-black">{title}</h3>
      </div>
      <div className="mt-5 grid gap-5">
        <div>
          <Label htmlFor={`${idPrefix}-city`}>
            {t("city")} <span className="text-destructive">*</span>
          </Label>
          <select
            aria-describedby={errors.cityId ? cityErrorId : undefined}
            aria-invalid={Boolean(errors.cityId)}
            className="mt-2 min-h-12 w-full rounded-md border border-input bg-card px-3 py-2 text-base shadow-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 md:text-sm"
            id={`${idPrefix}-city`}
            onChange={(event) => onChange({ ...address, cityId: event.target.value })}
            value={address.cityId}
          >
            <option value="">{t("chooseCity")}</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name} — {city.region}
              </option>
            ))}
          </select>
          <FieldError id={cityErrorId} message={errors.cityId} />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-address`}>
            {t("formattedAddress")} <span className="text-destructive">*</span>
          </Label>
          <Input
            aria-describedby={errors.formattedAddress ? addressErrorId : undefined}
            aria-invalid={Boolean(errors.formattedAddress)}
            autoComplete={idPrefix === "pickup" ? "street-address" : "off"}
            className="mt-2"
            id={`${idPrefix}-address`}
            maxLength={500}
            onChange={(event) => onChange({ ...address, formattedAddress: event.target.value })}
            placeholder={t("addressPlaceholder")}
            value={address.formattedAddress}
          />
          <FieldError id={addressErrorId} message={errors.formattedAddress} />
        </div>
        <div>
          <Button
            disabled={locationStatus === "locating"}
            onClick={requestLocation}
            type="button"
            variant="outline"
          >
            <LocateFixed aria-hidden="true" className="size-4" />
            {locationStatus === "locating" ? t("locating") : t("useLocation")}
          </Button>
          {locationStatus === "success" &&
          address.latitude !== null &&
          address.longitude !== null ? (
            <p className="mt-3 text-sm font-semibold text-primary" role="status">
              {t("locationAdded")}:{" "}
              <bdi dir="ltr">
                {address.latitude}, {address.longitude}
              </bdi>
            </p>
          ) : null}
          {locationStatus === "error" ? (
            <p className="mt-3 text-sm text-muted-foreground" role="status">
              {t("locationUnavailable")}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

type AddressStepProps = {
  cities: PublicCatalogCity[];
  delivery: RequestAddressDraft;
  errors: Record<string, string | undefined>;
  onDeliveryChange: (address: RequestAddressDraft) => void;
  onPickupChange: (address: RequestAddressDraft) => void;
  pickup: RequestAddressDraft;
};

export function AddressStep({
  cities,
  delivery,
  errors,
  onDeliveryChange,
  onPickupChange,
  pickup,
}: AddressStepProps) {
  const t = useTranslations("Request");

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <AddressFields
        address={pickup}
        cities={cities}
        errors={{
          cityId: errors["pickup.cityId"],
          formattedAddress: errors["pickup.formattedAddress"],
        }}
        idPrefix="pickup"
        onChange={onPickupChange}
        title={t("pickup")}
      />
      <AddressFields
        address={delivery}
        cities={cities}
        errors={{
          cityId: errors["delivery.cityId"],
          formattedAddress: errors["delivery.formattedAddress"],
        }}
        idPrefix="delivery"
        onChange={onDeliveryChange}
        title={t("delivery")}
      />
    </div>
  );
}
