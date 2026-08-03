begin;

with corrected_cities (
  city_code,
  name_ar,
  region_ar
) as (
  values
    ('RUH', 'الرياض', 'منطقة الرياض'),
    ('JED', 'جدة', 'منطقة مكة المكرمة'),
    ('MKK', 'مكة المكرمة', 'منطقة مكة المكرمة'),
    ('MED', 'المدينة المنورة', 'منطقة المدينة المنورة'),
    ('DMM', 'الدمام', 'المنطقة الشرقية'),
    ('KHO', 'الخبر', 'المنطقة الشرقية'),
    ('DHA', 'الظهران', 'المنطقة الشرقية'),
    ('AHS', 'الأحساء', 'المنطقة الشرقية'),
    ('JUB', 'الجبيل', 'المنطقة الشرقية'),
    ('TAI', 'الطائف', 'منطقة مكة المكرمة'),
    ('TUU', 'تبوك', 'منطقة تبوك'),
    ('AHB', 'أبها', 'منطقة عسير'),
    ('KMX', 'خميس مشيط', 'منطقة عسير'),
    ('ELQ', 'بريدة', 'منطقة القصيم'),
    ('HAS', 'حائل', 'منطقة حائل'),
    ('YNB', 'ينبع', 'منطقة المدينة المنورة'),
    ('GIZ', 'جازان', 'منطقة جازان'),
    ('EAM', 'نجران', 'منطقة نجران'),
    ('AKJ', 'الخرج', 'منطقة الرياض'),
    ('ARA', 'عرعر', 'منطقة الحدود الشمالية'),
    ('AJF', 'سكاكا', 'منطقة الجوف'),
    ('ABT', 'الباحة', 'منطقة الباحة')
)
update public.cities
set
  name_ar = corrected_cities.name_ar,
  region_ar = corrected_cities.region_ar
from corrected_cities
where cities.city_code = corrected_cities.city_code
  and (
    cities.name_ar is distinct from corrected_cities.name_ar
    or cities.region_ar is distinct from corrected_cities.region_ar
  );

with corrected_services (
  service_key,
  name_ar,
  description_ar
) as (
  values
    (
      'furniture_moving',
      'نقل الأثاث',
      'خدمة نقل الأثاث للمنازل والمنشآت داخل المدن وبين مدن المملكة.'
    ),
    (
      'general_cargo_transport',
      'نقل البضائع العامة',
      'خدمة نقل البضائع العامة المؤهلة داخل المدن وبين مدن المملكة.'
    ),
    (
      'local_transport',
      'النقل المحلي',
      'خدمة نقل محلية لنقاط الاستلام والتسليم المؤهلة داخل مدينة الرياض.'
    ),
    (
      'intercity_transport',
      'النقل بين المدن',
      'خدمة نقل من الرياض إلى المدن السعودية المؤهلة ضمن نطاق الإطلاق.'
    )
)
update public.services
set
  name_ar = corrected_services.name_ar,
  description_ar = corrected_services.description_ar
from corrected_services
where services.service_key = corrected_services.service_key
  and (
    services.name_ar is distinct from corrected_services.name_ar
    or services.description_ar is distinct from corrected_services.description_ar
  );

with corrected_options (
  option_key,
  name_ar,
  description_ar
) as (
  values
    (
      'packing',
      'التغليف',
      'خدمة اختيارية لتغليف العناصر المؤهلة قبل النقل.'
    ),
    (
      'loading_unloading',
      'التحميل والتنزيل',
      'خدمة اختيارية لتحميل العناصر المؤهلة وتنزيلها.'
    )
)
update public.service_options
set
  name_ar = corrected_options.name_ar,
  description_ar = corrected_options.description_ar
from corrected_options
where service_options.option_key = corrected_options.option_key
  and service_options.service_id is null
  and (
    service_options.name_ar is distinct from corrected_options.name_ar
    or service_options.description_ar is distinct from corrected_options.description_ar
  );

do $$
begin
  if (
    select count(*)
    from public.cities
    where name_ar ~ '[§¨£¬]' or region_ar ~ '[§¨£¬]'
  ) > 0
    or (
      select count(*)
      from public.services
      where name_ar ~ '[§¨£¬]' or description_ar ~ '[§¨£¬]'
    ) > 0
    or (
      select count(*)
      from public.service_options
      where name_ar ~ '[§¨£¬]' or description_ar ~ '[§¨£¬]'
    ) > 0
  then
    raise exception using
      errcode = '22023',
      message = 'Arabic catalog encoding repair was incomplete';
  end if;
end;
$$;

comment on table public.services is
  'Configurable bilingual service catalog. Arabic reference values were encoding-normalized by migration 20260803170500.';

commit;
