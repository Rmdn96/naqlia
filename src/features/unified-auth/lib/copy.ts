import type { AppLocale } from "@/i18n/routing";

const copy = {
  ar: {
    accountNote: "يمكنك متابعة طلباتك من حسابك، بينما تبقى جميع خدمات الضيف متاحة دون تسجيل.",
    apple: "المتابعة باستخدام Apple",
    email: "البريد الإلكتروني",
    error: "تعذر إرسال رابط الدخول. حاول مرة أخرى.",
    google: "المتابعة باستخدام Google",
    intro: "رابط واحد آمن للعملاء وفريق نقلك. تحدد الصلاحيات وجهتك بعد التحقق.",
    invalid: "أدخل بريداً إلكترونياً صحيحاً.",
    submit: "إرسال رابط الدخول",
    submitting: "جارٍ الإرسال...",
    success: "تحقق من بريدك الإلكتروني لإكمال الدخول.",
    title: "الدخول إلى نقلك",
  },
  en: {
    accountNote:
      "An account makes requests easier to follow, while every Guest flow remains available.",
    apple: "Continue with Apple",
    email: "Email address",
    error: "We could not send the sign-in link. Please try again.",
    google: "Continue with Google",
    intro:
      "One secure entry for Naqlk customers and staff. Authorization determines your destination after verification.",
    invalid: "Enter a valid email address.",
    submit: "Send sign-in link",
    submitting: "Sending…",
    success: "Check your email to finish signing in.",
    title: "Sign in to Naqlk",
  },
} as const;

export function getUnifiedAuthCopy(locale: AppLocale) {
  return copy[locale];
}
