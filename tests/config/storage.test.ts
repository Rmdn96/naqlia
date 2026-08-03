import { describe, expect, it } from "vitest";

import { STORAGE_BUCKETS } from "@/config/storage";

describe("STORAGE_BUCKETS", () => {
  it("keeps attachments private and public assets public", () => {
    expect(STORAGE_BUCKETS).toEqual([
      { access: "private", name: "attachments" },
      { access: "public", name: "public-assets" },
    ]);
  });
});
