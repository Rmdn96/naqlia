import { describe, expect, it } from "vitest";

import {
  classifyStaffInvitationFailure,
  getAdministrationResultMessage,
} from "@/features/staff-portal/lib/invitation-status";

describe("Staff invitation delivery status", () => {
  it("classifies the provider email-send limit without exposing provider details", () => {
    expect(classifyStaffInvitationFailure({ status: 429 })).toBe("invite_rate_limited");
    expect(classifyStaffInvitationFailure({ code: "over_email_send_rate_limit" })).toBe(
      "invite_rate_limited",
    );
  });

  it("keeps unrelated Auth failures generic", () => {
    expect(classifyStaffInvitationFailure({ code: "unexpected_failure", status: 500 })).toBe(
      "invite_failed",
    );
    expect(classifyStaffInvitationFailure(null)).toBe("invite_failed");
  });

  it("provides localized operator retry guidance without granting Staff access", () => {
    expect(getAdministrationResultMessage("ar", "invite_rate_limited")).toContain(
      "لم يتم منح صلاحية موظف",
    );
    expect(getAdministrationResultMessage("en", "invite_rate_limited")).toContain(
      "No Staff access was granted",
    );
  });

  it("does not render internal result codes for unknown failures", () => {
    expect(getAdministrationResultMessage("en", "private_provider_detail")).not.toContain(
      "private_provider_detail",
    );
  });
});
