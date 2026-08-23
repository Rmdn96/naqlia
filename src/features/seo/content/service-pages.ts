import type { AppLocale } from "@/i18n/routing";
import type { ServicePageSlug, ServiceSeoPage } from "@/features/seo/types/seo";

export const SERVICE_PAGE_SLUGS = [
  "furniture-moving",
  "goods-transport",
  "within-city-transport",
  "intercity-transport",
] as const satisfies readonly ServicePageSlug[];

const pages: Record<AppLocale, Record<ServicePageSlug, Omit<ServiceSeoPage, "locale" | "slug">>> = {
  ar: {
    "furniture-moving": {
      key: "furniture_moving",
      title: "خدمة نقل الأثاث المنظمة | نقلك",
      metaDescription:
        "أرسل طلب نقل أثاث للمنازل أو المنشآت عبر نقلك، مع خيارات تغليف وتحميل عند الحاجة ومراجعة التفاصيل قبل إرسال عرض السعر.",
      heading: "نقل الأثاث بخطوات واضحة ومنظمة",
      introduction:
        "تبدأ خدمة نقل الأثاث بوصف القطع وعناوين الاستلام والتسليم وأي متطلبات وصول مهمة. يراجع فريق نقلك الطلب قبل إعداد عرض السعر، ويمكن إضافة التغليف أو التحميل والتنزيل عندما تكون مناسبة للطلب.",
      description:
        "الخدمة مناسبة للأثاث المنزلي أو أثاث المنشآت المؤهل للنقل. لا يُفترض حجم المركبة أو عدد العاملين مسبقاً؛ تُحدد الموارد بعد مراجعة الكمية وطبيعة القطع والموقع والموعد المطلوب.",
      process: [
        "حدد خدمة نقل الأثاث وأضف خيارات التغليف أو التحميل عند الحاجة.",
        "أدخل العناوين ووصف القطع وأرفق صوراً اختيارية تساعد على المراجعة.",
        "يراجع ممثل المبيعات الطلب ويرسل عرض سعر واضحاً قبل التنفيذ.",
      ],
      benefits: [
        "تفاصيل طلب منظمة تقلل الغموض قبل التسعير.",
        "خيارات تغليف وتحميل وتنزيل مرتبطة بالحاجة الفعلية.",
        "متابعة آمنة من الطلب إلى التسليم عند اعتماد العرض.",
      ],
      faqs: [
        {
          question: "هل التغليف جزء إلزامي من نقل الأثاث؟",
          answer:
            "لا. التغليف خدمة اختيارية يمكن إضافتها إلى الطلب، ويؤكد الفريق ملاءمتها وتفاصيلها ضمن عرض السعر.",
        },
        {
          question: "ما المعلومات التي تساعد في مراجعة الطلب؟",
          answer:
            "وصف القطع والكمية التقريبية والعناوين وملاحظات الوصول والصور الاختيارية تساعد الفريق على فهم نطاق النقل.",
        },
      ],
    },
    "goods-transport": {
      key: "general_cargo_transport",
      title: "خدمة نقل البضائع العامة | نقلك",
      metaDescription:
        "اطلب نقل بضائع عامة مؤهلة عبر نقلك داخل نطاق التشغيل الحالي، مع توثيق الحمولة والعناوين ومراجعة الطلب قبل عرض السعر.",
      heading: "نقل البضائع العامة بناءً على تفاصيل حمولة واضحة",
      introduction:
        "تتيح نقلك إرسال طلب لنقل البضائع العامة المؤهلة مع وصف طبيعة الحمولة والكمية وعناوين الاستلام والتسليم. تُراجع التفاصيل أولاً للتأكد من ملاءمة الخدمة والموارد قبل إصدار العرض.",
      description:
        "لا تشمل الخدمة تلقائياً المواد المحظورة أو الخطرة أو الشحنات التي تتطلب تراخيص خاصة غير معتمدة. يحدد فريق المراجعة قابلية تنفيذ الطلب وفق البيانات المقدمة ونطاق التشغيل.",
      process: [
        "اختر نقل البضائع العامة ووصف الحمولة بدقة.",
        "أضف نقاط الاستلام والتسليم والكمية والصور الاختيارية.",
        "انتظر مراجعة الأهلية والموارد ثم استلم عرض السعر.",
      ],
      benefits: [
        "مراجعة ملاءمة الحمولة قبل الالتزام بالتنفيذ.",
        "بنود عرض سعر مرتبطة بالطلب المقدم.",
        "تتبع واضح للحالة بعد تحويل العرض المعتمد إلى طلب.",
      ],
      faqs: [
        {
          question: "هل تقبل نقلك جميع أنواع البضائع؟",
          answer:
            "تتعامل نقلك مع البضائع العامة المؤهلة فقط. يجب وصف الحمولة، ويؤكد الفريق قبولها بعد المراجعة.",
        },
        {
          question: "هل يمكن إرفاق صور للبضائع؟",
          answer:
            "نعم، الصور اختيارية وتساعد فريق المبيعات على فهم الحجم وطريقة المناولة قبل إعداد العرض.",
        },
      ],
    },
    "within-city-transport": {
      key: "local_transport",
      title: "خدمة النقل داخل الرياض | نقلك",
      metaDescription:
        "أرسل طلب نقل محلي بين عنواني استلام وتسليم مؤهلين داخل الرياض، مع حفظ الإحداثيات ومراجعة التفاصيل قبل التأكيد.",
      heading: "نقل محلي بين نقاط مؤهلة داخل الرياض",
      introduction:
        "خدمة النقل داخل المدينة في نطاق الإطلاق الحالي مخصصة للطلبات التي تقع نقطتا الاستلام والتسليم فيها داخل الرياض. يسمح النموذج بإضافة العناوين والإحداثيات لتجهيز الطلب للمراجعة والمسارات المستقبلية.",
      description:
        "تؤكد نقلك قابلية الوصول والموعد والموارد بعد مراجعة الطلب. ظهور المدن الأخرى في صفحات الوجهات يعني إمكانية طلب رحلة مؤهلة تبدأ من الرياض إليها، ولا يعني توفر نقل محلي يقع طرفاه داخل تلك المدن.",
      process: [
        "اختر النقل المحلي وحدد الرياض لموقعي الاستلام والتسليم.",
        "أدخل عنواني الاستلام والتسليم وأضف الإحداثيات إن توفرت.",
        "أرسل تفاصيل الحمولة ليؤكد الفريق النطاق والعرض.",
      ],
      benefits: [
        "بيانات عناوين جاهزة للخرائط والتوجيه المستقبلي.",
        "مراجعة متطلبات الوصول لكل موقع.",
        "رحلة واضحة بين نقطتين محددتين في الطلب.",
      ],
      faqs: [
        {
          question: "هل النقل المحلي متاح خارج الرياض؟",
          answer:
            "نطاق الإطلاق المنشور للنقل المحلي يقتصر حالياً على الرحلات التي يقع طرفاها داخل الرياض. المدن الأخرى المنشورة هي وجهات لطلبات مؤهلة تبدأ من الرياض.",
        },
        {
          question: "هل الإحداثيات مطلوبة؟",
          answer:
            "الإحداثيات مفيدة وجاهزة للتوافق مع الخرائط، بينما يبقى العنوان المكتوب الواضح جزءاً أساسياً من الطلب.",
        },
      ],
    },
    "intercity-transport": {
      key: "intercity_transport",
      title: "خدمة النقل بين المدن من الرياض | نقلك",
      metaDescription:
        "اطلب نقل أثاث أو بضائع مؤهلة من الرياض إلى مدينة سعودية متاحة ضمن نطاق نقلك الحالي، بعد مراجعة المسار والحمولة.",
      heading: "طلبات نقل بين المدن تبدأ من الرياض",
      introduction:
        "يدعم نطاق الإطلاق طلبات مؤهلة تبدأ من الرياض وتتجه إلى المدن المفعلة. أدخل عنواني الاستلام والتسليم ووصف الحمولة، ثم يراجع الفريق المسار والموعد والموارد قبل إرسال العرض.",
      description:
        "لا تعني قائمة المدن المفعلة تغطية جميع المسارات في كل وقت. يعتمد القبول على نقطة الانطلاق والوجهة والحمولة وتوفر الموارد، ويظل عرض السعر هو المرجع التجاري قبل التنفيذ.",
      process: [
        "اختر النقل بين المدن وحدد الرياض كنقطة انطلاق والوجهة المتاحة.",
        "أدخل تفاصيل العناوين والحمولة والموعد المطلوب.",
        "يراجع الفريق المسار ثم يرسل العرض القابل للمراجعة والاعتماد.",
      ],
      benefits: [
        "توضيح نقطة الانطلاق والوجهة قبل التسعير.",
        "مراجعة متطلبات الرحلة والحمولة معاً.",
        "متابعة تشغيلية آمنة بعد اعتماد العرض وإنشاء الطلب.",
      ],
      faqs: [
        {
          question: "هل النقل بين المدن متاح من أي مدينة؟",
          answer:
            "نطاق الإطلاق الحالي يركز على الطلبات التي تبدأ من الرياض إلى المدن المفعلة، ويؤكد الفريق كل طلب بعد المراجعة.",
        },
        {
          question: "متى يصبح الطلب مؤكداً؟",
          answer:
            "إرسال النموذج ينشئ طلب مراجعة فقط. يصبح المسار تجارياً معتمداً بعد إرسال العرض وقبول العميل له.",
        },
      ],
    },
  },
  en: {
    "furniture-moving": {
      key: "furniture_moving",
      title: "Organized Furniture Moving Service | Naqlk",
      metaDescription:
        "Request furniture moving for a home or business with optional packing and handling, followed by review and a clear quotation from Naqlk.",
      heading: "Furniture moving through a clear, organized process",
      introduction:
        "A furniture move starts with the items, pickup and delivery addresses, and relevant access requirements. Naqlk reviews the request before preparing a quotation, with optional packing or loading and unloading when appropriate.",
      description:
        "The service supports eligible household and business furniture. Vehicle size and worker count are not assumed in advance; resources are reviewed against the items, locations, and requested schedule.",
      process: [
        "Choose furniture moving and any relevant packing or handling options.",
        "Provide both addresses, describe the items, and optionally attach useful photos.",
        "A Sales representative reviews the request and sends a quotation before execution.",
      ],
      benefits: [
        "Structured request details reduce uncertainty before pricing.",
        "Packing and handling options remain tied to the actual need.",
        "Secure follow-up continues after an accepted quotation becomes an order.",
      ],
      faqs: [
        {
          question: "Is packing mandatory for a furniture move?",
          answer:
            "No. Packing is optional and can be requested when needed. The team confirms its scope in the quotation.",
        },
        {
          question: "What information helps Naqlk review the move?",
          answer:
            "Item descriptions, approximate quantity, addresses, access notes, and optional photos help define the request.",
        },
      ],
    },
    "goods-transport": {
      key: "general_cargo_transport",
      title: "General Goods Transport Service | Naqlk",
      metaDescription:
        "Request eligible general goods transport within Naqlk's current operating scope, with cargo and address review before a quotation is issued.",
      heading: "General goods transport based on clear cargo details",
      introduction:
        "Naqlk accepts requests for eligible general goods with a description of the load, approximate quantity, and pickup and delivery addresses. The request is reviewed for service and resource suitability before a quotation is issued.",
      description:
        "The service does not automatically include prohibited, hazardous, or specially regulated goods. Eligibility depends on the submitted information and the approved operating scope.",
      process: [
        "Choose general goods transport and describe the cargo accurately.",
        "Add pickup, delivery, quantity, and optional reference photos.",
        "Receive an eligibility and resource review before the quotation.",
      ],
      benefits: [
        "Cargo suitability is reviewed before execution is promised.",
        "Quotation items relate to the submitted request.",
        "Approved work has clear status tracking through delivery.",
      ],
      faqs: [
        {
          question: "Does Naqlk accept every type of goods?",
          answer:
            "No. Naqlk handles eligible general goods only. Describe the load so the team can confirm suitability.",
        },
        {
          question: "Can I attach cargo photos?",
          answer:
            "Yes. Photos are optional and can help the Sales team understand size and handling needs before quoting.",
        },
      ],
    },
    "within-city-transport": {
      key: "local_transport",
      title: "Within-Riyadh Transport Service | Naqlk",
      metaDescription:
        "Submit a local transport request between eligible Riyadh addresses, with map-ready coordinates and request review before confirmation.",
      heading: "Local transport between eligible points in Riyadh",
      introduction:
        "Within-city transport in the current launch scope supports requests whose pickup and delivery points are both in Riyadh. The form captures written addresses and coordinates for review and future routing support.",
      description:
        "Naqlk confirms access, scheduling, and resources after reviewing the request. Other published city pages represent eligible destinations for journeys originating in Riyadh, not local transport with both endpoints in those cities.",
      process: [
        "Choose local transport and select Riyadh for both pickup and delivery.",
        "Enter pickup and delivery details, adding coordinates when available.",
        "Submit the cargo details for scope and quotation review.",
      ],
      benefits: [
        "Addresses are prepared for maps and future routing.",
        "Access requirements are reviewed per location.",
        "The requested journey stays clear between two defined points.",
      ],
      faqs: [
        {
          question: "Is local transport available outside Riyadh?",
          answer:
            "The published local launch scope currently applies only when both endpoints are in Riyadh. Other published cities are destinations for eligible requests originating in Riyadh.",
        },
        {
          question: "Are coordinates required?",
          answer:
            "Coordinates are useful for map compatibility, while a clear written address remains an essential part of the request.",
        },
      ],
    },
    "intercity-transport": {
      key: "intercity_transport",
      title: "Intercity Transport from Riyadh | Naqlk",
      metaDescription:
        "Request transport for eligible furniture or goods from Riyadh to an available Saudi city after Naqlk reviews the route and cargo.",
      heading: "Intercity transport requests originating in Riyadh",
      introduction:
        "The launch scope supports eligible requests that originate in Riyadh and travel to enabled cities. Provide both addresses and the cargo details so the team can review the route, schedule, and resources before quoting.",
      description:
        "The enabled-city list does not promise every route at every time. Acceptance depends on origin, destination, cargo, and available resources, with the quotation remaining the commercial reference.",
      process: [
        "Choose intercity transport, Riyadh as origin, and an enabled destination.",
        "Provide addresses, cargo details, and the requested schedule.",
        "The team reviews the journey and sends a quotation for customer approval.",
      ],
      benefits: [
        "Origin and destination are defined before pricing.",
        "Route and cargo requirements are reviewed together.",
        "Secure operational tracking follows order creation after acceptance.",
      ],
      faqs: [
        {
          question: "Is intercity transport available from every city?",
          answer:
            "The current launch scope focuses on requests originating in Riyadh and ending in enabled cities, subject to review.",
        },
        {
          question: "When is an intercity request confirmed?",
          answer:
            "Submitting the form creates a review request. Commercial confirmation follows a sent quotation and customer acceptance.",
        },
      ],
    },
  },
};

export function getServiceSeoPage(locale: AppLocale, slug: string): ServiceSeoPage | null {
  if (!SERVICE_PAGE_SLUGS.includes(slug as ServicePageSlug)) return null;
  const typedSlug = slug as ServicePageSlug;
  return { ...pages[locale][typedSlug], locale, slug: typedSlug };
}

export function getServicePageSlugForKey(key: string): ServicePageSlug | null {
  return SERVICE_PAGE_SLUGS.find((slug) => pages.en[slug].key === key) ?? null;
}
