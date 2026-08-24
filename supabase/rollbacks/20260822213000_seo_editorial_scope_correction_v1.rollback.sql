-- Safe exposure rollback for 20260822213000_seo_editorial_scope_correction_v1.sql.
-- Retains corrected copy, but moves rollout records to Draft/noindex.
begin;
do $$
begin
  if exists(select 1 from public.city_seo_contents s join public.cities c on c.id=s.city_id
    where c.city_code in ('JED','MKK','MED','DMM','KHO','DHA','AHS','JUB','TAI','TUU','AHB','KMX','ELQ','HAS','YNB','GIZ','EAM','AKJ','ARA','AJF','ABT')
      and (s.version<>3 or s.created_by_profile_id is not null or s.updated_by_profile_id is not null)) then
    raise exception 'Rollback refused because corrected editorial records may have operator changes';
  end if;
end $$;
update public.city_seo_contents s set content_status='draft',is_indexable=false,published_at=null,
  updated_at=now(),version=version+1
from public.cities c where s.city_id=c.id and c.city_code in ('JED','MKK','MED','DMM','KHO','DHA','AHS','JUB','TAI','TUU','AHB','KMX','ELQ','HAS','YNB','GIZ','EAM','AKJ','ARA','AJF','ABT');
commit;
