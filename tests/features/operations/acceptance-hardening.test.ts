import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("Operations acceptance hardening", () => {
  const actions = read("src/features/operations/actions/operations.actions.ts");
  const detail = read("src/features/operations/components/job-detail.tsx");
  const tracking = read("src/features/operations/components/tracking-view.tsx");

  it("surfaces scheduling conflicts and requires an explicit reasoned override", () => {
    expect(actions).toContain("+03:00");
    expect(actions).toContain('result.state === "conflict"');
    expect(actions).toContain("notice=schedule-conflict");
    expect(detail).toContain('notice === "schedule-conflict"');
    expect(detail).toContain('name="override"');
    expect(detail).toContain('name="reason"');
  });

  it("supports auditable cancellation decisions and confirmed manual completion", () => {
    expect(detail).toContain("reviewCancellationAction");
    expect(detail).toContain('value="approved"');
    expect(detail).toContain('value="rejected"');
    expect(actions).toContain("MANUAL_COMPLETION_CONFIRMATION_REQUIRED");
    expect(detail).toContain('name="confirm"');
  });

  it("shows only the currently projected Driver and Vehicle contacts", () => {
    expect(tracking).toContain("Current Trip team");
    expect(tracking).toContain("Call Driver");
    expect(tracking).toContain("WhatsApp Driver");
    expect(tracking).toContain("https://wa.me/${driverDigits}");
    expect(tracking).not.toContain("condition_internal_reason");
  });
});
