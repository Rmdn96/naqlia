import "server-only";

import { headers } from "next/headers";

import { getApplicationUrl } from "@/config/env";
import {
  isApprovedAuthRedirectOrigin,
  resolveAuthRedirectOrigin,
  type AuthRedirectEnvironment,
} from "@/lib/auth/redirect-origin";

type HeaderReader = { get(name: string): string | null };

function firstHeaderValue(value: string | null): string | null {
  return value?.split(",")[0]?.trim() || null;
}

export function getRequestOrigin(requestHeaders: HeaderReader): string | null {
  const explicitOrigin = firstHeaderValue(requestHeaders.get("origin"));
  if (explicitOrigin) return explicitOrigin;

  const host =
    firstHeaderValue(requestHeaders.get("x-forwarded-host")) ??
    firstHeaderValue(requestHeaders.get("host"));
  if (!host) return null;

  const forwardedProtocol = firstHeaderValue(requestHeaders.get("x-forwarded-proto"));
  const protocol = forwardedProtocol ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

function getServerAuthRedirectEnvironment(): AuthRedirectEnvironment {
  return {
    applicationUrl: getApplicationUrl(),
    approvedLocalOrigin: process.env.NAQLK_AUTH_LOCAL_ORIGIN,
    approvedPreviewOrigin: process.env.NAQLK_AUTH_PREVIEW_ORIGIN,
    nodeEnvironment: process.env.NODE_ENV,
    vercelBranchUrl: process.env.VERCEL_BRANCH_URL,
    vercelEnvironment: process.env.VERCEL_ENV,
    vercelUrl: process.env.VERCEL_URL,
  };
}

export function isApprovedServerAuthOrigin(requestedOrigin: string | null): boolean {
  return isApprovedAuthRedirectOrigin(requestedOrigin, getServerAuthRedirectEnvironment());
}

export function resolveServerAuthRedirectOrigin(requestedOrigin?: string | null): string {
  return resolveAuthRedirectOrigin(requestedOrigin, getServerAuthRedirectEnvironment());
}

export function resolveAuthRedirectOriginFromHeaders(requestHeaders: HeaderReader): string {
  return resolveServerAuthRedirectOrigin(getRequestOrigin(requestHeaders));
}

export async function getRequestAuthRedirectOrigin(): Promise<string> {
  return resolveAuthRedirectOriginFromHeaders(await headers());
}
