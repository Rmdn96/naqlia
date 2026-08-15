import { z } from "zod";

export const accountProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(120),
  locale: z.enum(["ar", "en"]),
  mobile: z.string().trim().max(20),
});

export function parseCapabilityUrl(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.hostname !== "localhost") return null;
    const match = /^\/(?:ar|en)\/(quote|track)\/([a-f0-9]{64})\/?$/.exec(url.pathname);
    return match
      ? { token: match[2], type: match[1] === "quote" ? "quotation" : "tracking" }
      : null;
  } catch {
    return null;
  }
}
