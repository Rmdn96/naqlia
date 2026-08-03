begin;

create or replace function private.protect_catalog_keys()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'cities'
    and (
      to_jsonb(new) ->> 'city_code' <> to_jsonb(old) ->> 'city_code'
      or to_jsonb(new) ->> 'slug' <> to_jsonb(old) ->> 'slug'
    )
  then
    raise exception using errcode = '23514', message = 'City keys are immutable';
  end if;

  if tg_table_name = 'services'
    and to_jsonb(new) ->> 'service_key' <> to_jsonb(old) ->> 'service_key'
  then
    raise exception using errcode = '23514', message = 'Service keys are immutable';
  end if;

  if tg_table_name = 'service_options'
    and (
      to_jsonb(new) ->> 'option_key' <> to_jsonb(old) ->> 'option_key'
      or to_jsonb(new) ->> 'service_id'
        is distinct from to_jsonb(old) ->> 'service_id'
    )
  then
    raise exception using errcode = '23514', message = 'Service option keys and scope are immutable';
  end if;

  return new;
end;
$$;

insert into public.cities (
  city_code,
  slug,
  name_ar,
  name_en,
  region_ar,
  region_en,
  display_order
)
values
  ('RUH', 'riyadh', 'الرياض', 'Riyadh', 'منطقة الرياض', 'Riyadh Region', 10),
  ('JED', 'jeddah', 'جدة', 'Jeddah', 'منطقة مكة المكرمة', 'Makkah Region', 20),
  ('MKK', 'makkah', 'مكة المكرمة', 'Makkah', 'منطقة مكة المكرمة', 'Makkah Region', 30),
  ('MED', 'madinah', 'المدينة المنورة', 'Madinah', 'منطقة المدينة المنورة', 'Madinah Region', 40),
  ('DMM', 'dammam', 'الدمام', 'Dammam', 'المنطقة الشرقية', 'Eastern Province', 50),
  ('KHO', 'al-khobar', 'الخبر', 'Al Khobar', 'المنطقة الشرقية', 'Eastern Province', 60),
  ('DHA', 'dhahran', 'الظهران', 'Dhahran', 'المنطقة الشرقية', 'Eastern Province', 70),
  ('AHS', 'al-ahsa', 'الأحساء', 'Al Ahsa', 'المنطقة الشرقية', 'Eastern Province', 80),
  ('JUB', 'jubail', 'الجبيل', 'Jubail', 'المنطقة الشرقية', 'Eastern Province', 90),
  ('TAI', 'taif', 'الطائف', 'Taif', 'منطقة مكة المكرمة', 'Makkah Region', 100),
  ('TUU', 'tabuk', 'تبوك', 'Tabuk', 'منطقة تبوك', 'Tabuk Region', 110),
  ('AHB', 'abha', 'أبها', 'Abha', 'منطقة عسير', 'Asir Region', 120),
  ('KMX', 'khamis-mushait', 'خميس مشيط', 'Khamis Mushait', 'منطقة عسير', 'Asir Region', 130),
  ('ELQ', 'buraidah', 'بريدة', 'Buraidah', 'منطقة القصيم', 'Al Qassim Region', 140),
  ('HAS', 'hail', 'حائل', 'Hail', 'منطقة حائل', 'Hail Region', 150),
  ('YNB', 'yanbu', 'ينبع', 'Yanbu', 'منطقة المدينة المنورة', 'Madinah Region', 160),
  ('GIZ', 'jazan', 'جازان', 'Jazan', 'منطقة جازان', 'Jazan Region', 170),
  ('EAM', 'najran', 'نجران', 'Najran', 'منطقة نجران', 'Najran Region', 180),
  ('AKJ', 'al-kharj', 'الخرج', 'Al Kharj', 'منطقة الرياض', 'Riyadh Region', 190),
  ('ARA', 'arar', 'عرعر', 'Arar', 'منطقة الحدود الشمالية', 'Northern Borders Region', 200),
  ('AJF', 'sakaka', 'سكاكا', 'Sakaka', 'منطقة الجوف', 'Al Jawf Region', 210),
  ('ABT', 'al-bahah', 'الباحة', 'Al Bahah', 'منطقة الباحة', 'Al Bahah Region', 220)
on conflict (city_code) do update
set
  slug = excluded.slug,
  name_ar = excluded.name_ar,
  name_en = excluded.name_en,
  region_ar = excluded.region_ar,
  region_en = excluded.region_en,
  country_code = 'SA',
  status = 'active',
  display_order = excluded.display_order,
  deleted_at = null,
  deleted_by_profile_id = null,
  deletion_reason = null;

insert into public.services (
  service_key,
  name_ar,
  name_en,
  description_ar,
  description_en,
  transport_scope,
  display_order
)
values
  (
    'furniture_moving',
    'نقل الأثاث',
    'Furniture Moving',
    'خدمة نقل الأثاث للمنازل والمنشآت داخل المدن وبين مدن المملكة.',
    'Furniture transport for homes and businesses within cities and across Saudi Arabia.',
    'both',
    10
  ),
  (
    'general_cargo_transport',
    'نقل البضائع العامة',
    'General Cargo Transport',
    'خدمة نقل البضائع العامة المؤهلة داخل المدن وبين مدن المملكة.',
    'Transport for eligible general cargo within cities and across Saudi Arabia.',
    'both',
    20
  ),
  (
    'local_transport',
    'النقل المحلي',
    'Local Transport',
    'خدمة نقل محلية لنقاط الاستلام والتسليم المؤهلة داخل مدينة الرياض.',
    'Local transport for eligible pickup and delivery points within Riyadh.',
    'local',
    30
  ),
  (
    'intercity_transport',
    'النقل بين المدن',
    'Intercity Transport',
    'خدمة نقل من الرياض إلى المدن السعودية المؤهلة ضمن نطاق الإطلاق.',
    'Transport from Riyadh to eligible Saudi cities within the launch scope.',
    'intercity',
    40
  )
on conflict (service_key) do update
set
  name_ar = excluded.name_ar,
  name_en = excluded.name_en,
  description_ar = excluded.description_ar,
  description_en = excluded.description_en,
  transport_scope = excluded.transport_scope,
  status = 'active',
  display_order = excluded.display_order,
  deleted_at = null,
  deleted_by_profile_id = null,
  deletion_reason = null;

insert into public.service_options (
  service_id,
  option_key,
  name_ar,
  name_en,
  description_ar,
  description_en,
  display_order
)
values
  (
    null,
    'packing',
    'التغليف',
    'Packing',
    'خدمة اختيارية لتغليف العناصر المؤهلة قبل النقل.',
    'Optional packing for eligible items before transport.',
    10
  ),
  (
    null,
    'loading_unloading',
    'التحميل والتنزيل',
    'Loading and Unloading',
    'خدمة اختيارية لتحميل العناصر المؤهلة وتنزيلها.',
    'Optional loading and unloading for eligible transported items.',
    20
  )
on conflict (option_key) where service_id is null do update
set
  name_ar = excluded.name_ar,
  name_en = excluded.name_en,
  description_ar = excluded.description_ar,
  description_en = excluded.description_en,
  status = 'active',
  display_order = excluded.display_order,
  deleted_at = null,
  deleted_by_profile_id = null,
  deletion_reason = null;

commit;
