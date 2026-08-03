"use client";

import { Minus, Plus, Save, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FormEvent, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  saveQuotationAction,
  sendQuotationAction,
} from "@/features/sales-workspace/actions/sales-workspace.actions";
import { formatSalesCurrency } from "@/features/sales-workspace/lib/format";
import type {
  QuotationCommandResult,
  QuotationDraftPayload,
  SalesQuotation,
} from "@/features/sales-workspace/types/sales-workspace";
import type { AppLocale } from "@/i18n/routing";

type QuotationBuilderProps = {
  defaultValidityDays: number;
  defaultVatRate: number;
  initialQuotation: SalesQuotation | null;
  leadId: string;
  locale: AppLocale;
};

type DraftLine = QuotationDraftPayload["lineItems"][number];
type CommandIntent = "save" | "send";

function toLocalDateTimeInput(value: Date): string {
  const offsetDate = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);

  return offsetDate.toISOString().slice(0, 16);
}

function getInitialDraft(
  initialQuotation: SalesQuotation | null,
  defaultValidityDays: number,
  defaultVatRate: number,
) {
  if (initialQuotation) {
    return {
      customerNotes: initialQuotation.customer_notes ?? "",
      expiresAt: toLocalDateTimeInput(new Date(initialQuotation.expires_at)),
      internalNotes: initialQuotation.internal_notes ?? "",
      lineItems: initialQuotation.line_items.map((line) => ({
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unit_price,
      })),
      vatRate: initialQuotation.vat_rate,
    };
  }

  return {
    customerNotes: "",
    expiresAt: toLocalDateTimeInput(
      new Date(Date.now() + defaultValidityDays * 24 * 60 * 60 * 1000),
    ),
    internalNotes: "",
    lineItems: [{ description: "", quantity: 1, unitPrice: 0 }],
    vatRate: defaultVatRate,
  };
}

function messageKey(
  result: Extract<QuotationCommandResult, { status: "error" }>["message"],
): string {
  const messageKeys = {
    invalid_draft: "errorInvalidDraft",
    not_authorized: "errorUnauthorized",
    not_found: "errorNotFound",
    save_failed: "errorSave",
    send_failed: "errorSend",
  } as const;

  return messageKeys[result];
}

