import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { EDITORIAL_CITY_CODES, EDITORIAL_CITY_RECORDS } from "./editorial-rollout-v1.mjs";

const migrationName = "20260822210000_seo_editorial_rollout_v1.sql";
const rollbackName = "20260822210000_seo_editorial_rollout_v1.rollback.sql";
const migrationPath = resolve(process.cwd(), "supabase/migrations", migrationName);
const rollbackPath = resolve(process.cwd(), "supabase/rollbacks", rollbackName);

const forbidden =
  /(cheapest|#1|number one|best in saudi|guaranteed fastest|all.kingdom|الأرخص|رقم\s*1|الأفضل في السعودية|الأسرع مضمون|جميع أنحاء المملكة)/iu;
const html = /<[\s]*(script|iframe|object|embed|style)/iu;

function assert(condition, message) {
  if (!condition) throw new Error(`seo-editorial-rollout: ${message}`);
}

function normalize(value) {
  return value
    .toLocaleLowerCase("en")
    .replace(/[\p{P}\p{S}]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(record) {
  return new Set(
    normalize(
      `${record.introduction} ${record.serviceAreaContent} ${record.neighborhoodCoverageText}`,
    )
      .split(" ")
      .filter((token) => token.length > 3),
  );
}

function jaccard(left, right) {
  const intersection = [...left].filter((token) => right.has(token)).length;
  return intersection / (left.size + right.size - intersection);
}

function validate() {
  assert(EDITORIAL_CITY_CODES.length === 21, "expected 21 remaining city profiles");
  assert(new Set(EDITORIAL_CITY_CODES).size === 21, "city codes must be unique");
  assert(EDITORIAL_CITY_RECORDS.length === 42, "expected 42 localized records");

  const unique = {
    cityLocale: new Set(),
    localeSlug: new Set(),
    title: new Set(),
    meta: new Set(),
    heading: new Set(),
  };

  for (const record of EDITORIAL_CITY_RECORDS) {
    const label = `${record.cityCode}/${record.locale}`;
    assert(["ar", "en"].includes(record.locale), `${label}: unsupported locale`);
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug), `${label}: invalid slug`);
    assert(
      record.seoTitle.trim().length >= 30 && record.seoTitle.trim().length <= 65,
      `${label}: SEO title must be 30–65 characters`,
    );
    assert(
      record.metaDescription.trim().length >= 100 && record.metaDescription.trim().length <= 170,
      `${label}: meta description must be 100–170 characters`,
    );
    assert(
      record.pageHeading.trim().length >= 12 && record.pageHeading.trim().length <= 120,
      `${label}: H1 must be 12–120 characters`,
    );
    assert(
      record.introduction.trim().length >= 180,
      `${label}: introduction must be at least 180 characters`,
    );
    assert(
      record.serviceAreaContent.trim().length >= 180,
      `${label}: service content must be at least 180 characters`,
    );
    assert(
      record.neighborhoodCoverageText.trim().length >= 40,
      `${label}: coverage content must be at least 40 characters`,
    );
    assert(
      record.introduction.trim().length +
        record.serviceAreaContent.trim().length +
        record.neighborhoodCoverageText.trim().length >=
        500,
      `${label}: editorial depth must be at least 500 characters`,
    );
    assert(record.faqs.length >= 2, `${label}: at least two FAQs are required`);
    assert(
      !forbidden.test(
        Object.values(record)
          .filter((value) => typeof value === "string")
          .join(" "),
      ),
      `${label}: unsupported claim detected`,
    );
    assert(!html.test(JSON.stringify(record)), `${label}: unsafe HTML detected`);
    assert(
      record.locale !== "ar" || /[\u0600-\u06ff]/u.test(record.introduction),
      `${label}: Arabic copy is missing`,
    );
    assert(
      record.locale !== "en" || !/[\u0600-\u06ff]/u.test(record.introduction),
      `${label}: English introduction contains Arabic copy`,
    );

    for (const faq of record.faqs) {
      assert(
        faq.question.trim().length >= 12 && faq.question.trim().length <= 220,
        `${label}: FAQ question length invalid`,
      );
      assert(
        faq.answer.trim().length >= 40 && faq.answer.trim().length <= 1000,
        `${label}: FAQ answer length invalid`,
      );
    }

    for (const [key, value] of [
      ["cityLocale", `${record.cityCode}:${record.locale}`],
      ["localeSlug", `${record.locale}:${record.slug}`],
      ["title", normalize(record.seoTitle)],
      ["meta", normalize(record.metaDescription)],
      ["heading", normalize(record.pageHeading)],
    ]) {
      assert(!unique[key].has(value), `${label}: duplicate ${key}`);
      unique[key].add(value);
    }
  }

  const pairMap = new Map();
  for (const record of EDITORIAL_CITY_RECORDS) {
    const pair = pairMap.get(record.cityCode) ?? new Set();
    pair.add(record.locale);
    pairMap.set(record.cityCode, pair);
  }
  for (const [code, locales] of pairMap) {
    assert(
      locales.size === 2 && locales.has("ar") && locales.has("en"),
      `${code}: incomplete locale pair`,
    );
  }

  let maximumSimilarity = { score: 0, left: "", right: "" };
  for (let index = 0; index < EDITORIAL_CITY_RECORDS.length; index += 1) {
    for (let compare = index + 1; compare < EDITORIAL_CITY_RECORDS.length; compare += 1) {
      const left = EDITORIAL_CITY_RECORDS[index];
      const right = EDITORIAL_CITY_RECORDS[compare];
      if (left.locale !== right.locale) continue;
      const score = jaccard(tokens(left), tokens(right));
      if (score > maximumSimilarity.score) {
        maximumSimilarity = {
          score,
          left: `${left.cityCode}/${left.locale}`,
          right: `${right.cityCode}/${right.locale}`,
        };
      }
    }
  }
  assert(
    maximumSimilarity.score < 0.58,
    `editorial similarity ${maximumSimilarity.score.toFixed(3)} between ${maximumSimilarity.left} and ${maximumSimilarity.right}`,
  );

  return maximumSimilarity;
}

function quote(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function json(value) {
  return `${quote(JSON.stringify(value))}::jsonb`;
}

function sqlArray(values) {
  return `array[${values.map(quote).join(",")}]::text[]`;
}

function renderMigration(similarity) {
  const rows = EDITORIAL_CITY_RECORDS.map(
    (record) =>
      `  (${[
        record.cityCode,
        record.locale,
        record.slug,
        record.seoTitle,
        record.metaDescription,
        record.pageHeading,
        record.introduction,
        record.serviceAreaContent,
        record.neighborhoodCoverageText,
      ]
        .map(quote)
        .join(",")},${json(record.faqs)})`,
  ).join(",\n");

  return `-- Naqlk SEO Editorial Rollout v1
-- Generated from scripts/seo/editorial-rollout-v1.mjs.
-- Maximum same-locale editorial Jaccard similarity: ${similarity.score.toFixed(3)} (${similarity.left} / ${similarity.right}).
begin;

create temporary table editorial_rollout_v1 (
  city_code text not null,
  locale text not null,
  slug text not null,
  seo_title text not null,
  meta_description text not null,
  page_heading text not null,
  introduction text not null,
  service_area_content text not null,
  neighborhood_coverage_text text not null,
  faqs jsonb not null,
  primary key(city_code,locale)
) on commit drop;

insert into editorial_rollout_v1 values
${rows};

do $$
declare
  v_codes constant text[] := ${sqlArray(EDITORIAL_CITY_CODES)};
  v_dirty text;
begin
  if (select count(*) from editorial_rollout_v1) <> 42 then
    raise exception 'SEO editorial rollout must contain exactly 42 locale records';
  end if;

  if (select count(distinct city_code) from editorial_rollout_v1) <> 21 then
    raise exception 'SEO editorial rollout must contain exactly 21 cities';
  end if;

  if exists (
    select 1 from editorial_rollout_v1 r
    left join public.cities c on c.city_code=r.city_code and c.deleted_at is null
    where c.id is null or c.status<>'active'
  ) then
    raise exception 'SEO editorial rollout contains a missing or inactive Service Area city';
  end if;

  select string_agg(c.city_code||'/'||s.locale,', ' order by c.city_code,s.locale)
    into v_dirty
  from public.city_seo_contents s
  join public.cities c on c.id=s.city_id
  where c.city_code=any(v_codes)
    and (
      s.content_status<>'draft' or s.is_indexable or s.published_at is not null or s.version<>1
      or s.seo_title is not null or s.meta_description is not null or s.page_heading is not null
      or s.introduction is not null or s.service_area_content is not null
      or s.neighborhood_coverage_text is not null
      or s.created_by_profile_id is not null or s.updated_by_profile_id is not null
      or exists(select 1 from public.city_seo_faqs f where f.city_seo_content_id=s.id)
      or exists(select 1 from public.city_seo_routes p where p.city_seo_content_id=s.id)
    );

  if v_dirty is not null then
    raise exception 'SEO editorial rollout refuses to overwrite operator-managed content: %',v_dirty;
  end if;

  if (
    select count(*) from public.city_seo_contents s
    join public.cities c on c.id=s.city_id
    where c.city_code=any(v_codes) and s.locale in ('ar','en')
  ) <> 42 then
    raise exception 'SEO registry is missing an expected locale record';
  end if;
end $$;

update public.city_seo_contents s set
  slug=r.slug,
  seo_title=r.seo_title,
  meta_description=r.meta_description,
  page_heading=r.page_heading,
  introduction=r.introduction,
  service_area_content=r.service_area_content,
  neighborhood_coverage_text=r.neighborhood_coverage_text,
  updated_at=now()
from editorial_rollout_v1 r
join public.cities c on c.city_code=r.city_code
where s.city_id=c.id and s.locale=r.locale;

insert into public.city_seo_faqs(city_seo_content_id,question,answer,display_order)
select s.id,f.item->>'question',f.item->>'answer',(f.item->>'displayOrder')::integer
from editorial_rollout_v1 r
join public.cities c on c.city_code=r.city_code
join public.city_seo_contents s on s.city_id=c.id and s.locale=r.locale
cross join lateral jsonb_array_elements(r.faqs) f(item);

do $$
declare v_not_ready text;
begin
  select string_agg(c.city_code||'/'||s.locale||':'||array_to_string(private.city_seo_readiness_issues(s.id),','),'; ' order by c.city_code,s.locale)
    into v_not_ready
  from public.city_seo_contents s
  join public.cities c on c.id=s.city_id
  join editorial_rollout_v1 r on r.city_code=c.city_code and r.locale=s.locale
  where cardinality(private.city_seo_readiness_issues(s.id))<>0;

  if v_not_ready is not null then
    raise exception 'SEO editorial readiness failed: %',v_not_ready;
  end if;
end $$;

update public.city_seo_contents s set
  content_status='published',
  is_indexable=true,
  published_at=now(),
  updated_at=now(),
  version=version+1
from editorial_rollout_v1 r
join public.cities c on c.city_code=r.city_code
where s.city_id=c.id and s.locale=r.locale
  and cardinality(private.city_seo_readiness_issues(s.id))=0;

do $$
begin
  if (
    select count(*) from public.city_seo_contents s
    join public.cities c on c.id=s.city_id
    where c.status='active' and c.deleted_at is null
      and s.content_status='published' and s.is_indexable
      and cardinality(private.city_seo_readiness_issues(s.id))=0
  ) <> 44 then
    raise exception 'SEO editorial rollout did not produce 44 readiness-valid published locale records';
  end if;
end $$;

comment on table public.city_seo_contents is
  'Localized city SEO registry. Riyadh was seeded by SEO v1; the guarded Editorial Rollout v1 published the remaining approved locale records without bypassing Admin lifecycle controls.';

commit;
`;
}

function renderRollback() {
  return `-- Conservative rollback for ${migrationName}
-- Refuses to run after any operator has edited a rollout record.
begin;

do $$
declare v_changed text;
begin
  select string_agg(c.city_code||'/'||s.locale,', ' order by c.city_code,s.locale)
    into v_changed
  from public.city_seo_contents s join public.cities c on c.id=s.city_id
  where c.city_code=any(${sqlArray(EDITORIAL_CITY_CODES)})
    and (s.version<>2 or s.updated_by_profile_id is not null or s.created_by_profile_id is not null);
  if v_changed is not null then
    raise exception 'Rollback refused because editorial content may have operator changes: %',v_changed;
  end if;
end $$;

delete from public.city_seo_faqs f
using public.city_seo_contents s,public.cities c
where f.city_seo_content_id=s.id and s.city_id=c.id
  and c.city_code=any(${sqlArray(EDITORIAL_CITY_CODES)});

update public.city_seo_contents s set
  seo_title=null,meta_description=null,page_heading=null,introduction=null,
  service_area_content=null,neighborhood_coverage_text=null,
  content_status='draft',is_indexable=false,published_at=null,
  updated_at=now(),version=version+1
from public.cities c
where s.city_id=c.id and c.city_code=any(${sqlArray(EDITORIAL_CITY_CODES)});

commit;
`;
}

const similarity = validate();
if (process.argv.includes("--check")) {
  const expected = renderMigration(similarity).replaceAll("\r\n", "\n");
  const actual = readFileSync(migrationPath, "utf8").replaceAll("\r\n", "\n");
  assert(expected === actual, `${migrationName} is not synchronized with the editorial source`);
  console.log(
    `seo-editorial-rollout: 42 locale records valid; maximum same-locale Jaccard similarity ${similarity.score.toFixed(3)} (${similarity.left}/${similarity.right})`,
  );
} else {
  writeFileSync(migrationPath, renderMigration(similarity), "utf8");
  writeFileSync(rollbackPath, renderRollback(), "utf8");
  console.log(`seo-editorial-rollout: generated ${migrationName} and conservative rollback`);
}
