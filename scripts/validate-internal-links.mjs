import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";

const repositoryRoot = process.cwd();
const roots = [
  resolve(repositoryRoot, "README.md"),
  resolve(repositoryRoot, ".ai"),
  resolve(repositoryRoot, "docs"),
];

function markdownFiles(path) {
  if (!existsSync(path)) return [];
  if (!statSync(path).isDirectory()) return extname(path) === ".md" ? [path] : [];
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) =>
    markdownFiles(resolve(path, entry.name)),
  );
}

const failures = [];
const files = roots.flatMap(markdownFiles);

for (const file of files) {
  const content = readFileSync(file, "utf8");
  const links = content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g);

  for (const match of links) {
    const rawTarget = match[1].trim().replace(/^<|>$/g, "");

    if (!rawTarget || rawTarget.startsWith("#") || /^[a-z][a-z+.-]*:/i.test(rawTarget)) continue;

    const fileTarget = decodeURIComponent(rawTarget.split("#", 1)[0]);
    const resolvedTarget = resolve(dirname(file), fileTarget);

    if (!existsSync(resolvedTarget)) failures.push(`${file}: ${rawTarget}`);
  }
}

if (failures.length > 0) {
  console.error("Internal link validation failed:\n" + failures.join("\n"));
  process.exit(1);
}

console.log(`Internal link validation passed for ${files.length} Markdown files.`);
