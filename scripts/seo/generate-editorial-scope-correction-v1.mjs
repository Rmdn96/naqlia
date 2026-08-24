import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { EDITORIAL_SCOPE_CORRECTIONS } from "./editorial-scope-correction-v1.mjs";

const migrationName = "20260822213000_seo_editorial_scope_correction_v1.sql";
const rollbackName = "20260822213000_seo_editorial_scope_correction_v1.rollback.sql";
const migrationPath = resolve(process.cwd(), "supabase/migrations", migrationName);
const rollbackPath = resolve(process.cwd(), "supabase/rollbacks", rollbackName);
const forbidden =
  /(cheapest|#1|number one|best in saudi|guaranteed fastest|all.kingdom|الأرخص|رقم\s*1|الأفضل في السعودية|الأسرع مضمون|جميع أنحاء المملكة)/iu;

function assert(condition, message) {
  if (!condition) throw new Error(`seo-editorial-scope: ${message}`);
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
    normalize(`${record.introduction} ${record.neighborhoodCoverageText}`)
      .split(" ")
      .filter((token) => token.length > 3),
  );
}

function similarity(left, right) {
  const common = [...left].filter((token) => right.has(token)).length;
  return common / (left.size + right.size - common);
}

function validate() {
  assert(EDITORIAL_SCOPE_CORRECTIONS.length === 42, "expected 42 corrected locale records");
  const titles = new Set();
  const descriptions = new Set();
  const headings = new Set();
  let maximum = { score: 0, left: "", right: "" };

  for (const record of EDITORIAL_SCOPE_CORRECTIONS) {
    const label = `${record.cityCode}/${record.locale}`;
    assert(record.seoTitle.length >= 30 && record.seoTitle.length <= 65, `${label}: title length`);
    assert(
      record.metaDescription.length >= 100 && record.metaDescription.length <= 170,
      `${label}: description length`,
    );
    assert(
      record.pageHeading.length >= 12 && record.pageHeading.length <= 120,
      `${label}: H1 length`,
    );
    assert(record.introduction.length >= 180, `${label}: introduction length`);
    assert(record.serviceAreaContent.length >= 180, `${label}: service content length`);
    assert(
      record.introduction.length +
        record.serviceAreaContent.length +
        record.neighborhoodCoverageText.length >=
        500,
      `${label}: editorial depth`,
    );
    assert(record.faqs.length >= 2, `${label}: FAQ count`);
    assert(!forbidden.test(JSON.stringify(record)), `${label}: unsupported claim`);
    assert(
      record.serviceAreaContent.includes(record.locale === "ar" ? "الرياض" : "Riyadh"),
      `${label}: missing Riyadh-origin boundary`,
    );
    assert(
      record.serviceAreaContent.includes(record.locale === "ar" ? "ليس ضمن" : "not in"),
      `${label}: missing local-scope exclusion`,
    );

    for (const [set, value, name] of [
      [titles, normalize(record.seoTitle), "title"],
      [descriptions, normalize(record.metaDescription), "description"],
      [headings, normalize(record.pageHeading), "H1"],
    ]) {
      assert(!set.has(value), `${label}: duplicate ${name}`);
      set.add(value);
    }
    for (const faq of record.faqs) {
      assert(faq.question.length >= 12 && faq.question.length <= 220, `${label}: FAQ question`);
      assert(faq.answer.length >= 40 && faq.answer.length <= 1000, `${label}: FAQ answer`);
    }
  }

  for (let index = 0; index < EDITORIAL_SCOPE_CORRECTIONS.length; index += 1) {
    for (let compare = index + 1; compare < EDITORIAL_SCOPE_CORRECTIONS.length; compare += 1) {
      const left = EDITORIAL_SCOPE_CORRECTIONS[index];
      const right = EDITORIAL_SCOPE_CORRECTIONS[compare];
      if (left.locale !== right.locale) continue;
      const score = similarity(tokens(left), tokens(right));
      if (score > maximum.score)
        maximum = {
          score,
          left: `${left.cityCode}/${left.locale}`,
          right: `${right.cityCode}/${right.locale}`,
        };
    }
  }
  assert(
    maximum.score < 0.58,
    `similarity ${maximum.score.toFixed(3)} between ${maximum.left} and ${maximum.right}`,
  );
  return maximum;
}

