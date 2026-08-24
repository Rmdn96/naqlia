import { describe, expect, it } from "vitest";

import { STORAGE_BUCKETS } from "@/config/storage";

describe("STORAGE_BUCKETS", () => {
  it("keeps attachments private and public assets public", () => {
    expect(STORAGE_BUCKETS).toEqual([
      {
        access: "private",
        allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
        fileSizeLimit: 10 * 1024 * 1024,
        name: "attachments",
      },
      {
        access: "public",
        allowedMimeTypes: ["image/avif", "image/jpeg", "image/png", "image/webp"],
        fileSizeLimit: 5 * 1024 * 1024,
        name: "public-assets",
      },
    ]);
  });
});
