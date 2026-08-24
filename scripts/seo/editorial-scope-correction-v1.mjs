import { EDITORIAL_CITY_RECORDS } from "./editorial-rollout-v1.mjs";

const arabicTitles = {
  JED: "نقل الأثاث والبضائع من الرياض إلى جدة | نقلك",
  MKK: "تنظيم طلب نقل من الرياض إلى مكة المكرمة | نقلك",
  MED: "خدمة نقل من الرياض إلى المدينة المنورة | نقلك",
  DMM: "طلبات النقل من الرياض إلى الدمام بخطوات واضحة | نقلك",
  KHO: "ترتيب نقل الأثاث والبضائع من الرياض إلى الخبر | نقلك",
  DHA: "نقل الأثاث والبضائع من الرياض إلى الظهران | نقلك",
  AHS: "خدمة نقل مدروسة من الرياض إلى الأحساء | نقلك",
  JUB: "نقل الأثاث والبضائع العامة من الرياض إلى الجبيل | نقلك",
  TAI: "تنظيم رحلة نقل من الرياض إلى الطائف | نقلك",
  TUU: "طلب نقل أثاث وبضائع من الرياض إلى تبوك | نقلك",
  AHB: "خدمة نقل تراعي الوصول من الرياض إلى أبها | نقلك",
  KMX: "نقل الأثاث والبضائع من الرياض إلى خميس مشيط | نقلك",
  ELQ: "ترتيب طلب نقل من الرياض إلى بريدة | نقلك",
  HAS: "خدمة نقل قابلة للتخطيط من الرياض إلى حائل | نقلك",
  YNB: "نقل الأثاث والبضائع العامة من الرياض إلى ينبع | نقلك",
  GIZ: "تنظيم طلب النقل من الرياض إلى جازان | نقلك",
  EAM: "طلب نقل واضح من الرياض إلى نجران | نقلك",
  AKJ: "خدمات النقل المؤهلة من الرياض إلى الخرج | نقلك",
  ARA: "طلب نقل الأثاث والبضائع من الرياض إلى عرعر | نقلك",
  AJF: "خدمة نقل منظمة من الرياض إلى سكاكا | نقلك",
  ABT: "خدمة نقل تراعي الوصول من الرياض إلى الباحة | نقلك",
};

const englishTitles = {
  JED: "Furniture and Goods Transport from Riyadh to Jeddah | Naqlk",
  MKK: "Plan a Transport Request from Riyadh to Makkah | Naqlk",
  MED: "Transport Service from Riyadh to Madinah | Naqlk",
  DMM: "Structured Transport from Riyadh to Dammam | Naqlk",
  KHO: "Arrange Transport from Riyadh to Al Khobar | Naqlk",
  DHA: "Furniture and Goods Transport from Riyadh to Dhahran | Naqlk",
  AHS: "Reviewed Transport from Riyadh to Al Ahsa | Naqlk",
  JUB: "General Goods and Furniture from Riyadh to Jubail | Naqlk",
  TAI: "Plan a Transport Journey from Riyadh to Taif | Naqlk",
  TUU: "Furniture and Goods Transport from Riyadh to Tabuk | Naqlk",
  AHB: "Access-Aware Transport from Riyadh to Abha | Naqlk",
  KMX: "Transport from Riyadh to Khamis Mushait | Naqlk",
  ELQ: "Arrange a Transport Request from Riyadh to Buraidah | Naqlk",
  HAS: "Planned Transport from Riyadh to Hail | Naqlk",
  YNB: "General Goods and Furniture from Riyadh to Yanbu | Naqlk",
  GIZ: "Organize Transport from Riyadh to Jazan | Naqlk",
  EAM: "Clear Transport Requests from Riyadh to Najran | Naqlk",
  AKJ: "Eligible Transport from Riyadh to Al Kharj | Naqlk",
  ARA: "Furniture and Goods Transport from Riyadh to Arar | Naqlk",
  AJF: "Organized Transport from Riyadh to Sakaka | Naqlk",
  ABT: "Access-Aware Transport from Riyadh to Al Bahah | Naqlk",
};

const arabicMetaPatterns = [
  (city) =>
    `اطلب نقل أثاث أو بضائع مؤهلة من الرياض إلى ${city}، مع مراجعة الحمولة والعنوانين والوصول قبل إرسال عرض سعر واضح من نقلك.`,
  (city) =>
    `نظّم رحلة نقل مؤهلة من الرياض إلى ${city} عبر نقلك، وأضف تفاصيل المنقولات والخدمات الاختيارية ليُراجع الفريق الطلب قبل التسعير.`,
  (city) =>
    `قدّم بيانات طلب النقل من الرياض إلى ${city} للأثاث أو البضائع العامة، واستلم عرضاً مفصلاً بعد التحقق من المسار والموارد.`,
  (city) =>
    `رتّب طلباً متجهاً من الرياض إلى ${city} مع وصف الحمولة والعناوين وملاحظات الوصول، ثم راجع بنود عرض السعر قبل الاعتماد.`,
  (city) =>
    `أرسل طلب نقل من الرياض إلى ${city} عبر مسار واضح يجمع المواقع والمنقولات والموعد، ويخضع لمراجعة الفريق قبل التنفيذ.`,
];

