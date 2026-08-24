"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PASSWORD_RECOVERY_RESET_INTENT_HEADER,
  PASSWORD_RECOVERY_RESET_INTENT_VALUE,
} from "@/config/auth";
import { getUnifiedAuthCopy } from "@/features/unified-auth/lib/copy";
import { passwordSchema } from "@/features/unified-auth/lib/validation";
import type { AppLocale } from "@/i18n/routing";

export function ResetPasswordForm({ locale }: { locale: AppLocale }) {
  const t = getUnifiedAuthCopy(locale);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string>();
  const [success, setSuccess] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = form.get("password");
    const confirmation = form.get("confirmation");
    if (!passwordSchema.safeParse(password).success || password !== confirmation) {
      setMessage(t.validationError);
      return;
    }
    setPending(true);
    setMessage(undefined);
    const response = await fetch("/auth/recovery/reset", {
      body: JSON.stringify({ confirmation, locale, password }),
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        [PASSWORD_RECOVERY_RESET_INTENT_HEADER]: PASSWORD_RECOVERY_RESET_INTENT_VALUE,
      },
      method: "POST",
    });
    const result = (await response.json().catch(() => null)) as {
      ok?: boolean;
      redirect?: string;
    } | null;
    if (!response.ok || !result?.ok || !result.redirect?.startsWith(`/${locale}/login`)) {
      setPending(false);
      setMessage(t.genericError);
      return;
    }
    setSuccess(true);
    setMessage(t.resetSuccess);
    window.location.replace(result.redirect);
  }
  return (
    <form className="space-y-4" noValidate onSubmit={submit}>
      <label className="block space-y-2 text-sm font-bold" htmlFor="reset-password">
        <span>{t.password}</span>
        <Input
          aria-describedby="reset-hint"
          autoComplete="new-password"
          id="reset-password"
          maxLength={72}
          minLength={12}
          name="password"
          required
          type="password"
        />
        <span className="block text-xs font-normal text-muted-foreground" id="reset-hint">
          {t.passwordHint}
        </span>
      </label>
      <label className="block space-y-2 text-sm font-bold" htmlFor="reset-confirm">
        <span>{t.confirmPassword}</span>
        <Input
          autoComplete="new-password"
          id="reset-confirm"
          maxLength={72}
          minLength={12}
          name="confirmation"
          required
          type="password"
        />
      </label>
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? t.submitting : t.resetSubmit}
      </Button>
      {message ? (
        <p
          aria-live="polite"
          className={success ? "text-sm text-emerald-700" : "text-sm text-destructive"}
          role={success ? "status" : "alert"}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
