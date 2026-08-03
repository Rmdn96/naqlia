"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { staffEmailSchema } from "@/features/staff-auth/lib/validation";
import type { AppLocale } from "@/i18n/routing";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type StaffSignInFormProps = {
  emailLabel: string;
  emailPlaceholder: string;
  errorInvalidEmail: string;
  errorUnavailable: string;
  locale: AppLocale;
  submitLabel: string;
  submittingLabel: string;
  successMessage: string;
};

export function StaffSignInForm({
  emailLabel,
  emailPlaceholder,
  errorInvalidEmail,
  errorUnavailable,
  locale,
  submitLabel,
  submittingLabel,
  successMessage,
}: StaffSignInFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string>();
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedEmail = staffEmailSchema.safeParse(email);

    if (!parsedEmail.success) {
      setIsError(true);
      setMessage(errorInvalidEmail);
      return;
    }

    setIsSubmitting(true);
    setMessage(undefined);

    try {
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", `/${locale}/sales/leads`);
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: parsedEmail.data,
        options: {
          emailRedirectTo: callbackUrl.toString(),
          shouldCreateUser: false,
        },
      });

      if (error) {
        throw error;
      }

      setIsError(false);
      setMessage(successMessage);
    } catch {
      setIsError(true);
      setMessage(errorUnavailable);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground" htmlFor="staff-email">
          {emailLabel}
        </label>
        <Input
          autoComplete="email"
          id="staff-email"
          inputMode="email"
          maxLength={254}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={emailPlaceholder}
          required
          type="email"
          value={email}
        />
      </div>
      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? submittingLabel : submitLabel}
      </Button>
      {message ? (
        <p
          aria-live="polite"
          className={isError ? "text-sm font-medium text-destructive" : "text-sm text-foreground"}
          role={isError ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
