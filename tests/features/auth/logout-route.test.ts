import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  approved: vi.fn(),
  forwardedOrigin: vi.fn(),
  resolveOrigin: vi.fn(),
  terminate: vi.fn(),
}));

vi.mock("@/lib/auth/redirect-origin.server", () => ({
  getForwardedRequestOrigin: mocks.forwardedOrigin,
  isApprovedServerAuthOrigin: mocks.approved,
  resolveServerAuthRedirectOrigin: mocks.resolveOrigin,
}));

vi.mock("@/lib/supabase/server", () => ({
  terminateRouteSupabaseSession: mocks.terminate,
}));

import { POST } from "@/app/auth/sign-out/route";

const previewOrigin = "https://naqlk-git-feature-auth-visual-upgrade-mohamed-ramadan.vercel.app";

function signOutRequest(
  locale: string,
  origin: string | null = previewOrigin,
  secFetchSite = "same-origin",
) {
  const headers: Record<string, string> = {
    "content-type": "application/x-www-form-urlencoded",
    "sec-fetch-site": secFetchSite,
  };
  if (origin) headers.origin = origin;
  return new NextRequest("https://internal-deployment.vercel.app/auth/sign-out", {
    body: new URLSearchParams({ locale }),
    headers,
    method: "POST",
  });
}

describe("POST /auth/sign-out", () => {
  beforeEach(() => {
    mocks.approved.mockReset();
    mocks.forwardedOrigin.mockReset();
    mocks.resolveOrigin.mockReset();
    mocks.terminate.mockReset();
    mocks.approved.mockReturnValue(true);
    mocks.forwardedOrigin.mockReturnValue(previewOrigin);
    mocks.resolveOrigin.mockReturnValue(previewOrigin);
    mocks.terminate.mockResolvedValue({ error: null });
  });

  it("returns a real 303 to the localized public homepage", async () => {
    const response = await POST(signOutRequest("en"));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(`${previewOrigin}/en`);
    expect(response.headers.get("location")).not.toContain("/auth/sign-out");
    expect(response.headers.get("cache-control")).toBe("private, no-store, max-age=0");
    expect(mocks.terminate).toHaveBeenCalledOnce();
  });

  it("falls back to Arabic without accepting an arbitrary redirect", async () => {
    const response = await POST(signOutRequest("https://attacker.example"));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(`${previewOrigin}/ar`);
  });

  it("accepts same-origin browser navigation through an approved Vercel forwarded host", async () => {
    mocks.approved.mockImplementation((origin: string | null) => origin === previewOrigin);
    const response = await POST(signOutRequest("ar", null));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(`${previewOrigin}/ar`);
    expect(mocks.terminate).toHaveBeenCalledOnce();
  });

  it("rejects unapproved origins before session mutation", async () => {
    mocks.approved.mockReturnValue(false);
    const response = await POST(signOutRequest("ar", "https://attacker.example", "cross-site"));
    expect(response.status).toBe(403);
    expect(response.headers.get("location")).toBeNull();
    expect(mocks.terminate).not.toHaveBeenCalled();
  });

  it("does not fall back when an explicit unapproved origin is present", async () => {
    mocks.approved.mockImplementation((origin: string | null) => origin === previewOrigin);
    const response = await POST(signOutRequest("ar", "https://attacker.example"));

    expect(response.status).toBe(403);
    expect(mocks.forwardedOrigin).not.toHaveBeenCalled();
    expect(mocks.terminate).not.toHaveBeenCalled();
  });
});
