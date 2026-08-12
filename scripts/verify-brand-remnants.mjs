import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const allowedHistoricalFiles = new Set([
  "docs/backlog/02-Leaked-Password-Protection.md",
  "docs/implementation/05-Naqlk-Brand-Migration.md",
  "supabase/migrations/20260803140500_identity_create_foundation.sql",
  "supabase/migrations/20260803153000_core_business_create_schema.sql",
]);
const activeRoots = [".ai", ".env.example", "README.md", "docs", "messages", "package.json", "src"];
const oldBrandPattern = /Naqlia|NAQLIA|naqlia|نقلية/;
const trackedFiles = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "--", ...activeRoots],
  {
    cwd: process.cwd(),
    encoding: "utf8",
  },
)
  .split(/\r?\n/)
  .filter(Boolean);

const failures = trackedFiles.filter((file) => {
  if (allowedHistoricalFiles.has(file)) return false;
  const path = resolve(process.cwd(), file);
  return existsSync(path) && oldBrandPattern.test(readFileSync(path, "utf8"));
});

if (failures.length > 0) {
  console.error("Unapproved old-brand remnants found:\n" + failures.join("\n"));
  process.exit(1);
}

console.log(`Brand-remnant scan passed for ${trackedFiles.length} active tracked files.`);
