import type { AppLocale } from "@/i18n/routing";

type AuthFailureShape = {
  code?: unknown;
  status?: unknown;
};

export type StaffInvitationFailure = "invite_failed" | "invite_rate_limited";

export function classifyStaffInvitationFailure(error: unknown): StaffInvitationFailure {
  if (!error || typeof error !== "object") return "invite_failed";

  const failure = error as AuthFailureShape;
  return failure.status === 429 || failure.code === "over_email_send_rate_limit"
    ? "invite_rate_limited"
    : "invite_failed";
}

const resultCopy = {
  ar: {
    cancelled: "تم إلغاء الدعوة بأمان.",
    invite_failed: "تعذر إرسال الدعوة. لم يتم منح صلاحية موظف. حاول مرة أخرى لاحقاً.",
    invite_rate_limited:
      "تم بلوغ حد الإرسال المؤقت لدى مزود البريد. انتظر حتى يتجدد الحد ثم أعد المحاولة. لم يتم منح صلاحية موظف.",
    invited: "تم إرسال الدعوة وتسجيلها كدعوة معلقة.",
    invalid: "تعذر تنفيذ الطلب بسبب بيانات غير صالحة.",
    resent: "تم تدوير الدعوة وإعادة إرسالها.",
    role_updated: "تم تحديث دور الموظف.",
    status_updated: "تم تحديث حالة وصول الموظف.",
  },
  en: {
    cancelled: "The invitation was cancelled safely.",
    invite_failed:
      "The invitation could not be sent. No Staff access was granted. Try again later.",
    invite_rate_limited:
      "The email provider's temporary send limit has been reached. Wait for the allowance to reset, then retry. No Staff access was granted.",
    invited: "The invitation was sent and recorded as pending.",
    invalid: "The request could not be completed because its data was invalid.",
    resent: "The invitation was rotated and sent again.",
    role_updated: "The Staff role was updated.",
    status_updated: "The Staff access state was updated.",
  },
} as const;

export function getAdministrationResultMessage(
  locale: AppLocale,
  result: string | undefined,
): string | null {
  if (!result) return null;
  return (
    resultCopy[locale][result as keyof (typeof resultCopy)[AppLocale]] ??
    resultCopy[locale].invite_failed
  );
}
