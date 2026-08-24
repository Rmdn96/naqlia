import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  AuthorizationError,
  hasIdentityPermission,
  requireIdentityPermission,
} from "@/lib/auth/authorization";
import { createServerSupabaseClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(),
}));

const getClaims = vi.fn();
const rpc = vi.fn();

beforeEach(() => {
  getClaims.mockReset();
  rpc.mockReset();
  vi.mocked(createServerSupabaseClient).mockResolvedValue({
    auth: { getClaims },
    rpc,
  } as never);
});

describe("hasIdentityPermission", () => {
  it("fails closed when the identity cannot be verified", async () => {
    getClaims.mockResolvedValue({ data: null, error: new Error("invalid session") });

    await expect(hasIdentityPermission("identity.profile.read")).resolves.toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("fails closed for a verified response without a subject", async () => {
    getClaims.mockResolvedValue({ data: { claims: {} }, error: null });

    await expect(hasIdentityPermission("identity.profile.read")).resolves.toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("returns the authoritative database decision", async () => {
    getClaims.mockResolvedValue({ data: { claims: { sub: "auth-user-id" } }, error: null });
    rpc.mockResolvedValue({ data: true, error: null });

    await expect(hasIdentityPermission("identity.role.read")).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith("has_permission", {
      requested_permission: "identity.role.read",
    });
  });

  it("fails closed when the permission check fails", async () => {
    getClaims.mockResolvedValue({ data: { claims: { sub: "auth-user-id" } }, error: null });
    rpc.mockResolvedValue({ data: null, error: new Error("dependency failure") });

    await expect(hasIdentityPermission("identity.role.read")).resolves.toBe(false);
  });
});

describe("requireIdentityPermission", () => {
  it("throws a stable authorization error when access is denied", async () => {
    getClaims.mockResolvedValue({ data: { claims: { sub: "auth-user-id" } }, error: null });
    rpc.mockResolvedValue({ data: false, error: null });

    await expect(requireIdentityPermission("identity.assignment.manage")).rejects.toEqual(
      expect.objectContaining<Partial<AuthorizationError>>({
        code: "FORBIDDEN",
        name: "AuthorizationError",
      }),
    );
  });
});