export function QuotationBuilder({
  defaultValidityDays,
  defaultVatRate,
  initialQuotation,
  leadId,
  locale,
}: QuotationBuilderProps) {
  const t = useTranslations("SalesWorkspace");
  const [isPending, startTransition] = useTransition();
  const [activeQuotationId, setActiveQuotationId] = useState(initialQuotation?.id ?? null);
  const [draft, setDraft] = useState(() =>
    getInitialDraft(initialQuotation, defaultValidityDays, defaultVatRate),
  );
  const [notice, setNotice] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const isReadOnly = initialQuotation !== null && initialQuotation.status !== "draft";
  const subtotal = useMemo(
    () => draft.lineItems.reduce((total, line) => total + line.quantity * line.unitPrice, 0),
    [draft.lineItems],
  );
  const taxAmount = useMemo(
    () => Number((subtotal * draft.vatRate).toFixed(2)),
    [draft.vatRate, subtotal],
  );
  const total = useMemo(() => Number((subtotal + taxAmount).toFixed(2)), [subtotal, taxAmount]);

  function updateLine(index: number, field: keyof DraftLine, value: string | number) {
    setDraft((current) => ({
      ...current,
      lineItems: current.lineItems.map((line, lineIndex) =>
        lineIndex === index ? { ...line, [field]: value } : line,
      ),
    }));
  }

  function removeLine(index: number) {
    setDraft((current) => ({
      ...current,
      lineItems: current.lineItems.filter((_, lineIndex) => lineIndex !== index),
    }));
  }

  function addLine() {
    setDraft((current) => ({
      ...current,
      lineItems: [...current.lineItems, { description: "", quantity: 1, unitPrice: 0 }],
    }));
  }

  function createPayload(): QuotationDraftPayload {
    return {
      currency: "SAR",
      customerNotes: draft.customerNotes,
      expiresAt: new Date(draft.expiresAt).toISOString(),
      internalNotes: draft.internalNotes,
      lineItems: draft.lineItems,
      vatRate: draft.vatRate,
    };
  }

  function runCommand(intent: CommandIntent) {
    if (isReadOnly) {
      return;
    }

    startTransition(async () => {
      setNotice(null);
      const saveResult = await saveQuotationAction({
        draft: createPayload(),
        leadId,
        locale,
        quotationId: activeQuotationId,
      });

      if (saveResult.status === "error") {
        setNotice({ tone: "error", text: t(messageKey(saveResult.message)) });
        return;
      }

      setActiveQuotationId(saveResult.quotationId);

      if (intent === "save") {
        setNotice({ tone: "success", text: t("saveSuccess") });
        return;
      }

      const sendResult = await sendQuotationAction(leadId, saveResult.quotationId, locale);

      if (sendResult.status === "error") {
        setNotice({ tone: "error", text: t(messageKey(sendResult.message)) });
        return;
      }

      setNotice({ tone: "success", text: t("sendSuccess") });
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runCommand("save");
  }

  return (
    <Card className="p-5 sm:p-7">
      <form onSubmit={onSubmit}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-primary">{t("quotation")}</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">{t("quotationBuilder")}</h1>
            {initialQuotation ? (
              <p className="mt-2 font-mono text-sm font-black text-muted-foreground">
                {initialQuotation.quotation_number}
              </p>
            ) : null}
          </div>
          <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-800">
            {isReadOnly ? t(`statuses.${initialQuotation?.status}`) : t("draft")}
          </span>
        </div>

        {isReadOnly ? (
          <p className="mt-5 rounded-md border border-border bg-muted/50 p-4 text-sm font-semibold text-muted-foreground">
            {t("readOnlyQuotation")}
          </p>
        ) : null}

        {notice ? (
          <p
            aria-live="polite"
            className={`mt-5 rounded-md border p-4 text-sm font-bold ${
              notice.tone === "success"
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-800"
                : "border-destructive/25 bg-destructive/10 text-destructive"
            }`}
          >
            {notice.text}
          </p>
        ) : null}

        <fieldset className="mt-7" disabled={isPending || isReadOnly}>
          <legend className="text-lg font-black">{t("lineItems")}</legend>
          <div className="mt-4 space-y-4">
            {draft.lineItems.map((line, index) => (
              <div
                className="grid gap-3 rounded-md border border-border p-4 lg:grid-cols-[minmax(0,1fr)_9rem_10rem_9rem_auto]"
                key={index}
              >
                <div className="grid gap-2">
                  <Label htmlFor={`line-description-${index}`}>{t("description")}</Label>
                  <Input
                    id={`line-description-${index}`}
                    onChange={(event) => updateLine(index, "description", event.target.value)}
                    placeholder={t("itemDescriptionPlaceholder")}
                    required
                    value={line.description}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`line-quantity-${index}`}>{t("quantity")}</Label>
                  <Input
                    id={`line-quantity-${index}`}
                    min="0.001"
                    onChange={(event) => updateLine(index, "quantity", Number(event.target.value))}
                    required
                    step="0.001"
                    type="number"
                    value={line.quantity}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`line-price-${index}`}>{t("unitPrice")}</Label>
                  <Input
                    id={`line-price-${index}`}
                    min="0"
                    onChange={(event) => updateLine(index, "unitPrice", Number(event.target.value))}
                    required
                    step="0.01"
                    type="number"
                    value={line.unitPrice}
                  />
                </div>
                <div className="grid gap-2">
                  <span className="text-sm font-semibold">{t("lineTotal")}</span>
                  <output className="flex min-h-12 items-center rounded-md border border-input bg-muted/50 px-3 text-sm font-black">
                    {formatSalesCurrency(line.quantity * line.unitPrice, "SAR", locale)}
                  </output>
                </div>
                <Button
                  aria-label={t("removeLine", { number: index + 1 })}
                  className="self-end"
                  disabled={draft.lineItems.length === 1}
                  onClick={() => removeLine(index)}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <Minus aria-hidden="true" className="size-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button className="mt-4" onClick={addLine} type="button" variant="outline">
            <Plus aria-hidden="true" className="size-4" />
            {t("addLine")}
          </Button>

          <div className="mt-8 grid gap-5 border-t border-border pt-6 md:grid-cols-2">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quotation-expiry">{t("expiry")}</Label>
                <Input
                  id="quotation-expiry"
                  min={toLocalDateTimeInput(new Date())}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, expiresAt: event.target.value }))
                  }
                  required
                  type="datetime-local"
                  value={draft.expiresAt}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quotation-currency">{t("currency")}</Label>
                <Input id="quotation-currency" readOnly value="SAR" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer-notes">{t("customerNotes")}</Label>
                <Textarea
                  id="customer-notes"
                  maxLength={3000}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, customerNotes: event.target.value }))
                  }
                  value={draft.customerNotes}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="internal-notes">{t("internalNotes")}</Label>
                <Textarea
                  id="internal-notes"
                  maxLength={5000}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, internalNotes: event.target.value }))
                  }
                  value={draft.internalNotes}
                />
              </div>
            </div>
            <div className="rounded-md bg-muted/50 p-5">
              <dl className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-semibold text-muted-foreground">{t("subtotal")}</dt>
                  <dd className="font-black">{formatSalesCurrency(subtotal, "SAR", locale)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-semibold text-muted-foreground">
                    {t("vat", { rate: Math.round(draft.vatRate * 100) })}
                  </dt>
                  <dd className="font-black">{formatSalesCurrency(taxAmount, "SAR", locale)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-border pt-4 text-base">
                  <dt className="font-black">{t("grandTotal")}</dt>
                  <dd className="font-black text-primary">
                    {formatSalesCurrency(total, "SAR", locale)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </fieldset>

        {!isReadOnly ? (
          <div className="mt-7 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">{t("sentNotice")}</p>
            <div className="flex flex-wrap gap-3">
              <Button disabled={isPending} type="submit" variant="outline">
                <Save aria-hidden="true" className="size-4" />
                {isPending ? t("saving") : t("saveDraft")}
              </Button>
              <Button disabled={isPending} onClick={() => runCommand("send")} type="button">
                <Send aria-hidden="true" className="size-4" />
                {isPending ? t("sending") : t("sendQuotation")}
              </Button>
            </div>
          </div>
        ) : null}
      </form>
    </Card>
  );
}
