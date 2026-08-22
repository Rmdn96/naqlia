begin;

create or replace function public.admin_update_service_area(p_city uuid,p_status text,p_display_order integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_actor uuid;
begin
  v_actor:=private.require_portal_permission('settings.business.manage');
  if p_status not in ('active','inactive') or p_display_order not between 0 and 10000 then raise exception using errcode='22023',message='Invalid service area'; end if;
  update public.cities set status=p_status,display_order=p_display_order,updated_by_profile_id=v_actor where id=p_city and deleted_at is null;
  if not found then raise exception using errcode='P0002',message='Service area not found'; end if;
  perform private.write_platform_activity('settings','service_area_changed','city',p_city,v_actor,jsonb_build_object('status',p_status,'display_order',p_display_order));
  return jsonb_build_object('state','updated');
end $$;

drop function if exists public.admin_set_city_seo_state(uuid,text,boolean);
drop function if exists public.admin_upsert_city_seo_content(uuid,text,text,text,text,text,text,text,jsonb,jsonb,integer);
drop function if exists public.admin_list_city_seo_contents();
drop function if exists public.get_city_seo_readiness(uuid);
drop function if exists public.get_indexable_city_seo_index(text);
drop function if exists public.get_public_city_seo_content(text,text);
drop function if exists private.city_seo_readiness_issues(uuid);
drop table if exists public.city_seo_routes;
drop table if exists public.city_seo_faqs;
drop table if exists public.city_seo_contents;

delete from public.role_permissions rp using public.permissions p
where rp.permission_id=p.id and p.permission_key in ('settings.seo.read','settings.seo.manage');
delete from public.permissions where permission_key in ('settings.seo.read','settings.seo.manage');

commit;