const englishMetaPatterns = [
  (city) =>
    `Request eligible furniture or goods transport from Riyadh to ${city}, with cargo, addresses, and access reviewed before Naqlk issues a clear quotation.`,
  (city) =>
    `Organize an eligible Riyadh-to-${city} journey, adding item and optional-service details for team review before pricing.`,
  (city) =>
    `Submit furniture or general-goods transport details from Riyadh to ${city} and receive an itemized quotation after route and resource review.`,
  (city) =>
    `Arrange a Riyadh-to-${city} request with cargo, address, and access notes, then review the quotation items before acceptance.`,
  (city) =>
    `Send a transport request from Riyadh to ${city} through a clear flow covering locations, items, and timing before execution review.`,
];

const arabicHeadings = [
  (city) => `نقل الأثاث والبضائع من الرياض إلى ${city}`,
  (city) => `تنظيم رحلة النقل من الرياض إلى ${city}`,
  (city) => `طلب خدمة نقل مؤهلة من الرياض إلى ${city}`,
  (city) => `خدمات النقل المتجهة من الرياض إلى ${city}`,
  (city) => `خطوات واضحة للنقل من الرياض إلى ${city}`,
];

const englishHeadings = [
  (city) => `Furniture and goods transport from Riyadh to ${city}`,
  (city) => `Plan a transport journey from Riyadh to ${city}`,
  (city) => `Request eligible transport from Riyadh to ${city}`,
  (city) => `Transport services from Riyadh to ${city}`,
  (city) => `A clear transport flow from Riyadh to ${city}`,
];

const introductionCorrections = {
  TUU: {
    ar: "تظهر تبوك في نطاق الإطلاق كوجهة للطلبات المؤهلة التي تبدأ من الرياض. يجمع نموذج نقلك نوع الخدمة والحمولة وعنوان الاستلام في الرياض وعنوان التسليم في تبوك والتاريخ المرغوب، حتى يقيّم الفريق المسافة والوصول والموارد دون افتراض جدول ثابت.",
    en: "Tabuk appears in the launch scope as a destination for eligible requests originating in Riyadh. The Naqlk form captures service type, cargo, the Riyadh pickup, the Tabuk delivery point, and preferred date so the team can assess distance, access, and resources without assuming a fixed schedule.",
  },
  AKJ: {
    ar: "تظهر الخرج كوجهة مفعلة للطلبات المؤهلة المنطلقة من الرياض. يحدد العميل عنوان الاستلام في الرياض وعنوان التسليم في الخرج وطبيعة المنقولات والتوقيت، ثم يراجع الفريق المسافة والوصول والخدمات المطلوبة قبل عرض السعر.",
    en: "Al Kharj is an enabled destination for eligible requests originating in Riyadh. Customers specify the Riyadh pickup, Al Kharj delivery address, cargo, and timing before the team reviews distance, access, and requested services for quotation.",
  },
  ABT: {
    ar: "تُعرض الباحة كوجهة نهائية للرحلات المؤهلة المنطلقة من الرياض، وليس كنطاق نقل محلي مستقل. يوضح العميل نقطة التسليم والإحداثيات ووصف الطريق والمدخل، بينما يراجع الفريق ملاءمة الوصول للمركبة وطبيعة القطع والموعد قبل إعداد العرض، من دون افتراض أن الطرق والمواقع متشابهة.",
    en: "Al Bahah is presented as the destination of eligible journeys originating in Riyadh, not as a separate local-transport zone. Customers provide the delivery coordinates and describe the road and entrance, while the team reviews vehicle access, item characteristics, and timing before quoting instead of treating all sites as alike.",
  },
  YNB: {
    ar: "تظهر ينبع كوجهة للطلبات المؤهلة التي يبدأ استلامها من الرياض. يحدد العميل موقع التسليم بدقة ويصف الأثاث أو البضائع العامة والكميات وأي ملاحظة دخول، ثم يراجع الفريق المسافة والحمولة والموعد. يظل الطلب ضمن خدمة النقل البري العامة المعلنة ولا يمتد إلى خدمات أخرى غير معتمدة.",
    en: "Yanbu is an enabled destination for eligible requests collected in Riyadh. Customers identify the delivery point precisely and describe the furniture or general goods, quantities, and entry notes before distance, cargo, and timing are reviewed. The request remains within the published general road-transport service.",
  },
};