function quote(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function json(value) {
  return `${quote(JSON.stringify(value))}::jsonb`;
}

function renderMigration(maximum) {
  const rows = EDITORIAL_SCOPE_CORRECTIONS.map(
    (record) =>
      `  (${[
        record.cityCode,
        record.locale,
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

  return `-- Forward-only factual-scope correction discovered during Editorial Rollout Preview acceptance.
-- Keeps the approved MVP geography: Riyadh-local and Riyadh-origin intercity only.
-- Maximum same-locale editorial Jaccard similarity: ${maximum.score.toFixed(3)} (${maximum.left} / ${maximum.right}).
begin;

create temporary table editorial_scope_correction_v1 (
  city_code text not null,locale text not null,seo_title text not null,
  meta_description text not null,page_heading text not null,introduction text not null,
  service_area_content text not null,neighborhood_coverage_text text not null,faqs jsonb not null,
  primary key(city_code,locale)
) on commit drop;

insert into editorial_scope_correction_v1 values
${rows};

do $$
declare v_changed text;
begin
  if (select count(*) from editorial_scope_correction_v1)<>42 then
    raise exception 'SEO scope correction must contain exactly 42 locale records';
  end if;
  select string_agg(c.city_code||'/'||s.locale,', ' order by c.city_code,s.locale) into v_changed
  from public.city_seo_contents s join public.cities c on c.id=s.city_id
  join editorial_scope_correction_v1 r on r.city_code=c.city_code and r.locale=s.locale
  where c.status<>'active' or c.deleted_at is not null
    or s.version<>2 or s.content_status<>'published' or not s.is_indexable
    or s.created_by_profile_id is not null or s.updated_by_profile_id is not null
    or (select count(*) from public.city_seo_faqs f where f.city_seo_content_id=s.id)<>3
    or exists(select 1 from public.city_seo_routes p where p.city_seo_content_id=s.id);
  if v_changed is not null then
    raise exception 'SEO scope correction refuses records changed after initial rollout: %',v_changed;
  end if;
end $$;

update public.city_seo_contents s set
  seo_title=r.seo_title,meta_description=r.meta_description,page_heading=r.page_heading,
  introduction=r.introduction,service_area_content=r.service_area_content,
  neighborhood_coverage_text=r.neighborhood_coverage_text,updated_at=now()
from editorial_scope_correction_v1 r join public.cities c on c.city_code=r.city_code
where s.city_id=c.id and s.locale=r.locale;

delete from public.city_seo_faqs f using public.city_seo_contents s,public.cities c,
  editorial_scope_correction_v1 r
where f.city_seo_content_id=s.id and s.city_id=c.id
  and r.city_code=c.city_code and r.locale=s.locale;

insert into public.city_seo_faqs(city_seo_content_id,question,answer,display_order)
select s.id,f.item->>'question',f.item->>'answer',(f.item->>'displayOrder')::integer
from editorial_scope_correction_v1 r join public.cities c on c.city_code=r.city_code
join public.city_seo_contents s on s.city_id=c.id and s.locale=r.locale
cross join lateral jsonb_array_elements(r.faqs) f(item);

do $$
declare v_not_ready text;
begin
  select string_agg(c.city_code||'/'||s.locale||':'||array_to_string(private.city_seo_readiness_issues(s.id),','),'; ')
    into v_not_ready
  from public.city_seo_contents s join public.cities c on c.id=s.city_id
  join editorial_scope_correction_v1 r on r.city_code=c.city_code and r.locale=s.locale
  where cardinality(private.city_seo_readiness_issues(s.id))<>0;
  if v_not_ready is not null then raise exception 'SEO corrected content failed readiness: %',v_not_ready; end if;
end $$;

update public.city_seo_contents s set updated_at=now(),version=version+1
from editorial_scope_correction_v1 r join public.cities c on c.city_code=r.city_code
where s.city_id=c.id and s.locale=r.locale
  and cardinality(private.city_seo_readiness_issues(s.id))=0;

do $$
begin
  if (select count(*) from public.city_seo_contents s join public.cities c on c.id=s.city_id
      where c.status='active' and c.deleted_at is null and s.content_status='published'
        and s.is_indexable and cardinality(private.city_seo_readiness_issues(s.id))=0)<>44 then
    raise exception 'SEO scope correction did not preserve 44 valid published locale records';
  end if;
end $$;

commit;
`;
}

function renderRollback() {
  return `-- Safe exposure rollback for ${migrationName}.
-- Retains corrected copy, but moves rollout records to Draft/noindex.
begin;
do $$
begin
  if exists(select 1 from public.city_seo_contents s join public.cities c on c.id=s.city_id
    where c.city_code in (${[...new Set(EDITORIAL_SCOPE_CORRECTIONS.map((record) => record.cityCode))].map(quote).join(",")})
      and (s.version<>3 or s.created_by_profile_id is not null or s.updated_by_profile_id is not null)) then
    raise exception 'Rollback refused because corrected editorial records may have operator changes';
  end if;
end $$;
update public.city_seo_contents s set content_status='draft',is_indexable=false,published_at=null,
  updated_at=now(),version=version+1
from public.cities c where s.city_id=c.id and c.city_code in (${[...new Set(EDITORIAL_SCOPE_CORRECTIONS.map((record) => record.cityCode))].map(quote).join(",")});
commit;
`;
}

const maximum = validate();
if (process.argv.includes("--check")) {
  assert(
    readFileSync(migrationPath, "utf8").replaceAll("\r\n", "\n") === renderMigration(maximum),
    `${migrationName} is not synchronized with corrected editorial content`,
  );
  console.log(
    `seo-editorial-scope: 42 corrected records valid; maximum similarity ${maximum.score.toFixed(3)} (${maximum.left}/${maximum.right})`,
  );
} else {
  writeFileSync(migrationPath, renderMigration(maximum), "utf8");
  writeFileSync(rollbackPath, renderRollback(), "utf8");
  console.log(`seo-editorial-scope: generated ${migrationName} and safe exposure rollback`);
}
