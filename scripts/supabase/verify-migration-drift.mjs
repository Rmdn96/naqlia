import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import postgres from "postgres";

const migrationsDirectory = resolve(process.cwd(), "supabase/migrations");
const manifestPath = resolve(process.cwd(), "supabase/migration-checksums.json");
const migrationFilePattern = /^(\d{14})_([a-z0-9_]+)\.sql$/;

function canonicalize(value) {
  return value.replace(/\r\n/g, "\n");
}

function checksum(value) {
  return createHash("sha256").update(canonicalize(value), "utf8").digest("hex");
}

function fail(messages) {
  for (const message of messages) {
    console.error(`migration-drift: ${message}`);
  }

  process.exitCode = 1;
}

async function readRepositoryMigrations() {
  const filenames = (await readdir(migrationsDirectory))
    .filter((filename) => filename.endsWith(".sql"))
    .sort();

  return Promise.all(
    filenames.map(async (filename) => {
      const match = migrationFilePattern.exec(filename);

      if (!match) {
        throw new Error(`Unsupported migration filename: ${filename}`);
      }

      return {
        filename,
        name: match[2],
        repository_sha256: checksum(await readFile(resolve(migrationsDirectory, filename), "utf8")),
        version: match[1],
      };
    }),
  );
}

async function main() {
  const databaseUrl = process.env.SUPABASE_DB_URL;

  if (!databaseUrl) {
    throw new Error("SUPABASE_DB_URL is required for read-only migration drift verification");
  }

  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const repositoryMigrations = await readRepositoryMigrations();
  const manifestRepositoryMigrations = manifest.migrations.map(
    ({ filename, name, repository_sha256, version }) => ({
      filename,
      name,
      repository_sha256,
      version,
    }),
  );
  const errors = [];

  if (JSON.stringify(repositoryMigrations) !== JSON.stringify(manifestRepositoryMigrations)) {
    errors.push(
      "repository migrations do not match supabase/migration-checksums.json; review the change and update the approved baseline",
    );
  }

  if (errors.length > 0) {
    fail(errors);
    return;
  }

  const sql = postgres(databaseUrl, {
    connect_timeout: 15,
    idle_timeout: 5,
    max: 1,
    prepare: false,
    ssl: "require",
  });

  try {
    const history = await sql`
      select version, name, statements
      from supabase_migrations.schema_migrations
      order by version
    `;
    const expectedByVersion = new Map(
      manifest.migrations.map((migration) => [migration.version, migration]),
    );
    const historyByVersion = new Map(history.map((migration) => [migration.version, migration]));

    for (const expected of manifest.migrations) {
      const applied = historyByVersion.get(expected.version);

      if (!applied) {
        errors.push(`target database is missing migration ${expected.version}_${expected.name}`);
        continue;
      }

      if (applied.name !== expected.name) {
        errors.push(
          `migration ${expected.version} name mismatch (expected ${expected.name}, received ${applied.name})`,
        );
      }

      const appliedSql = Array.isArray(applied.statements) ? applied.statements.join("\n") : "";
      const appliedChecksum = checksum(appliedSql);

      if (appliedChecksum !== expected.production_history_sha256) {
        errors.push(
          `migration ${expected.version} history checksum mismatch (expected ${expected.production_history_sha256}, received ${appliedChecksum})`,
        );
      }
    }

    for (const applied of history) {
      if (!expectedByVersion.has(applied.version)) {
        errors.push(
          `target database contains unapproved migration ${applied.version}_${applied.name}`,
        );
      }
    }
  } finally {
    await sql.end({ timeout: 5 });
  }

  if (errors.length > 0) {
    fail(errors);
    return;
  }

  console.log(`migration-drift: verified ${manifest.migrations.length} migrations successfully`);
}

main().catch((error) => {
  fail([error instanceof Error ? error.message : "unexpected verification failure"]);
});