function optionalFaq(locale, city, index) {
  const key = index % 3;
  if (locale === "ar") {
    if (key === 0)
      return {
        question: `هل يمكن إضافة التغليف لطلب متجه إلى ${city}؟`,
        answer: `يمكن اختيار التغليف عند تقديم الطلب المتجه إلى ${city}. يراجع الفريق عدد القطع وطبيعتها، ولا يُدرج الدعم إلا كبند واضح في عرض السعر المعتمد.`,
      };
    if (key === 1)
      return {
        question: `كيف أحصل على عرض سعر لرحلة إلى ${city}؟`,
        answer: `أدخل عنوان الاستلام في الرياض وعنوان التسليم في ${city} ووصف المنقولات والموعد. يراجع ممثل المبيعات البيانات قبل إرسال عرض مفصل.`,
      };
    return {
      question: `هل أحتاج إلى حساب لطلب النقل إلى ${city}؟`,
      answer: `لا يلزم إنشاء حساب. يمكن إرسال الطلب المتجه إلى ${city} كزائر، ثم استخدام مرجع NQ ورقم الجوال في مسار التتبع المخصص.`,
    };
  }
  if (key === 0)
    return {
      question: `Can packing be added to a request going to ${city}?`,
      answer: `Packing can be selected for the ${city} request. The team reviews the items and includes support only as a clear line in the approved quotation.`,
    };
  if (key === 1)
    return {
      question: `How do I receive a quotation for transport to ${city}?`,
      answer: `Provide the Riyadh pickup, ${city} delivery address, item description, and preferred date. Sales reviews the details before issuing an itemized quotation.`,
    };
  return {
    question: `Do I need an account to request transport to ${city}?`,
    answer: `No account is required. You can submit the ${city} request as a guest and use the NQ reference with the submitted mobile number in the dedicated tracking flow.`,
  };
}

export const EDITORIAL_SCOPE_CORRECTIONS = EDITORIAL_CITY_RECORDS.map((record, index) => {
  const isArabic = record.locale === "ar";
  const city = record.cityName;
  const cityIndex = Math.floor(index / 2);
  const originalIntroduction =
    introductionCorrections[record.cityCode]?.[record.locale] ?? record.introduction;
  const scopeLead = isArabic
    ? `في النطاق التجاري المعتمد للإطلاق، تظهر ${city} كوجهة مفعلة للطلبات المؤهلة التي يبدأ استلامها من الرياض.`
    : `In the approved launch scope, ${city} is an enabled destination for eligible requests with pickup in Riyadh.`;
  const serviceAreaContent = isArabic
    ? `يدعم المسار نقل الأثاث والبضائع العامة المؤهلة من الرياض إلى ${city}. يمكن طلب التغليف أو التحميل والتنزيل، لكن تأكيدها يعتمد على مراجعة الحمولة والعنوانين والتوفر. النقل المحلي الذي يقع طرفاه داخل ${city} ليس ضمن نطاق الإطلاق المعلن حالياً، ولا تقدم الصفحة وعداً بخلاف ذلك.`
    : `The flow supports eligible furniture and general-goods transport from Riyadh to ${city}. Packing and loading or unloading may be requested, subject to cargo, address, and availability review. A local journey with both endpoints inside ${city} is not in the currently published launch scope, and this page does not claim otherwise.`;
  const localQuestion = isArabic
    ? {
        question: `هل يتضمن نطاق الإطلاق النقل المحلي داخل ${city}؟`,
        answer: `لا. النقل المحلي المعلن حالياً مخصص للطلبات التي يقع طرفاها في الرياض. تظهر ${city} كوجهة مفعلة للطلبات المؤهلة المنطلقة من الرياض.`,
      }
    : {
        question: `Does the launch scope include local transport within ${city}?`,
        answer: `No. The published local service currently applies when both endpoints are in Riyadh. ${city} is enabled as a destination for eligible requests originating in Riyadh.`,
      };
  const destinationQuestion = isArabic
    ? {
        question: `هل يمكن طلب نقل من الرياض إلى ${city}؟`,
        answer: `نعم، يمكن إرسال طلب مؤهل يبدأ من الرياض ويتجه إلى ${city}. يعتمد التأكيد على نوع المنقولات والعنوانين والموعد وتوفر الموارد بعد المراجعة.`,
      }
    : {
        question: `Can I request transport from Riyadh to ${city}?`,
        answer: `Yes. You can submit an eligible request originating in Riyadh and going to ${city}. Confirmation depends on the cargo, addresses, date, and resources after review.`,
      };

  return {
    ...record,
    seoTitle: isArabic ? arabicTitles[record.cityCode] : englishTitles[record.cityCode],
    metaDescription: isArabic
      ? arabicMetaPatterns[cityIndex % arabicMetaPatterns.length](city)
      : englishMetaPatterns[cityIndex % englishMetaPatterns.length](city),
    pageHeading: isArabic
      ? arabicHeadings[cityIndex % arabicHeadings.length](city)
      : englishHeadings[cityIndex % englishHeadings.length](city),
    introduction: `${scopeLead} ${originalIntroduction}`,
    serviceAreaContent,
    faqs: [destinationQuestion, localQuestion, optionalFaq(record.locale, city, cityIndex)].map(
      (faq, faqIndex) => ({ ...faq, displayOrder: (faqIndex + 1) * 10 }),
    ),
  };
});
