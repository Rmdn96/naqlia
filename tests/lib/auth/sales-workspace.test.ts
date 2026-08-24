import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthorizationError } from "@/lib/auth/authorization";
import {
  hasSalesWorkspacePermission,
  requireSalesWorkspacePermission,
} from "@/lib/auth/sales-workspace";
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

describe("Sales workspace authorization", () => {
  it("fails closed before calling the RBAC function without an authenticated subject", async () => {
    getClaims.mockResolvedValue({ data: { claims: {} }, error: null });

    await expect(hasSalesWorkspacePermission("sales.workspace.read")).resolves.toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("uses the authoritative permission decision", async () => {
    getClaims.mockResolvedValue({ data: { claims: { sub: "staff-user-id" } }, error: null });
    rpc.mockResolvedValue({ data: true, error: null });

    await expect(hasSalesWorkspacePermission("sales.workspace.manage")).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith("has_permission", {
      requested_permission: "sales.workspace.manage",
    });
  });

  it("throws the shared stable authorization error when access is denied", async () => {
    getClaims.mockResolvedValue({ data: { claims: { sub: "staff-user-id" } }, error: null });
    rpc.mockResolvedValue({ data: false, error: null });

    await expect(requireSalesWorkspacePermission("sales.workspace.read")).rejects.toEqual(
      expect.objectContaining<Partial<AuthorizationError>>({
        code: "FORBIDDEN",
        name: "AuthorizationError",
      }),
    );
  });
});
