import { CheckCircle2, ClipboardCheck, MapPinned, MessageCircleMore } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getWhatsAppHref } from "@/config/site";
import type { SeoFaq } from "@/features/seo/types/seo";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils/cn";

export function PageHero({
  description,
  eyebrow,
  heading,
}: {
  description: string;
  eyebrow: string;
  heading: string;
}) {
  return (
    <section className="border-b bg-gradient-to-br from-[#071f43] via-[#0b2b5b] to-blue-700 py-20 text-white sm:py-28">
      <div className="container max-w-5xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-sky-300">{eyebrow}</p>
        <h1 className="mt-5 max-w-4xl text-balance text-4xl font-black leading-tight sm:text-6xl">
          {heading}
        </h1>
        <p className="mt-7 max-w-3xl text-lg leading-9 text-white/80 sm:text-xl">{description}</p>
      </div>
    </section>
  );
}

export function ProcessGrid({ items, locale }: { items: string[]; locale: AppLocale }) {
  return (
    <section className="border-y bg-muted/35 py-16 sm:py-20">
      <div className="container">
        <h2 className="text-3xl font-black">
          {locale === "ar" ? "كيف تعمل نقلك" : "How Naqlk works"}
        </h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {items.map((item, index) => (
            <Card className="p-6" key={item}>
              <div className="flex items-center justify-between">
                <ClipboardCheck aria-hidden="true" className="size-6 text-primary" />
                <span className="text-3xl font-black text-primary/15">0{index + 1}</span>
              </div>
              <p className="mt-5 leading-8">{item}</p>
            </Card>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function BenefitsGrid({ items, locale }: { items: string[]; locale: AppLocale }) {
  return (
    <section className="container py-16 sm:py-20">
      <h2 className="text-3xl font-black">
        {locale === "ar" ? "تنظيم وأمان في كل خطوة" : "Organization and safety at every step"}
      </h2>
      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <li className="flex gap-3 rounded-xl border bg-card p-5 leading-7" key={item}>
            <CheckCircle2 aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function FaqSection({ faqs, locale }: { faqs: SeoFaq[]; locale: AppLocale }) {
  if (!faqs.length) return null;
  return (
    <section className="container py-16 sm:py-20">
      <h2 className="text-3xl font-black">
        {locale === "ar" ? "الأسئلة الشائعة" : "Frequently asked questions"}
      </h2>
      <div className="mt-8 space-y-4">
        {faqs.map((faq) => (
          <details className="group rounded-xl border bg-card p-5" key={faq.question}>
            <summary className="cursor-pointer list-none font-black">{faq.question}</summary>
            <p className="mt-4 max-w-4xl leading-8 text-muted-foreground">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function SeoCtas({
  city,
  citySlug,
  locale,
  service,
  whatsappNumber,
}: {
  city?: string;
  citySlug?: string;
  locale: AppLocale;
  service?: string;
  whatsappNumber?: string | null;
}) {
  const query = new URLSearchParams();
  if (citySlug) query.set("city", citySlug);
  if (service) query.set("service", service);
  const requestHref = `/request${query.size ? `?${query.toString()}` : ""}`;
  const message =
    locale === "ar"
      ? `مرحباً نقلك، أود الاستفسار عن خدمة نقل${city ? ` في ${city}` : ""}.`
      : `Hello Naqlk, I would like to ask about a transport service${city ? ` in ${city}` : ""}.`;
  return (
    <section className="container pb-20 pt-8">
      <div className="rounded-[2rem] bg-[#0b2b5b] p-7 text-white sm:p-10">
        <h2 className="text-3xl font-black">
          {locale === "ar" ? "ابدأ طلب النقل" : "Start your transport request"}
        </h2>
        <p className="mt-4 max-w-2xl leading-8 text-white/75">
          {locale === "ar"
            ? "أدخل التفاصيل في خطوات واضحة، وسيُراجع فريق المبيعات الطلب قبل إرسال عرض السعر."
            : "Provide the details in clear steps. The Sales team reviews the request before sending a quotation."}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            className={cn(buttonVariants({ size: "lg" }), "bg-blue-600")}
            href={requestHref as never}
          >
            <MapPinned aria-hidden="true" className="size-5" />
            {locale === "ar" ? "اطلب خدمة نقل" : "Request transport"}
          </Link>
          <a
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "border-white/35 bg-transparent text-white hover:bg-white/10",
            )}
            href={getWhatsAppHref(message, whatsappNumber)}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircleMore aria-hidden="true" className="size-5" />
            {locale === "ar" ? "تواصل عبر واتساب" : "Contact on WhatsApp"}
          </a>
          <Link
            className={cn(
              buttonVariants({ size: "lg", variant: "ghost" }),
              "text-white hover:bg-white/10",
            )}
            href="/track"
          >
            {locale === "ar" ? "تتبع طلبك" : "Track a request"}
          </Link>
        </div>
      </div>
    </section>
  );
}
