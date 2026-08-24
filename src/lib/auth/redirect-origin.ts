import { AUTH_CALLBACK_PATH } from "@/config/auth";
import type { AppLocale } from "@/i18n/routing";
import { getSafeRedirectPath } from "@/lib/auth/redirects";

export type AuthRedirectEnvironment = {
  applicationUrl: string;
  approvedLocalOrigin?: string;
  approvedPreviewOrigin?: string;
  nodeEnvironment?: string;
  vercelBranchUrl?: string;
  vercelEnvironment?: string;
  vercelUrl?: string;
};

function normalizeOrigin(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}

function vercelOrigin(hostname: string | undefined): string | null {
  if (!hostname?.trim() || hostname.includes("://") || hostname.includes("/")) return null;
  return normalizeOrigin(`https://${hostname.trim()}`);
}

export function isApprovedAuthRedirectOrigin(
  requestedOrigin: string | null | undefined,
  environment: AuthRedirectEnvironment,
): boolean {
  const requested = normalizeOrigin(requestedOrigin);
  const applicationOrigin = normalizeOrigin(environment.applicationUrl);
  if (!requested || !applicationOrigin) return false;

  if (environment.vercelEnvironment === "preview") {
    return new Set(
      [
        normalizeOrigin(environment.approvedPreviewOrigin),
        vercelOrigin(environment.vercelBranchUrl),
        vercelOrigin(environment.vercelUrl),
      ].filter((origin): origin is string => origin !== null),
    ).has(requested);
  }

  if (environment.nodeEnvironment === "development") {
    return new Set(
      [
        applicationOrigin,
        normalizeOrigin(environment.approvedLocalOrigin),
        "http://localhost:3000",
        "http://127.0.0.1:3000",
      ].filter((origin): origin is string => origin !== null),
    ).has(requested);
  }

  return requested === applicationOrigin;
}

export function resolveAuthRedirectOrigin(
  requestedOrigin: string | null | undefined,
  environment: AuthRedirectEnvironment,
): string {
  const applicationOrigin = normalizeOrigin(environment.applicationUrl);
  if (!applicationOrigin) throw new Error("Application URL must contain a valid HTTP(S) origin");

  const requested = normalizeOrigin(requestedOrigin);

  if (environment.vercelEnvironment === "preview") {
    const approvedPreview = normalizeOrigin(environment.approvedPreviewOrigin);
    const branchPreview = vercelOrigin(environment.vercelBranchUrl);
    const deploymentPreview = vercelOrigin(environment.vercelUrl);
    if (isApprovedAuthRedirectOrigin(requested, environment)) {
      return approvedPreview ?? branchPreview ?? deploymentPreview ?? applicationOrigin;
    }

    return applicationOrigin;
  }

  if (environment.nodeEnvironment === "development") {
    const approvedLocal = normalizeOrigin(environment.approvedLocalOrigin);
    const allowedLocalOrigins = new Set(
      [applicationOrigin, approvedLocal, "http://localhost:3000", "http://127.0.0.1:3000"].filter(
        (origin): origin is string => origin !== null,
      ),
    );

    if (requested && allowedLocalOrigins.has(requested)) return requested;
  }

  return applicationOrigin;
}

export function createAuthCallbackUrl(
  authOrigin: string,
  locale: AppLocale,
  next?: string,
  recovery = false,
): string {
  const callback = new URL(AUTH_CALLBACK_PATH, authOrigin);
  callback.searchParams.set("locale", locale);
  if (next) callback.searchParams.set("next", getSafeRedirectPath(next));
  if (recovery) callback.searchParams.set("recovery", "true");
  return callback.toString();
}

export function createPasswordRecoveryCallbackUrl(authOrigin: string, locale: AppLocale): string {
  return createAuthCallbackUrl(authOrigin, locale, `/${locale}/reset-password`, true);
}
