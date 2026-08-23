import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  PASSWORD_RECOVERY_CONTEXT_COOKIE,
  PASSWORD_RECOVERY_CONTEXT_VALUE,
  PASSWORD_RECOVERY_RESET_INTENT_HEADER,
  PASSWORD_RECOVERY_RESET_INTENT_VALUE,
} from "@/config/auth";

const mocks = vi.hoisted(() => ({
  approved: vi.fn(),
  exchange: vi.fn(),
  forwardedOrigin: vi.fn(),
  getUser: vi.fn(),
  resolveOrigin: vi.fn(),
  rpc: vi.fn(),
  signOut: vi.fn(),
  updateUser: vi.fn(),
  verifyOtp: vi.fn(),
}));

vi.mock("@/lib/auth/redirect-origin.server", () => ({
  getForwardedRequestOrigin: mocks.forwardedOrigin,
  isApprovedServerAuthOrigin: mocks.approved,
  resolveServerAuthRedirectOrigin: mocks.resolveOrigin,
}));

vi.mock("@/lib/supabase/server", () => ({
  createRouteHandlerSupabaseClient: () => ({
    auth: {
      getUser: mocks.getUser,
      signOut: mocks.signOut,
      updateUser: mocks.updateUser,
    },
  }),
  createServerSupabaseClient: async () => ({
    auth: {
      exchangeCodeForSession: mocks.exchange,
      verifyOtp: mocks.verifyOtp,
    },
    rpc: mocks.rpc,
  }),
}));

import { GET as callback } from "@/app/auth/callback/route";
import { POST as resetPassword } from "@/app/auth/recovery/reset/route";

const previewOrigin = "https://naqlk-git-fix-password-recovery-redirect.vercel.app";
const productionOrigin = "https://naqlk.vercel.app";

function recoveryCallback(locale: "ar" | "en", origin = previewOrigin) {
  return new NextRequest(
    `${origin}/auth/callback?code=redacted&locale=${locale}&recovery=true&next=%2F${locale}%2Freset-password`,
  );
}

function resetRequest(
  overrides: {
    cookie?: boolean;
    origin?: string;
    password?: string;
    confirmation?: string;
  } = {},
) {
  const password = overrides.password ?? "SafePassword1!";
  const headers: Record<string, string> = {
    "content-type": "application/json",
    origin: overrides.origin ?? previewOrigin,
    [PASSWORD_RECOVERY_RESET_INTENT_HEADER]: PASSWORD_RECOVERY_RESET_INTENT_VALUE,
  };
  if (overrides.cookie !== false) {
    headers.cookie = `${PASSWORD_RECOVERY_CONTEXT_COOKIE}=${PASSWORD_RECOVERY_CONTEXT_VALUE}`;
  }
  return new NextRequest(`${previewOrigin}/auth/recovery/reset`, {
    body: JSON.stringify({
      confirmation: overrides.confirmation ?? password,
      locale: "ar",
      password,
    }),
    headers,
    method: "POST",
  });
}

describe("password recovery callback and reset route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.approved.mockReturnValue(true);
    mocks.resolveOrigin.mockImplementation((origin: string) => origin);
    mocks.exchange.mockResolvedValue({
      data: { redirectType: "recovery", session: {}, user: {} },
      error: null,
    });
    mocks.verifyOtp.mockResolvedValue({ data: { session: {}, user: {} }, error: null });
    mocks.rpc.mockResolvedValue({ data: { is_staff: false }, error: null });
    mocks.getUser.mockResolvedValue({ data: { user: { id: "customer" } }, error: null });
    mocks.updateUser.mockResolvedValue({ data: { user: { id: "customer" } }, error: null });
    mocks.signOut.mockResolvedValue({ error: null });
  });

  it.each(["ar", "en"] as const)(
    "exchanges a verified %s recovery code and removes it from the redirect URL",
    async (locale) => {
      const response = await callback(recoveryCallback(locale));
      expect(response.headers.get("location")).toBe(`${previewOrigin}/${locale}/reset-password`);
      expect(response.headers.get("location")).not.toContain("code=");
      expect(response.headers.get("referrer-policy")).toBe("no-referrer");
      expect(response.headers.get("set-cookie")).toContain(PASSWORD_RECOVERY_CONTEXT_COOKIE);
    },
  );

  it("retains the stable Production origin for future Production recovery", async () => {
    mocks.resolveOrigin.mockReturnValue(productionOrigin);
    const response = await callback(recoveryCallback("en", productionOrigin));
    expect(response.headers.get("location")).toBe(`${productionOrigin}/en/reset-password`);
  });

  it("rejects a callback that claims recovery without a recovery code exchange", async () => {
    mocks.exchange.mockResolvedValue({
      data: { redirectType: null, session: {}, user: {} },
      error: null,
    });
    const response = await callback(recoveryCallback("ar"));
    expect(response.headers.get("location")).toBe(`${previewOrigin}/ar/login?auth_result=error`);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("updates only the recovery identity, consumes the context, and ends the local session", async () => {
    const response = await resetPassword(resetRequest());
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      redirect: "/ar/login?reset=success",
    });
    expect(mocks.getUser).toHaveBeenCalledOnce();
    expect(mocks.updateUser).toHaveBeenCalledWith({ password: "SafePassword1!" });
    expect(mocks.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(response.headers.get("set-cookie")).toContain(PASSWORD_RECOVERY_CONTEXT_COOKIE);
    expect(response.headers.get("set-cookie")).toMatch(/Max-Age=0/i);
  });

  it("rejects missing or replayed recovery context before password mutation", async () => {
    const response = await resetPassword(resetRequest({ cookie: false }));
    expect(response.status).toBe(403);
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });

  it("rejects an unapproved external origin before password mutation", async () => {
    mocks.approved.mockReturnValue(false);
    const response = await resetPassword(resetRequest({ origin: "https://attacker.example" }));
    expect(response.status).toBe(403);
    expect(mocks.getUser).not.toHaveBeenCalled();
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });

  it("rejects malformed or mismatched password input", async () => {
    const weak = await resetPassword(resetRequest({ password: "short" }));
    const mismatched = await resetPassword(resetRequest({ confirmation: "DifferentPassword2!" }));
    expect(weak.status).toBe(400);
    expect(mismatched.status).toBe(400);
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });

  it("fails safely when the recovery session is expired or invalid", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: new Error("expired") });
    const response = await resetPassword(resetRequest());
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ ok: false });
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });
});
