begin;

create index idx_city_seo_contents__created_by
  on public.city_seo_contents(created_by_profile_id)
  where created_by_profile_id is not null;

comment on index public.idx_city_seo_contents__created_by is
  'Covers SEO content creator audit attribution and profile foreign-key maintenance.';

commit;
