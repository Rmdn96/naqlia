-- Authentication Correction + Public Website Visual Upgrade v1
-- Extends the existing identity boundary and exposes only a curated homepage projection.

create or replace function public.resolve_identity_context()
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_uid uuid:=auth.uid();
  v_profile public.profiles%rowtype;
  v_account uuid;
  v_role text;
  v_permissions jsonb;
  v_metadata jsonb;
  v_display_name text;
  v_locale text;
begin
  if auth.role()<>'authenticated' or v_uid is null then
    raise exception using errcode='42501',message='Authentication required';
  end if;

  select raw_user_meta_data into v_metadata from auth.users where id=v_uid;
  v_display_name:=nullif(btrim(v_metadata->>'display_name'),'');
  if v_display_name is not null and (char_length(v_display_name) not between 2 and 120 or v_display_name~'[[:cntrl:]]') then
    v_display_name:=null;
  end if;
  v_locale:=case when v_metadata->>'preferred_locale' in ('ar','en') then v_metadata->>'preferred_locale' else 'ar' end;

  select * into v_profile from public.profiles where auth_user_id=v_uid for update;
  if not found then
    insert into public.profiles(auth_user_id,profile_kind,status,preferred_locale,display_name)
    values(v_uid,'customer','active',v_locale,v_display_name)
    returning * into v_profile;
  elsif v_profile.profile_kind='customer' and v_profile.status='pending' then
    update public.profiles set status='active',status_reason=null,last_login_at=now(),
      display_name=coalesce(display_name,v_display_name)
    where id=v_profile.id returning * into v_profile;
  elsif v_profile.status='active' then
    update public.profiles set last_login_at=now(),
      display_name=case when profile_kind='customer' then coalesce(display_name,v_display_name) else display_name end
    where id=v_profile.id returning * into v_profile;
  end if;

  if v_profile.status<>'active' then return jsonb_build_object('state','inactive'); end if;
  insert into public.customer_accounts(profile_id,preferred_locale)
    values(v_profile.id,v_profile.preferred_locale) on conflict(profile_id) do update set updated_at=public.customer_accounts.updated_at
    returning id into v_account;
  if v_account is null then select id into v_account from public.customer_accounts where profile_id=v_profile.id; end if;
  select r.role_key into v_role from public.profile_roles pr join public.roles r on r.id=pr.role_id and r.status='active'
    where pr.profile_id=v_profile.id and pr.status='active' and v_profile.staff_access_status='active';
  select coalesce(jsonb_agg(pm.permission_key order by pm.permission_key),'[]'::jsonb) into v_permissions
    from public.profile_roles pr join public.role_permissions rp on rp.role_id=pr.role_id and rp.status='active'
    join public.permissions pm on pm.id=rp.permission_id and pm.status='active'
    where pr.profile_id=v_profile.id and pr.status='active' and v_profile.staff_access_status='active';
  update public.staff_invitations set status='accepted',accepted_at=now()
    where auth_user_id=v_uid and status='pending';
  return jsonb_build_object('state','active','profile_id',v_profile.id,'customer_account_id',v_account,
    'is_staff',v_role is not null,'role_key',v_role,'permissions',v_permissions,
    'preferred_locale',v_profile.preferred_locale,'display_name',v_profile.display_name);
end $$;

create or replace function public.get_public_homepage_content(p_locale text default 'ar')
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_locale text:=case when p_locale='en' then 'en' else 'ar' end; v_result jsonb;
begin
  select jsonb_build_object(
    'cities',coalesce((
      select jsonb_agg(jsonb_build_object(
        'name',case when v_locale='ar' then c.name_ar else c.name_en end,
        'region',case when v_locale='ar' then c.region_ar else c.region_en end
      ) order by c.display_order,case when v_locale='ar' then c.name_ar else c.name_en end)
      from public.cities c where c.status='active' and c.deleted_at is null
    ),'[]'::jsonb),
    'reviews',coalesce((
      select jsonb_agg(item.payload order by item.is_featured desc,item.updated_at desc)
      from (
        select jsonb_build_object(
          'rating',r.overall_rating,
          'comment',r.comment,
          'display_name',case when v_locale='ar' then 'عميل نقلك' else 'Naqlk customer' end,
          'city',case when v_locale='ar' then c.name_ar else c.name_en end
        ) payload,r.is_featured,r.updated_at
        from public.job_reviews r
        join public.operational_jobs j on j.id=r.job_id
        join public.orders o on o.id=j.order_id
        join public.quotations q on q.id=o.quotation_id
        join public.leads l on l.id=q.lead_id
        join public.addresses a on a.id=l.pickup_address_id
        join public.cities c on c.id=a.city_id
        where r.publication_status='published' and r.publication_consent and r.is_verified and r.comment is not null
        order by r.is_featured desc,r.updated_at desc limit 6
      ) item
    ),'[]'::jsonb)
  ) into v_result;
  return v_result;
end $$;

revoke all on function public.get_public_homepage_content(text) from public,anon,authenticated;
grant execute on function public.get_public_homepage_content(text) to anon,authenticated,service_role;

comment on function public.get_public_homepage_content(text) is
  'Curated anonymous homepage projection: active city labels and consented, verified, published Review content only; no identifiers or customer data.';
comment on function public.resolve_identity_context() is
  'Database-authoritative Customer/Staff routing; imports only sanitized customer display name and locale metadata and never trusts role metadata.';
