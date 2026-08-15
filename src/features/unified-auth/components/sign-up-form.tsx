"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAuthCallbackUrl } from "@/features/unified-auth/lib/client-routing";
import { getUnifiedAuthCopy } from "@/features/unified-auth/lib/copy";
import { signUpSchema } from "@/features/unified-auth/lib/validation";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function SignUpForm({ locale }: { locale: AppLocale }) {
  const t = getUnifiedAuthCopy(locale);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string>();
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = signUpSchema.safeParse({
      displayName: form.get("displayName"),
      email: form.get("email"),
      password: form.get("password"),
      passwordConfirmation: form.get("passwordConfirmation"),
      privacyAccepted: form.get("privacyAccepted") === "on",
    });
    if (!parsed.success) {
      setMessage(t.validationError);
      return;
    }
    setPending(true);
    setMessage(undefined);
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { display_name: parsed.data.displayName, preferred_locale: locale },
        emailRedirectTo: createAuthCallbackUrl(locale, `/${locale}/verify-email?verified=true`),
      },
    });
    setPending(false);
    if (error || !data.user) {
      setMessage(t.genericError);
      return;
    }
    setSuccess(true);
    setMessage(t.signUpSuccess);
  }

  return (
    <form className="space-y-4" noValidate onSubmit={submit}>
      <label className="block space-y-2 text-sm font-bold" htmlFor="signup-name">
        <span>{t.displayName}</span>
        <Input autoComplete="name" id="signup-name" maxLength={120} name="displayName" required />
      </label>
      <label className="block space-y-2 text-sm font-bold" htmlFor="signup-email">
        <span>{t.email}</span>
        <Input
          autoComplete="email"
          id="signup-email"
          inputMode="email"
          maxLength={254}
          name="email"
          required
          type="email"
        />
      </label>
      <label className="block space-y-2 text-sm font-bold" htmlFor="signup-password">
        <span>{t.password}</span>
        <Input
          aria-describedby="password-hint"
          autoComplete="new-password"
          id="signup-password"
          maxLength={72}
          minLength={12}
          name="password"
          required
          type="password"
        />
        <span className="block text-xs font-normal text-muted-foreground" id="password-hint">
          {t.passwordHint}
        </span>
      </label>
      <label className="block space-y-2 text-sm font-bold" htmlFor="signup-confirm">
        <span>{t.confirmPassword}</span>
        <Input
          autoComplete="new-password"
          id="signup-confirm"
          maxLength={72}
          minLength={12}
          name="passwordConfirmation"
          required
          type="password"
        />
      </label>
      <label className="flex items-start gap-3 rounded-lg bg-secondary/60 p-3 text-sm leading-6">
        <input
          className="mt-1 size-4 accent-primary"
          name="privacyAccepted"
          required
          type="checkbox"
        />
        <span>
          {t.privacyAck}{" "}
          <Link className="font-bold text-primary hover:underline" href="/privacy">
            {locale === "ar" ? "إشعار الخصوصية" : "Privacy notice"}
          </Link>
        </span>
      </label>
      <Button className="w-full" disabled={pending || success} type="submit">
        {pending ? t.submitting : t.signUpSubmit}
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
      <div className="text-center">
        <Link className="text-sm font-bold text-primary hover:underline" href="/login">
          {t.loginLink}
        </Link>
      </div>
    </form>
  );
}
