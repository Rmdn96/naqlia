-- Conservative rollback for 20260822210000_seo_editorial_rollout_v1.sql
-- Refuses to run after any operator has edited a rollout record.
begin;

do $$
declare v_changed text;
begin
  select string_agg(c.city_code||'/'||s.locale,', ' order by c.city_code,s.locale)
    into v_changed
  from public.city_seo_contents s join public.cities c on c.id=s.city_id
  where c.city_code=any(array['JED','MKK','MED','DMM','KHO','DHA','AHS','JUB','TAI','TUU','AHB','KMX','ELQ','HAS','YNB','GIZ','EAM','AKJ','ARA','AJF','ABT']::text[])
    and (s.version<>2 or s.updated_by_profile_id is not null or s.created_by_profile_id is not null);
  if v_changed is not null then
    raise exception 'Rollback refused because editorial content may have operator changes: %',v_changed;
  end if;
end $$;

delete from public.city_seo_faqs f
using public.city_seo_contents s,public.cities c
where f.city_seo_content_id=s.id and s.city_id=c.id
  and c.city_code=any(array['JED','MKK','MED','DMM','KHO','DHA','AHS','JUB','TAI','TUU','AHB','KMX','ELQ','HAS','YNB','GIZ','EAM','AKJ','ARA','AJF','ABT']::text[]);

update public.city_seo_contents s set
  seo_title=null,meta_description=null,page_heading=null,introduction=null,
  service_area_content=null,neighborhood_coverage_text=null,
  content_status='draft',is_indexable=false,published_at=null,
  updated_at=now(),version=version+1
from public.cities c
where s.city_id=c.id and c.city_code=any(array['JED','MKK','MED','DMM','KHO','DHA','AHS','JUB','TAI','TUU','AHB','KMX','ELQ','HAS','YNB','GIZ','EAM','AKJ','ARA','AJF','ABT']::text[]);

commit;
