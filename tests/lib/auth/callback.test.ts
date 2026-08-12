import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const exchangeCodeForSession = vi.fn();
const verifyOtp = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: { exchangeCodeForSession, verifyOtp },
  })),
}));

import { GET } from "@/app/auth/callback/route";

describe("staff authentication callback", () => {
  beforeEach(() => {
    exchangeCodeForSession.mockReset().mockResolvedValue({ error: null });
    verifyOtp.mockReset().mockResolvedValue({ error: null });
  });

  it("exchanges a PKCE authorization code", async () => {
    const response = await GET(
      new NextRequest("https://naqlk.vercel.app/auth/callback?code=pkce-code&next=/en/sales/leads"),
    );

    expect(exchangeCodeForSession).toHaveBeenCalledWith("pkce-code");
    expect(response.headers.get("location")).toBe("https://naqlk.vercel.app/en/sales/leads");
  });

  it("verifies the production magic-link token hash", async () => {
    const response = await GET(
      new NextRequest(
        "https://naqlk.vercel.app/auth/callback?token_hash=secure-token-hash&type=magiclink&next=/en/sales/leads",
      ),
    );

    expect(verifyOtp).toHaveBeenCalledWith({ token_hash: "secure-token-hash", type: "magiclink" });
    expect(response.headers.get("location")).toBe("https://naqlk.vercel.app/en/sales/leads");
  });

  it("rejects unsupported callback credentials", async () => {
    const response = await GET(
      new NextRequest(
        "https://naqlk.vercel.app/auth/callback?token_hash=secure-token-hash&type=recovery&next=/en/sales/leads",
      ),
    );

    expect(exchangeCodeForSession).not.toHaveBeenCalled();
    expect(verifyOtp).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe(
      "https://naqlk.vercel.app/en/sales/leads?auth_result=error",
    );
  });
});
