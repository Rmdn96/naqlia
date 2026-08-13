"use client";

import { CheckCircle2, MessageCircle, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getWhatsAppHref } from "@/config/site";
import { respondToQuotationAction } from "@/features/customer-quotation/actions/customer-quotation.actions";
import type {
  CustomerQuotationPayload,
  CustomerQuotationState,
} from "@/features/customer-quotation/types/customer-quotation";
import { formatSalesCurrency, formatSalesDate } from "@/features/sales-workspace/lib/format";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/utils/cn";

type Props = {
  data: CustomerQuotationPayload;
  locale: AppLocale;
  token: string;
};

type RejectionCode = "changed_requirements" | "no_longer_needed" | "other" | "price" | "timing";

export function CustomerQuotationView({ data, locale, token }: Props) {
  const t = useTranslations("CustomerQuotation");
  const [state, setState] = useState<CustomerQuotationState>(data.state);
  const [orderNumber, setOrderNumber] = useState(data.order_number);
  const [respondedAt, setRespondedAt] = useState(
    data.quotation.accepted_at ?? data.quotation.rejected_at,
  );
  const [intent, setIntent] = useState<"accept" | "reject" | null>(null);
  const [reasonCode, setReasonCode] = useState<RejectionCode | "">("");
  const [reasonText, setReasonText] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const confirmationButtonRef = useRef<HTMLButtonElement>(null);
  const quotation = data.quotation;
  const lead = data.lead;
  const serviceName = locale === "ar" ? lead.service.name_ar : lead.service.name_en;
  const pickupCity = locale === "ar" ? lead.pickup.city_name_ar : lead.pickup.city_name_en;
  const deliveryCity = locale === "ar" ? lead.delivery.city_name_ar : lead.delivery.city_name_en;
  const whatsappMessage = t("whatsappMessage", {
    quotation: `${quotation.quotation_number} / ${quotation.revision_number}`,
    reference: lead.reference_number,
  });

  useEffect(() => {
    if (intent) confirmationButtonRef.current?.focus();
  }, [intent]);

  function submitResponse() {
    if (!intent) return;
    startTransition(async () => {
      setNotice(null);
      const action = await respondToQuotationAction({
        locale,
        reasonCode: intent === "reject" && reasonCode ? reasonCode : null,
        reasonText: intent === "reject" && reasonText.trim() ? reasonText.trim() : null,
        response: intent,
        token,
      });

      if (action.status === "error") {
        setNotice(t(action.message === "invalid_reason" ? "invalidReason" : "responseError"));
        return;
      }

      setState(action.result.state);
      if (action.result.state === "accepted" || action.result.state === "rejected") {
        setOrderNumber(action.result.orderNumber);
        setRespondedAt(action.result.respondedAt);
      }
      setIntent(null);
    });
  }

  return (
    <main className="surface-grid py-10 sm:py-14" id="main-content">
      <div className="container max-w-5xl">
        <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black text-primary">{t("eyebrow")}</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{t("title")}</h1>
            <p className="mt-3 text-muted-foreground">
              {t("greeting", { name: lead.customer_name })}
            </p>
          </div>
          <span className="w-fit rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-black text-primary">
            {t(`states.${state}`)}
          </span>
        </header>

        {state !== "active" ? (
          <Card className="mb-6 border-primary/20 bg-primary/5 p-5 sm:p-6">
            <div className="flex gap-3">
              {state === "accepted" ? (
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 size-6 shrink-0 text-emerald-700"
                />
              ) : (
                <XCircle aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-amber-700" />
              )}
              <div>
                <h2 className="font-black">{t(`stateTitles.${state}`)}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {t(`stateDescriptions.${state}`)}
                </p>
                {respondedAt ? (
                  <p className="mt-2 text-sm font-bold">{formatSalesDate(respondedAt, locale)}</p>
                ) : null}
                {state === "accepted" && orderNumber ? (
                  <p className="mt-2 font-mono text-sm font-black" dir="ltr">
                    {t("orderReference", { order: orderNumber })}
                  </p>
                ) : null}
              </div>
            </div>
          </Card>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-6">
            <Card className="p-5 sm:p-7">
              <dl className="grid gap-5 sm:grid-cols-2">
                <Info label={t("leadReference")} mono value={lead.reference_number} />
                <Info
                  label={t("quotationReference")}
                  mono
                  value={`${quotation.quotation_number} · ${t("revision", { number: quotation.revision_number })}`}
                />
                <Info label={t("sentDate")} value={formatSalesDate(quotation.sent_at, locale)} />
                <Info
                  label={t("expiryDate")}
                  value={formatSalesDate(quotation.expires_at, locale)}
                />
                <Info label={t("service")} value={serviceName} />
                <Info label={t("customer")} value={lead.customer_name} />
              </dl>
            </Card>

            <Card className="p-5 sm:p-7">
              <h2 className="text-xl font-black">{t("route")}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Address
                  label={t("pickup")}
                  city={pickupCity}
                  value={lead.pickup.formatted_address}
                />
                <Address
                  label={t("delivery")}
                  city={deliveryCity}
                  value={lead.delivery.formatted_address}
                />
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="border-b border-border p-5 sm:p-7">
                <h2 className="text-xl font-black">{t("lineItems")}</h2>
              </div>
              <div className="divide-y divide-border">
                {quotation.line_items.map((line) => (
                  <article
                    className="grid gap-3 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-6"
                    key={line.line_number}
                  >
                    <div>
                      <p className="font-black">{line.description}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {t("quantityAndPrice", {
                          price: formatSalesCurrency(line.unit_price, quotation.currency, locale),
                          quantity: line.quantity,
                        })}
                      </p>
                    </div>
                    <p className="font-black text-primary">
                      {formatSalesCurrency(line.line_total_amount, quotation.currency, locale)}
                    </p>
                  </article>
                ))}
              </div>
            </Card>

            {quotation.customer_notes ? (
              <Card className="p-5 sm:p-7">
                <h2 className="text-xl font-black">{t("customerNotes")}</h2>
                <p className="mt-3 whitespace-pre-wrap leading-7 text-muted-foreground">
                  {quotation.customer_notes}
                </p>
              </Card>
            ) : null}
          </div>

          <aside>
            <Card className="sticky top-24 p-5 sm:p-6">
              <h2 className="text-xl font-black">{t("summary")}</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <Money
                  label={t("subtotal")}
                  value={formatSalesCurrency(quotation.subtotal_amount, quotation.currency, locale)}
                />
                <Money
                  label={t("vat", { rate: Math.round(quotation.vat_rate * 100) })}
                  value={formatSalesCurrency(quotation.tax_amount, quotation.currency, locale)}
                />
                <div className="flex items-end justify-between gap-4 border-t border-border pt-4">
                  <dt className="font-black">{t("grandTotal")}</dt>
                  <dd className="text-xl font-black text-primary">
                    {formatSalesCurrency(quotation.quoted_amount, quotation.currency, locale)}
                  </dd>
                </div>
              </dl>

              {notice ? (
                <p
                  aria-live="polite"
                  className="mt-4 rounded-md bg-destructive/10 p-3 text-sm font-bold text-destructive"
                >
                  {notice}
                </p>
              ) : null}

              {state === "active" ? (
                <div className="mt-6 grid gap-3">
                  <Button disabled={isPending} onClick={() => setIntent("accept")} size="lg">
                    <CheckCircle2 aria-hidden="true" className="size-5" />
                    {t("accept")}
                  </Button>
                  <Button
                    disabled={isPending}
                    onClick={() => setIntent("reject")}
                    size="lg"
                    variant="outline"
                  >
                    <XCircle aria-hidden="true" className="size-5" />
                    {t("reject")}
                  </Button>
                </div>
              ) : null}

              <a
                className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "mt-3 w-full")}
                href={getWhatsAppHref(whatsappMessage)}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircle aria-hidden="true" className="size-5" />
                {t("whatsapp")}
              </a>
            </Card>
          </aside>
        </div>

        {intent ? (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-foreground/55 p-4"
            onKeyDown={(event) => {
              if (event.key === "Escape" && !isPending) setIntent(null);
            }}
            role="presentation"
          >
            <section
              aria-labelledby="response-dialog-title"
              aria-modal="true"
              className="w-full max-w-lg rounded-lg bg-card p-6 shadow-2xl"
              role="dialog"
            >
              <h2 className="text-2xl font-black" id="response-dialog-title">
                {t(intent === "accept" ? "confirmAcceptTitle" : "confirmRejectTitle")}
              </h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                {t(intent === "accept" ? "confirmAcceptDescription" : "confirmRejectDescription", {
                  quotation: quotation.quotation_number,
                  total: formatSalesCurrency(quotation.quoted_amount, quotation.currency, locale),
                })}
              </p>
              {intent === "reject" ? (
                <div className="mt-5 grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="rejection-code">{t("optionalReason")}</Label>
                    <select
                      className="min-h-11 rounded-md border border-input bg-background px-3 text-sm"
                      id="rejection-code"
                      onChange={(event) => setReasonCode(event.target.value as RejectionCode | "")}
                      value={reasonCode}
                    >
                      <option value="">{t("noReason")}</option>
                      {(
                        [
                          "price",
                          "timing",
                          "changed_requirements",
                          "no_longer_needed",
                          "other",
                        ] as const
                      ).map((code) => (
                        <option key={code} value={code}>
                          {t(`reasons.${code}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="rejection-text">{t("optionalDetails")}</Label>
                    <Textarea
                      id="rejection-text"
                      maxLength={500}
                      onChange={(event) => setReasonText(event.target.value)}
                      value={reasonText}
                    />
                  </div>
                </div>
              ) : null}
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button disabled={isPending} onClick={() => setIntent(null)} variant="outline">
                  {t("cancel")}
                </Button>
                <Button
                  disabled={isPending}
                  onClick={submitResponse}
                  ref={confirmationButtonRef}
                  variant={intent === "reject" ? "destructive" : "default"}
                >
                  {isPending
                    ? t("submitting")
                    : t(intent === "accept" ? "confirmAccept" : "confirmReject")}
                </Button>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function Info({ label, mono = false, value }: { label: string; mono?: boolean; value: string }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-muted-foreground">{label}</dt>
      <dd className={cn("mt-1 font-black", mono && "font-mono")} dir={mono ? "ltr" : undefined}>
        {value}
      </dd>
    </div>
  );
}

function Address({ city, label, value }: { city: string; label: string; value: string }) {
  return (
    <section className="rounded-md border border-border p-4">
      <h3 className="text-sm font-black text-primary">{label}</h3>
      <p className="mt-2 font-bold">{city}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{value}</p>
    </section>
  );
}

function Money({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-black">{value}</dd>
    </div>
  );
}
