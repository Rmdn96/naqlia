const faqSets = {
  ar: {
    local: (city) => ({
      question: `هل يمكن طلب نقل داخل ${city}؟`,
      answer: `نعم، يمكن إرسال طلب بين عنواني استلام وتسليم مؤهلين داخل ${city}. يراجع فريق نقلك تفاصيل الحمولة والعنوانين ومتطلبات الوصول قبل تأكيد إمكانية التنفيذ والموعد.`,
    }),
    intercity: (city) => ({
      question: `هل تتوفر خدمة النقل من ${city} إلى مدينة أخرى؟`,
      answer: `يمكن طلب رحلة بين المدن تبدأ من ${city} إلى وجهة مفعلة في نطاق التشغيل. يخضع التأكيد لمراجعة نوع المنقولات والعناوين والموعد وتوفر الموارد المناسبة.`,
    }),
    options: (city) => ({
      question: `هل يمكن إضافة التغليف أو التحميل والتنزيل لطلب ${city}؟`,
      answer: `يمكن اختيار التغليف أو التحميل والتنزيل كخدمات إضافية عند تعبئة الطلب في ${city}. يراجع الفريق الاحتياج الفعلي ويبين البنود المعتمدة بوضوح في عرض السعر.`,
    }),
    quote: (city) => ({
      question: `كيف أحصل على عرض سعر لخدمة نقل في ${city}؟`,
      answer: `أدخل عناوين الاستلام والتسليم ووصف المنقولات وأي ملاحظات وصول تخص طلب ${city}. يراجع ممثل المبيعات البيانات ثم يرسل عرضاً مفصلاً قبل اعتماد الطلب.`,
    }),
    guest: (city) => ({
      question: `هل أحتاج إلى حساب لإرسال طلب نقل في ${city}؟`,
      answer: `لا يلزم إنشاء حساب لإرسال الطلب. يمكنك تقديم بيانات طلب ${city} كزائر، ثم استخدام رقم الطلب NQ ورقم الجوال في مسار التتبع المخصص.`,
    }),
    tracking: (city) => ({
      question: `كيف أتابع طلب النقل الخاص بي في ${city}؟`,
      answer: `بعد الإرسال تحصل على مرجع يبدأ بـ NQ. استخدم المرجع مع رقم الجوال في صفحة التتبع للاطلاع على المعلومات المتاحة للعميل دون عرض التفاصيل الداخلية.`,
    }),
  },
  en: {
    local: (city) => ({
      question: `Can I request transport within ${city}?`,
      answer: `Yes. You can submit a request between eligible pickup and delivery addresses in ${city}. Naqlk reviews the load, both addresses, and access requirements before confirming availability and timing.`,
    }),
    intercity: (city) => ({
      question: `Can I request transport from ${city} to another city?`,
      answer: `You can request an intercity journey from ${city} to a destination enabled in the operating scope. Confirmation follows a review of the items, addresses, requested date, and suitable resources.`,
    }),
    options: (city) => ({
      question: `Can I add packing or loading support to a ${city} request?`,
      answer: `Packing and loading or unloading can be selected as optional services when you submit a ${city} request. The reviewed quotation identifies the approved service items before execution.`,
    }),
    quote: (city) => ({
      question: `How do I request a transport quotation in ${city}?`,
      answer: `Provide the pickup and delivery addresses, an accurate item description, and any access notes for the ${city} request. A Sales representative reviews the details before sending an itemized quotation.`,
    }),
    guest: (city) => ({
      question: `Do I need an account to submit a ${city} request?`,
      answer: `No account is required. You can submit the ${city} request as a guest and later use the NQ request reference with the submitted mobile number through the dedicated tracking flow.`,
    }),
    tracking: (city) => ({
      question: `How can I track my ${city} transport request?`,
      answer: `The confirmation provides an NQ reference. Use it with the submitted mobile number on the tracking page to view the customer-safe status without exposing internal operational details.`,
    }),
  },
};

const profiles = [
  {
    code: "JED",
    slug: "jeddah",
    arName: "جدة",
    enName: "Jeddah",
    faq: ["local", "options", "tracking"],
    ar: {
      title: "خدمات نقل منظمة داخل جدة وبين المدن | نقلك",
      meta: "أرسل طلب نقل أثاث أو بضائع في جدة عبر نقلك، وحدد العناوين والخدمات الإضافية ليُراجع الفريق التفاصيل ويرسل عرض سعر واضحاً قبل التنفيذ.",
      h1: "خدمات نقل الأثاث والبضائع في جدة",
      intro:
        "تخدم نقلك طلبات النقل المؤهلة في جدة بمسار يبدأ من معلومات عملية لا من وعود عامة. يحدد العميل موقع الاستلام والتسليم وطبيعة الأثاث أو البضائع وموعده المفضل، ثم يراجع الفريق البيانات ليقترح ترتيباً قابلاً للتنفيذ وعرض سعر واضحاً.",
      service:
        "يمكن طلب نقل الأثاث أو البضائع العامة داخل جدة، أو تقديم طلب رحلة إلى مدينة أخرى متاحة ضمن نطاق التشغيل. تساعد ملاحظات المبنى، وحجم القطع، والحاجة إلى التغليف أو التحميل والتنزيل على تقييم الخدمة المناسبة؛ ولا تُضاف أي خدمة اختيارية قبل ظهورها كبند في العرض.",
      coverage:
        "تُقيّم العناوين في جدة حسب الموقع الفعلي وسهولة الوصول ومساحة توقف المركبة، لذلك لا تفترض الصفحة تغطية كل حي أو صلاحية كل عنوان قبل المراجعة.",
    },
    en: {
      title: "Organized Furniture and Goods Transport in Jeddah | Naqlk",
      meta: "Submit a furniture or goods transport request in Jeddah, add access and optional-service details, and receive a reviewed quotation before execution.",
      h1: "Furniture and goods transport in Jeddah",
      intro:
        "Naqlk handles eligible Jeddah transport requests through a practical review rather than a generic promise. Customers identify the pickup and delivery points, describe the furniture or goods, and provide a preferred date so the team can assess the request and prepare a clear quotation.",
      service:
        "Requests may cover furniture moving, general goods transport within Jeddah, or an intercity journey to a destination enabled in the current scope. Building access, item size, and optional packing or loading support are reviewed, and any approved option is shown as a separate quotation item.",
      coverage:
        "Jeddah addresses are assessed individually for location accuracy, vehicle access, and a workable stopping point. The page does not imply that every district or property is automatically serviceable.",
    },
  },
  {
    code: "MKK",
    slug: "makkah",
    arName: "مكة المكرمة",
    enName: "Makkah",
    faq: ["quote", "local", "guest"],
    ar: {
      title: "طلب نقل الأثاث والبضائع في مكة المكرمة | نقلك",
      meta: "رتّب طلب نقل داخل مكة المكرمة أو إلى وجهة متاحة عبر نقلك، مع وصف الحمولة والعناوين ومراجعة الطلب قبل إرسال عرض السعر.",
      h1: "ترتيب خدمات النقل في مكة المكرمة",
      intro:
        "في مكة المكرمة تتأثر خطة النقل بدقة العنوان ووقت الوصول وطبيعة المبنى بقدر تأثرها بنوع المنقولات. يتيح نموذج نقلك جمع هذه التفاصيل في طلب واحد، ثم يراجعها فريق المبيعات لتحديد ما إذا كانت الخدمة والموعد المطلوبان قابلين للتنفيذ.",
      service:
        "تشمل الخيارات المتاحة نقل الأثاث والبضائع العامة والنقل المحلي، مع إمكانية تقديم طلب بين المدن عندما تكون الوجهة مفعلة. يمكن إضافة التغليف أو المساعدة في التحميل والتنزيل عند الحاجة، وتظل تفاصيل التنفيذ خاضعة لمراجعة الحمولة والوصول وتوفر الموارد.",
      coverage:
        "لا تُفترض قابلية الوصول إلى كل موقع في مكة المكرمة. يفيد إدخال اسم الشارع ووصف المدخل والطابق وأقرب معلم في تقييم العنوان وتجنب معلومات تغطية مضللة.",
    },
    en: {
      title: "Plan Furniture and Goods Transport in Makkah | Naqlk",
      meta: "Arrange an eligible Makkah transport request with clear cargo, address, access, and timing details, followed by review and an itemized quotation.",
      h1: "Plan transport services in Makkah",
      intro:
        "A Makkah transport plan depends on accurate address, access, timing, and building information as much as the items being moved. Naqlk collects those details in one request and has Sales review them before confirming whether the requested service and schedule are workable.",
      service:
        "Available request types include furniture moving, general goods transport, and local journeys, plus intercity requests when the destination is enabled. Optional packing and loading or unloading support can be requested, while final execution details remain subject to cargo, access, and resource review.",
      coverage:
        "No Makkah address is assumed to be automatically reachable. Street, entrance, floor, and landmark notes help the team assess the location without publishing misleading blanket-coverage claims.",
    },
  },
  {
    code: "MED",
    slug: "madinah",
    arName: "المدينة المنورة",
    enName: "Madinah",
    faq: ["intercity", "options", "quote"],
    ar: {
      title: "خدمة نقل واضحة في المدينة المنورة | نقلك",
      meta: "اطلب نقل الأثاث أو البضائع في المدينة المنورة، وأضف تفاصيل الوصول والخدمات الاختيارية لتحصل على عرض سعر بعد مراجعة الطلب.",
      h1: "خدمات نقل مدروسة في المدينة المنورة",
      intro:
        "تساعد نقلك سكان المدينة المنورة والمنشآت فيها على تحويل احتياج النقل إلى طلب منظم. يبدأ ذلك بوصف المنقولات والعنوانين وتوقيت الخدمة، مع إرفاق الصور عند فائدتها، حتى يستطيع الفريق فهم النطاق قبل تقديم أي التزام أو تسعير.",
      service:
        "يمكن تقديم طلب لنقل الأثاث أو البضائع العامة داخل المدينة المنورة، كما يمكن طلب النقل إلى مدينة مفعلة أخرى. تتوفر خيارات التغليف والتحميل والتنزيل عند اختيارها وموافقة الفريق عليها، ويبين عرض السعر الكميات والبنود والضريبة والإجمالي قبل الاعتماد.",
      coverage:
        "تظل الخدمة مرتبطة بعنواني الطلب الفعليين ومتطلبات الدخول والتوقف. لا تعني إتاحة المدينة المنورة تشغيلياً أن جميع المواقع أو الأوقات مقبولة دون مراجعة.",
    },
    en: {
      title: "Clear Transport Requests in Madinah | Naqlk",
      meta: "Request furniture or goods transport in Madinah and provide access, timing, and optional-service details for review before a quotation is issued.",
      h1: "Reviewed transport services in Madinah",
      intro:
        "Naqlk helps households and businesses in Madinah turn a transport need into a structured request. Describing the items, both addresses, timing, and useful photos gives the team enough context to understand the scope before making a commitment or issuing a price.",
      service:
        "Customers can request furniture moving or general goods transport within Madinah, as well as transport to another enabled city. Packing and loading or unloading remain optional and are included only after review; the quotation then shows quantities, line items, VAT, and the total.",
      coverage:
        "Service depends on the actual pickup and delivery locations, entry conditions, and a practical vehicle stopping point. Operational availability in Madinah does not mean every site or time is accepted without review.",
    },
  },
  {
    code: "DMM",
    slug: "dammam",
    arName: "الدمام",
    enName: "Dammam",
    faq: ["local", "intercity", "tracking"],
    ar: {
      title: "نقل الأثاث والبضائع في الدمام بخطوات واضحة | نقلك",
      meta: "قدّم طلب نقل محلي أو بين المدن من الدمام مع بيانات الحمولة والعناوين، ودع فريق نقلك يراجع النطاق ويرسل عرضاً مفصلاً.",
      h1: "حلول طلب النقل في الدمام",
      intro:
        "تخدم الدمام احتياجات منزلية وتجارية متنوعة، ولهذا تعتمد نقلك على تفاصيل الطلب بدلاً من افتراض نموذج واحد لكل عملية نقل. يوضح العميل نوع المنقولات والكميات التقريبية ونقاط الاستلام والتسليم، ثم تتم مراجعة الملاءمة والموعد قبل عرض السعر.",
      service:
        "يدعم المسار طلبات نقل الأثاث والبضائع العامة داخل الدمام، وطلبات النقل إلى مدينة أخرى مفعلة. يمكن تحديد الحاجة إلى التغليف أو التحميل والتنزيل، بينما تبقى طبيعة الحمولة وحجمها وإمكانية الوصول عوامل أساسية في اعتماد الخدمة وتحديد بنودها.",
      coverage:
        "تُراجع مواقع الدمام وفق بيانات الخريطة والعنوان المكتوب وملاحظات البوابة أو المصعد أو منطقة التوقف. لا تُعرض قائمة أحياء مصطنعة ولا وعد بتغطية شاملة.",
    },
    en: {
      title: "Structured Furniture and Goods Transport in Dammam | Naqlk",
      meta: "Submit a local or intercity Dammam transport request with cargo and address details for scope review and a transparent itemized quotation.",
      h1: "Structured transport requests in Dammam",
      intro:
        "Dammam includes varied household and commercial transport needs, so Naqlk assesses the actual request instead of assuming one model fits every move. Customers describe the items, approximate quantities, pickup point, and destination before suitability and timing are reviewed.",
      service:
        "The flow supports furniture moving and general goods transport within Dammam, along with requests to another enabled city. Packing and loading or unloading can be selected, while cargo type, volume, and site access remain central to approval and the quotation line items.",
      coverage:
        "Dammam locations are reviewed using map coordinates, the written address, and notes about gates, lifts, or vehicle stopping space. No fabricated district list or blanket coverage promise is published.",
    },
  },
  {
    code: "KHO",
    slug: "al-khobar",
    arName: "الخبر",
    enName: "Al Khobar",
    faq: ["options", "quote", "guest"],
    ar: {
      title: "ترتيب نقل الأثاث والبضائع في الخبر | نقلك",
      meta: "نظّم طلب نقل في الخبر عبر نموذج يجمع العناوين وتفاصيل المنقولات والخدمات الإضافية، ثم استلم عرض سعر بعد مراجعة الفريق.",
      h1: "خدمات نقل مرنة للطلبات في الخبر",
      intro:
        "تبدأ عملية النقل الجيدة في الخبر بوصف واضح لما يجب نقله وكيفية الوصول إلى الموقعين. تجمع نقلك بيانات الأثاث أو البضائع والعناوين والتوقيت والملاحظات في طلب واحد، ليتحقق الفريق من النطاق قبل إعداد العرض وخطة التنفيذ.",
      service:
        "يمكن للعملاء طلب النقل داخل الخبر أو تقديم رحلة إلى مدينة متاحة أخرى، سواء للأثاث أو للبضائع العامة المؤهلة. تساعد صور القطع والكميات وملاحظات الطوابق في تحديد الاحتياج، ويمكن إدراج التغليف والتحميل والتنزيل كخيارات مستقلة عند اعتمادها.",
      coverage:
        "يُقيّم كل عنوان في الخبر على حدة، بما في ذلك مدخل المبنى ومساحة الحركة وموقع وقوف المركبة. لا تعتمد نقلك على تعميم واحد للمناطق السكنية والتجارية.",
    },
    en: {
      title: "Arrange Furniture and Goods Transport in Al Khobar | Naqlk",
      meta: "Organize an Al Khobar transport request with addresses, item details, and optional support, then receive a quotation after team review.",
      h1: "Flexible transport requests in Al Khobar",
      intro:
        "A well-planned move in Al Khobar begins with a clear description of the items and access at both sites. Naqlk combines cargo, address, timing, and access notes in one request so the team can confirm the scope before preparing a quotation and execution plan.",
      service:
        "Customers may request transport within Al Khobar or a journey to another enabled city for eligible furniture and general goods. Item photos, quantities, and floor notes improve the review, while packing and loading or unloading can appear as separate options when approved.",
      coverage:
        "Each Al Khobar address is assessed individually, including building entrance, movement space, and vehicle stopping conditions. Naqlk does not apply one blanket assumption to residential and commercial locations.",
    },
  },
  {
    code: "DHA",
    slug: "dhahran",
    arName: "الظهران",
    enName: "Dhahran",
    faq: ["local", "quote", "tracking"],
    ar: {
      title: "طلبات نقل الأثاث والبضائع في الظهران | نقلك",
      meta: "أرسل طلب نقل داخل الظهران أو إلى مدينة متاحة، مع وصف المنقولات والوصول لتتم مراجعته وإصدار عرض سعر واضح.",
      h1: "تنظيم طلب النقل في الظهران",
      intro:
        "تعتمد نقلك في الظهران على عنوان دقيق ووصف واقعي للمنقولات قبل اقتراح التنفيذ. يمكن للعميل توضيح نقطة الاستلام والوجهة والكميات التقريبية وأي قيود دخول، ما يساعد على تقليل الافتراضات عند مراجعة الطلب.",
      service:
        "يدعم النموذج نقل الأثاث والبضائع العامة والنقل المحلي، إضافة إلى طلبات بين المدن للوجهات المفعلة. لا يشمل ذلك تلقائياً أعمال النقل الصناعي المتخصص؛ فكل حمولة تُراجع وفق طبيعتها، وتظهر خدمات التغليف أو التحميل والتنزيل في العرض عند مناسبتها.",
      coverage:
        "تُقبل الطلبات في الظهران بحسب صلاحية العنوان والوصول والتوقيت وتوفر الموارد. إدراج إحداثيات الموقع ووصف البوابة يساعد أكثر من الاعتماد على اسم المنطقة وحده.",
    },
    en: {
      title: "Furniture and Goods Transport Requests in Dhahran | Naqlk",
      meta: "Submit a Dhahran local or enabled intercity transport request with accurate item and access details for review and clear pricing.",
      h1: "Organize a transport request in Dhahran",
      intro:
        "Naqlk relies on an accurate Dhahran address and a realistic item description before proposing execution. Customers can identify the pickup point, destination, approximate quantities, and any entry restrictions, reducing assumptions during the request review.",
      service:
        "The form supports furniture moving, general goods transport, local journeys, and intercity requests to enabled destinations. It does not automatically cover specialized industrial haulage; every load is assessed, with packing or loading and unloading listed only when suitable.",
      coverage:
        "Dhahran requests are accepted according to address suitability, access, timing, and available resources. Map coordinates and gate notes are more useful than relying on the area name alone.",
    },
  },
  {
    code: "AHS",
    slug: "al-ahsa",
    arName: "الأحساء",
    enName: "Al Ahsa",
    faq: ["intercity", "guest", "options"],
    ar: {
      title: "خدمات نقل مدروسة في الأحساء | نقلك",
      meta: "اطلب نقل الأثاث أو البضائع في الأحساء مع تحديد الموقعين وطبيعة الحمولة، واستلم عرضاً بعد مراجعة الوصول والخدمة المطلوبة.",
      h1: "خدمات نقل الأثاث والبضائع في الأحساء",
      intro:
        "اتساع النطاق العمراني في الأحساء يجعل تحديد نقطة الاستلام والتسليم بدقة خطوة مهمة. يتيح طلب نقلك إضافة الإحداثيات والعنوان الوصفي وتفاصيل الحمولة، حتى يراجع الفريق المسافة والوصول ومتطلبات الخدمة قبل التأكيد.",
      service:
        "تشمل الطلبات المؤهلة نقل الأثاث والبضائع العامة داخل الأحساء، أو رحلة إلى مدينة أخرى مفعلة عند توفرها. يمكن اختيار التغليف والتحميل والتنزيل حسب الحاجة، ويظل العرض النهائي مرتبطاً بالكميات الفعلية وطبيعة المواقع والموعد المطلوب.",
      coverage:
        "لا تستخدم الصفحة أسماء مناطق فرعية غير موثقة لإيحاء بتغطية أوسع. تُراجع كل نقطة في الأحساء باستخدام بيانات العنوان التي يرسلها العميل ونطاق التشغيل الحالي.",
    },
    en: {
      title: "Reviewed Furniture and Goods Transport in Al Ahsa | Naqlk",
      meta: "Request furniture or goods transport in Al Ahsa with precise locations and cargo details, followed by an access and service review.",
      h1: "Furniture and goods transport in Al Ahsa",
      intro:
        "Al Ahsa's broad urban area makes precise pickup and delivery points especially useful. A Naqlk request can include coordinates, a written address, and cargo details so the team can assess distance, access, and service requirements before confirmation.",
      service:
        "Eligible requests include furniture moving and general goods transport within Al Ahsa, or a journey to another enabled city when available. Packing and loading or unloading are optional, while final quotation items depend on actual quantities, locations, and the requested schedule.",
      coverage:
        "The page does not use unverified sub-area lists to imply wider coverage. Each Al Ahsa point is reviewed using customer-provided address data and the current operating scope.",
    },
  },
  {
    code: "JUB",
    slug: "jubail",
    arName: "الجبيل",
    enName: "Jubail",
    faq: ["quote", "intercity", "local"],
    ar: {
      title: "نقل الأثاث والبضائع العامة في الجبيل | نقلك",
      meta: "قدّم طلب نقل مؤهل في الجبيل للأثاث أو البضائع العامة، مع مراجعة طبيعة الحمولة والعناوين قبل إصدار عرض السعر.",
      h1: "خدمات النقل العام للأثاث والبضائع في الجبيل",
      intro:
        "تتعامل نقلك في الجبيل مع احتياجات نقل الأثاث والبضائع العامة المؤهلة، مع فصل واضح بينها وبين النقل الصناعي المتخصص غير المشمول. يصف العميل الحمولة والاستخدام المطلوب والعنوانين، ثم يراجع الفريق ملاءمة الخدمة قبل التسعير.",
      service:
        "يمكن تقديم طلب داخل الجبيل أو إلى وجهة مفعلة بين المدن. تُستخدم الكمية والأبعاد والصور وملاحظات الموقع لتقييم المركبة والجهد المطلوب، وقد تضاف خدمات التغليف أو التحميل والتنزيل بعد المراجعة؛ ولا تشمل الخدمة المعلنة الجمارك أو الشحن الدولي أو مناولة المعدات الثقيلة.",
      coverage:
        "ترتبط إمكانية التنفيذ بالمواقع الفعلية ونوع المنقولات وشروط الدخول. لا تُعد الإتاحة التشغيلية في الجبيل موافقة مسبقة على المواقع الصناعية أو المقيدة.",
    },
    en: {
      title: "Furniture and General Goods Transport in Jubail | Naqlk",
      meta: "Submit an eligible Jubail furniture or general-goods request, with cargo and address suitability reviewed before a quotation is issued.",
      h1: "Furniture and general goods transport in Jubail",
      intro:
        "Naqlk serves eligible furniture and general-goods needs in Jubail while keeping them distinct from unsupported specialist industrial haulage. Customers describe the load, intended service, and both addresses before the team reviews suitability and prepares pricing.",
      service:
        "A request may be within Jubail or to an enabled intercity destination. Quantities, dimensions, photos, and site notes help assess the required transport and effort, with packing or loading support added after review. Customs, international shipping, and heavy-equipment handling are not claimed here.",
      coverage:
        "Execution depends on the actual sites, cargo type, and entry conditions. Jubail's operational status is not advance approval for industrial or otherwise restricted locations.",
    },
  },
  {
    code: "TAI",
    slug: "taif",
    arName: "الطائف",
    enName: "Taif",
    faq: ["options", "tracking", "intercity"],
    ar: {
      title: "تنظيم نقل الأثاث والبضائع في الطائف | نقلك",
      meta: "أرسل طلب نقل داخل الطائف أو إلى مدينة مفعلة، وشارك تفاصيل الطريق والوصول والحمولة للحصول على عرض مدروس.",
      h1: "خدمات نقل منظمة في الطائف",
      intro:
        "يساعد وصف الموقع وطبيعة الوصول في الطائف على بناء خطة نقل أكثر دقة، خصوصاً عندما تختلف مداخل المباني أو ظروف الطريق. تجمع نقلك هذه الملاحظات مع بيانات المنقولات والموعد، ثم تراجع الطلب قبل اقتراح التنفيذ.",
      service:
        "يمكن طلب نقل الأثاث أو البضائع العامة داخل الطائف، كما يمكن تقديم طلب بين المدن إلى وجهة متاحة. يفيد توضيح القطع الكبيرة والطوابق ومساحة الوقوف في تحديد الاحتياج، ويمكن طلب التغليف والتحميل والتنزيل كبنود اختيارية وليست افتراضاً ثابتاً.",
      coverage:
        "تُراجع نقاط الطائف حسب الإحداثيات والعنوان والوصول الفعلي، بما في ذلك أي ملاحظة طريق يقدمها العميل. لا تقدم الصفحة ضماناً عاماً لكل موقع أو موعد.",
    },
    en: {
      title: "Organized Furniture and Goods Transport in Taif | Naqlk",
      meta: "Submit a Taif local or enabled intercity request with road, access, and cargo details for a considered quotation and plan.",
      h1: "Organized transport services in Taif",
      intro:
        "Location and access information helps create a more accurate Taif transport plan, particularly where building entrances or road conditions differ. Naqlk combines those notes with item and timing details, then reviews the request before proposing execution.",
      service:
        "Customers can request furniture moving or general goods transport within Taif, as well as an intercity journey to an available destination. Large items, floors, and stopping space help define the need, while packing and loading or unloading remain optional quotation items.",
      coverage:
        "Taif points are assessed using coordinates, the written address, and any road-access note supplied by the customer. The page does not guarantee every location or time in advance.",
    },
  },
  {
    code: "TUU",
    slug: "tabuk",
    arName: "تبوك",
    enName: "Tabuk",
    faq: ["guest", "quote", "intercity"],
    ar: {
      title: "طلب نقل محلي وبين المدن من تبوك | نقلك",
      meta: "نظّم طلب نقل أثاث أو بضائع في تبوك، وحدد العنوان والوجهة والحمولة ليتم تقييم النطاق وإرسال عرض سعر قبل التنفيذ.",
      h1: "خدمات نقل قابلة للمراجعة في تبوك",
      intro:
        "توفر نقلك لتبوك مساراً واضحاً لطلب النقل يبدأ بالبيانات الأساسية وينتهي بعرض يمكن مراجعته. يحدد العميل نوع الخدمة والحمولة والعنوانين والتاريخ المرغوب، ما يسمح للفريق بتقييم رحلة المدينة أو المسافة بين المدن دون افتراضات.",
      service:
        "تشمل الطلبات الممكنة نقل الأثاث والبضائع العامة داخل تبوك، ورحلات إلى وجهات مفعلة عند قبولها. لأن مسافة الرحلة والموارد تختلف، تتم مراجعة النقل بين المدن لكل طلب، كما تُدرج خدمات التغليف والتحميل والتنزيل فقط إذا اختارها العميل واعتمدت.",
      coverage:
        "يعتمد نطاق تبوك الفعلي على نقطة الاستلام والتسليم وملاءمة الوصول والموعد. لا تعني صفحة المدينة وجود جدول ثابت لكل وجهة أو تغطية غير محدودة.",
    },
    en: {
      title: "Local and Intercity Transport Requests from Tabuk | Naqlk",
      meta: "Organize furniture or goods transport in Tabuk with destination, cargo, and address details reviewed before execution and pricing.",
      h1: "Reviewed transport services in Tabuk",
      intro:
        "Naqlk gives Tabuk customers a clear transport-request path that starts with essential information and ends with a reviewable quotation. Service type, cargo, addresses, and preferred date allow the team to assess a local or intercity journey without assumptions.",
      service:
        "Possible requests include furniture moving and general goods transport within Tabuk, plus journeys to enabled destinations when accepted. Because distance and resources vary, intercity requests are reviewed individually, and packing or loading support is listed only when selected and approved.",
      coverage:
        "The practical Tabuk scope depends on pickup, delivery, access suitability, and timing. A city page does not imply a fixed schedule to every destination or unlimited coverage.",
    },
  },
  {
    code: "AHB",
    slug: "abha",
    arName: "أبها",
    enName: "Abha",
    faq: ["local", "options", "quote"],
    ar: {
      title: "خدمات نقل تراعي تفاصيل الوصول في أبها | نقلك",
      meta: "قدّم طلب نقل أثاث أو بضائع في أبها مع وصف الموقع والوصول والقطع، ليُراجع الفريق الخدمة ويرسل عرضاً واضحاً.",
      h1: "تنظيم خدمات النقل في أبها",
      intro:
        "تجعل طبيعة أبها المرتفعة وتنوع الوصول بين المواقع من تفاصيل الطريق والمدخل جزءاً مهماً من طلب النقل. تتيح نقلك إضافة الإحداثيات ووصف المبنى والقطع المراد نقلها حتى تتم مراجعة الحالة الفعلية بدلاً من الاعتماد على اسم المدينة فقط.",
      service:
        "يدعم المسار نقل الأثاث والبضائع العامة داخل أبها، وطلبات بين المدن عندما تكون الوجهة ضمن النطاق المفعّل. يمكن اختيار التغليف أو التحميل والتنزيل، وتساعد معلومات القطع الكبيرة والطوابق ومساحة الحركة في تحديد بنود العرض والموارد المناسبة.",
      coverage:
        "لا تدعي نقلك الوصول التلقائي إلى كل موقع في أبها. تُراجع العناوين وملاحظات الطريق والتوقف لكل طلب، وقد يتطلب الفريق معلومات إضافية قبل التأكيد.",
    },
    en: {
      title: "Transport Planned Around Access Details in Abha | Naqlk",
      meta: "Submit an Abha furniture or goods request with location, access, and item details so the team can review service and provide a clear quotation.",
      h1: "Plan transport services in Abha",
      intro:
        "Abha's elevated setting and varied site access make road and entrance details an important part of a transport request. Naqlk lets customers add coordinates, building notes, and item information so the real location is reviewed rather than relying on the city name alone.",
      service:
        "The flow supports furniture moving and general goods transport within Abha, with intercity requests when the destination is enabled. Packing or loading and unloading can be selected, while large-item, floor, and movement-space details help determine quotation items and suitable resources.",
      coverage:
        "Naqlk does not claim automatic access to every Abha location. Addresses, road notes, and stopping conditions are reviewed for each request, and the team may ask for additional information.",
    },
  },
  {
    code: "KMX",
    slug: "khamis-mushait",
    arName: "خميس مشيط",
    enName: "Khamis Mushait",
    faq: ["tracking", "intercity", "guest"],
    ar: {
      title: "نقل الأثاث والبضائع في خميس مشيط | نقلك",
      meta: "اطلب نقل الأثاث أو البضائع في خميس مشيط عبر مسار يجمع العناوين والحمولة والموعد، ثم راجع عرض السعر قبل الاعتماد.",
      h1: "خدمات نقل واضحة في خميس مشيط",
      intro:
        "يمنح طلب نقلك في خميس مشيط الفريق صورة عملية عن النقل المطلوب قبل تحديد الحل. يضيف العميل نوع الخدمة وموقعي الاستلام والتسليم ووصف المنقولات والموعد، مع ملاحظات الوصول التي قد تؤثر في الوقوف أو حركة القطع.",
      service:
        "يمكن استخدام المسار لنقل الأثاث أو البضائع العامة داخل خميس مشيط، أو لطلب رحلة إلى مدينة أخرى متاحة. تُراجع الخدمات الاختيارية مثل التغليف والتحميل والتنزيل مع الحمولة، ويظل عرض السعر المرجع لبنود الخدمة والضريبة والإجمالي.",
      coverage:
        "تُحدد قابلية الخدمة في خميس مشيط من واقع العنوانين ونطاق التشغيل وتوفر الموارد. لا تنشر الصفحة قائمة أحياء غير موثقة أو وعداً مسبقاً لكل طلب.",
    },
    en: {
      title: "Clear Furniture and Goods Transport in Khamis Mushait | Naqlk",
      meta: "Request Khamis Mushait transport through a flow that captures addresses, cargo, and timing before you review the quotation.",
      h1: "Clear transport services in Khamis Mushait",
      intro:
        "A Naqlk request in Khamis Mushait gives the team a practical view of the needed transport before a solution is selected. Customers add service type, pickup and delivery locations, item details, timing, and access notes that may affect parking or item movement.",
      service:
        "The flow can be used for furniture or general goods within Khamis Mushait, or for a request to another available city. Optional packing and loading or unloading are reviewed with the cargo, while the quotation remains the authority for service items, VAT, and total.",
      coverage:
        "Service feasibility in Khamis Mushait is based on the addresses, current operating scope, and resource availability. No unverified district list or advance acceptance promise is published.",
    },
  },
  {
    code: "ELQ",
    slug: "buraidah",
    arName: "بريدة",
    enName: "Buraidah",
    faq: ["quote", "local", "options"],
    ar: {
      title: "ترتيب نقل الأثاث والبضائع في بريدة | نقلك",
      meta: "أرسل تفاصيل طلب النقل في بريدة للأثاث أو البضائع، واختر الدعم الإضافي عند الحاجة لتحصل على عرض بعد المراجعة.",
      h1: "خدمات نقل منظمة في بريدة",
      intro:
        "تساعد نقلك العملاء في بريدة على وصف احتياج النقل بطريقة تقلل الغموض عند التسعير. تشمل البيانات العناوين ونوع القطع والكميات التقريبية والتاريخ، ويمكن إضافة صور أو ملاحظات للمداخل عندما تسهم في تقييم الطلب.",
      service:
        "يدعم النظام النقل داخل بريدة للأثاث والبضائع العامة، كما يقبل طلبات بين المدن للوجهات المفعلة. يختار العميل التغليف أو التحميل والتنزيل عند الحاجة، ثم يراجع الفريق هذه الخيارات مع تفاصيل الحمولة قبل إصدار عرض البنود النهائي.",
      coverage:
        "تُراجع نقاط بريدة بشكل مستقل وفق دقة الموقع وإمكانية الوصول والموارد المتوفرة في التاريخ المطلوب. لا تُفهم الإتاحة كضمان لكل حي أو مبنى.",
    },
    en: {
      title: "Arrange Furniture and Goods Transport in Buraidah | Naqlk",
      meta: "Send Buraidah furniture or goods request details, select optional support when needed, and receive a quotation after review.",
      h1: "Organized transport services in Buraidah",
      intro:
        "Naqlk helps Buraidah customers describe a transport need in a way that reduces uncertainty during pricing. Addresses, item types, approximate quantities, and date are captured, with photos or entrance notes added when they improve the assessment.",
      service:
        "The system supports furniture and general-goods transport within Buraidah and accepts intercity requests to enabled destinations. Customers select packing or loading and unloading when needed, then the team reviews those options with the cargo before issuing the final line-item quotation.",
      coverage:
        "Buraidah points are reviewed independently using location accuracy, access feasibility, and resources available for the requested date. Operational availability is not a guarantee for every district or building.",
    },
  },
  {
    code: "HAS",
    slug: "hail",
    arName: "حائل",
    enName: "Hail",
    faq: ["intercity", "tracking", "quote"],
    ar: {
      title: "طلبات نقل الأثاث والبضائع في حائل | نقلك",
      meta: "قدّم طلب نقل داخل حائل أو إلى وجهة مفعلة مع العناوين ووصف الحمولة، واحصل على عرض سعر مدروس قبل التنفيذ.",
      h1: "خدمات نقل قابلة للتخطيط في حائل",
      intro:
        "توفر نقلك في حائل نموذجاً يجمع ما يحتاجه الفريق لتقييم عملية النقل دون اتصالات متفرقة. يوضح العميل الخدمة المطلوبة وموقعي الرحلة والمنقولات والتوقيت، ثم تتم مراجعة المعلومات لإعداد نطاق مفهوم وعرض سعر قابل للمراجعة.",
      service:
        "يمكن إرسال طلب للأثاث أو البضائع العامة داخل حائل، أو طلب نقل بين المدن إلى وجهة متاحة. تختلف متطلبات الرحلات بحسب المسافة والحمولة، لذلك يُراجع كل طلب منفرداً، وتضاف خدمات التغليف والتحميل والتنزيل عندما تكون مطلوبة ومناسبة.",
      coverage:
        "يُحدد نطاق العمل من العناوين الفعلية والوصول والجدول المتاح، لا من اسم حائل وحده. لا يوجد في الصفحة ادعاء بجدول رحلات ثابت أو تغطية كل موقع.",
    },
    en: {
      title: "Plan Furniture and Goods Transport in Hail | Naqlk",
      meta: "Submit local or enabled intercity transport in Hail with addresses and cargo details, then receive a reviewed quotation before execution.",
      h1: "Transport services you can plan in Hail",
      intro:
        "Naqlk provides a Hail request form that gathers what the team needs to assess a move without fragmented conversations. Customers identify the service, journey points, items, and timing before the information is reviewed into a clear scope and quotation.",
      service:
        "Furniture and general-goods requests may be submitted within Hail or to an available intercity destination. Journey requirements vary with distance and cargo, so each request is assessed individually, with packing and loading or unloading added when needed and suitable.",
      coverage:
        "The working scope comes from actual addresses, access, and an available schedule rather than the Hail name alone. This page does not claim fixed departures or coverage of every location.",
    },
  },
  {
    code: "YNB",
    slug: "yanbu",
    arName: "ينبع",
    enName: "Yanbu",
    faq: ["local", "guest", "options"],
    ar: {
      title: "نقل الأثاث والبضائع العامة في ينبع | نقلك",
      meta: "اطلب نقل الأثاث أو البضائع العامة في ينبع مع تحديد الحمولة والعناوين، ليتم فحص الملاءمة وإرسال عرض واضح.",
      h1: "خدمات نقل الأثاث والبضائع العامة في ينبع",
      intro:
        "تخدم نقلك طلبات الأثاث والبضائع العامة المؤهلة في ينبع، مع مراجعة طبيعة المنقولات بدقة قبل القبول. يرسل العميل العنوانين والوصف والكميات التقريبية وأي صور مفيدة، حتى لا تختلط الخدمة العامة بأعمال الموانئ أو الشحن المتخصص غير المعلن.",
      service:
        "يشمل نطاق الطلب النقل داخل ينبع أو إلى مدينة أخرى مفعلة عند الموافقة. يمكن اختيار التغليف والتحميل والتنزيل، وتُحدد البنود حسب الحمولة والوصول؛ ولا تدعي الصفحة تقديم التخليص الجمركي أو الشحن الدولي أو خدمات التخزين.",
      coverage:
        "تُراجع مواقع ينبع وفق عنوان الطلب الفعلي وشروط الدخول ووقوف المركبة. وجود المدينة في مناطق الخدمة لا يعني قبول مواقع مقيدة أو أنواع حمولة غير مدعومة.",
    },
    en: {
      title: "Furniture and General Goods Transport in Yanbu | Naqlk",
      meta: "Request eligible furniture or general-goods transport in Yanbu with cargo and address details reviewed before a clear quotation.",
      h1: "Furniture and general goods transport in Yanbu",
      intro:
        "Naqlk serves eligible furniture and general-goods requests in Yanbu, with cargo type reviewed carefully before acceptance. Customers provide both addresses, descriptions, approximate quantities, and useful photos so the general service is not confused with unadvertised port or specialist freight work.",
      service:
        "Requests may be within Yanbu or to another enabled city when approved. Packing and loading or unloading can be selected and quoted according to cargo and access. Customs clearance, international shipping, and warehousing are not claimed by this page.",
      coverage:
        "Yanbu locations are reviewed using the actual request address, entry conditions, and vehicle stopping needs. Service-area status does not imply acceptance of restricted sites or unsupported cargo types.",
    },
  },
  {
    code: "GIZ",
    slug: "jazan",
    arName: "جازان",
    enName: "Jazan",
    faq: ["quote", "tracking", "intercity"],
    ar: {
      title: "خدمات نقل الأثاث والبضائع في جازان | نقلك",
      meta: "نظّم طلب نقل في جازان من خلال بيانات واضحة للمنقولات والعنوانين، ثم استلم عرضاً بعد التحقق من النطاق والتوفر.",
      h1: "تنظيم طلبات النقل في جازان",
      intro:
        "تبدأ خدمة نقلك في جازان بطلب يوضح الحاجة بدلاً من وعد عام. يحدد العميل ما سينقله ومكان الاستلام والتسليم والتاريخ، ويضيف ملاحظات الوصول أو الصور عند الحاجة، ليتمكن الفريق من تقييم النطاق الفعلي.",
      service:
        "يمكن طلب نقل الأثاث والبضائع العامة داخل جازان، أو تقديم رحلة إلى مدينة مفعلة ضمن التشغيل. تُراجع المسافة والحمولة والموعد قبل التأكيد، ويمكن أن يشمل العرض التغليف أو التحميل والتنزيل عندما يختارها العميل وتناسب الطلب.",
      coverage:
        "تعتمد إمكانية التنفيذ في جازان على العناوين المحددة والوصول وتوفر الموارد. لا تقدم الصفحة وعداً بتغطية كل موقع في المنطقة أو جميع الوجهات.",
    },
    en: {
      title: "Furniture and Goods Transport Requests in Jazan | Naqlk",
      meta: "Organize a Jazan transport request with clear item and address details, then receive a quotation after scope and availability review.",
      h1: "Organize transport requests in Jazan",
      intro:
        "Naqlk service in Jazan begins with a request that explains the need rather than a blanket promise. Customers specify the items, pickup, delivery, and date, adding access notes or photos when useful so the team can evaluate the actual scope.",
      service:
        "Furniture and general-goods transport can be requested within Jazan, or to a city enabled in the operating scope. Distance, cargo, and timing are reviewed before confirmation, with packing or loading and unloading added when selected and suitable.",
      coverage:
        "Execution in Jazan depends on the specified addresses, access, and available resources. The page does not promise every location in the region or every destination.",
    },
  },
  {
    code: "EAM",
    slug: "najran",
    arName: "نجران",
    enName: "Najran",
    faq: ["guest", "options", "local"],
    ar: {
      title: "طلب نقل واضح للأثاث والبضائع في نجران | نقلك",
      meta: "أرسل طلب نقل في نجران مع العناوين والحمولة والخدمات الاختيارية، ليُراجع الفريق البيانات قبل عرض السعر والتنفيذ.",
      h1: "خدمات نقل واضحة في نجران",
      intro:
        "يمنح نموذج نقلك لطلبات نجران العميل طريقة مباشرة لتسجيل كل ما يؤثر في النقل. تشمل البيانات وصف الأثاث أو البضائع والموقعين والوقت المقترح ومتطلبات الدخول، وبذلك يستطيع الفريق مراجعة الطلب بصورة عملية.",
      service:
        "يدعم النظام النقل المحلي داخل نجران وطلبات بين المدن إلى الوجهات المفعلة، للأثاث والبضائع العامة المؤهلة. يختار العميل التغليف أو التحميل والتنزيل عند الحاجة، ويعتمد العرض النهائي على تفاصيل الحمولة والعنوان وتوفر الموارد.",
      coverage:
        "لا تُنشر ادعاءات بأن كل مواقع نجران متاحة تلقائياً. يُفحص كل عنوان ومسار طلب وفق المعلومات المقدمة ونطاق التشغيل في وقت المراجعة.",
    },
    en: {
      title: "Clear Furniture and Goods Transport in Najran | Naqlk",
      meta: "Submit a Najran transport request with addresses, cargo, and optional services for team review before quotation and execution.",
      h1: "Clear transport services in Najran",
      intro:
        "The Naqlk form gives Najran customers a direct way to record each factor that affects transport. Item descriptions, both locations, proposed timing, and entry requirements allow the team to review the request on practical information.",
      service:
        "The system supports local journeys within Najran and intercity requests to enabled destinations for eligible furniture and general goods. Customers may select packing or loading and unloading, while the final quotation depends on cargo, address, and resource availability.",
      coverage:
        "No claim is made that every Najran location is automatically available. Each address and requested journey is checked against the submitted information and operating scope at review time.",
    },
  },
  {
    code: "AKJ",
    slug: "al-kharj",
    arName: "الخرج",
    enName: "Al Kharj",
    faq: ["intercity", "quote", "tracking"],
    ar: {
      title: "تنظيم النقل داخل الخرج وإلى المدن المتاحة | نقلك",
      meta: "قدّم طلب نقل أثاث أو بضائع في الخرج أو إلى وجهة مفعلة، مع مراجعة العناوين والنطاق وإرسال عرض قبل الاعتماد.",
      h1: "خدمات النقل داخل الخرج وبين المدن",
      intro:
        "تساعد نقلك في الخرج على تنظيم الطلبات المحلية والطلبات المتجهة إلى مدينة أخرى متاحة من خلال مسار واحد. يحدد العميل العنوانين وطبيعة المنقولات والتوقيت، ثم يراجع الفريق المسافة والوصول والخدمات المطلوبة.",
      service:
        "تشمل الطلبات المؤهلة نقل الأثاث والبضائع العامة داخل الخرج، إضافة إلى النقل بين المدن عندما تكون الوجهة مفعلة. يمكن إضافة التغليف أو التحميل والتنزيل، وتظهر تفاصيل الكميات والأسعار والضريبة في العرض قبل قبول العميل.",
      coverage:
        "يُراجع عنوان الخرج والوجهة الفعلية لكل طلب، ولا يُفترض القبول استناداً إلى قرب مدينة أخرى أو اسم المنطقة. الموعد النهائي مرتبط بالتوفر بعد المراجعة.",
    },
    en: {
      title: "Transport Within Al Kharj and to Enabled Cities | Naqlk",
      meta: "Submit furniture or goods transport in Al Kharj or to an enabled destination, with addresses and scope reviewed before approval.",
      h1: "Local and intercity transport in Al Kharj",
      intro:
        "Naqlk helps Al Kharj customers organize local requests and journeys to another available city through one flow. Customers specify the addresses, items, and timing before the team assesses distance, access, and requested services.",
      service:
        "Eligible requests include furniture and general-goods transport within Al Kharj, plus intercity transport when the destination is enabled. Packing or loading and unloading can be added, with quantities, pricing, VAT, and totals shown before customer acceptance.",
      coverage:
        "The actual Al Kharj address and destination are reviewed for each request; acceptance is not inferred from proximity to another city or the region name. Final timing depends on availability after review.",
    },
  },
  {
    code: "ARA",
    slug: "arar",
    arName: "عرعر",
    enName: "Arar",
    faq: ["local", "guest", "quote"],
    ar: {
      title: "طلب نقل الأثاث والبضائع في عرعر | نقلك",
      meta: "أرسل طلب نقل محلي أو بين المدن من عرعر مع تفاصيل العنوان والحمولة، ليُراجع النطاق ويُرسل عرض سعر واضح.",
      h1: "خدمات نقل مدروسة في عرعر",
      intro:
        "تتيح نقلك لعملاء عرعر تسجيل احتياج النقل بمعلومات تساعد على اتخاذ قرار واقعي. يتضمن الطلب نوع الخدمة والعنوانين ووصف المنقولات والتاريخ المرغوب، مع إمكانية إضافة ملاحظات أو صور توضح الحجم والوصول.",
      service:
        "يمكن تقديم طلب لنقل الأثاث أو البضائع العامة داخل عرعر أو إلى وجهة مفعلة أخرى. تُراجع رحلات المدن بحسب المسافة والموارد، بينما يبقى التغليف والتحميل والتنزيل اختيارياً ويظهر كبنود مستقلة عند اعتماده.",
      coverage:
        "يعتمد قبول الخدمة في عرعر على المواقع الفعلية والوصول والتوقيت، ولا تُستنتج تغطية كل موقع أو وجهة من تفعيل المدينة في النموذج.",
    },
    en: {
      title: "Furniture and Goods Transport Requests in Arar | Naqlk",
      meta: "Submit local or intercity transport from Arar with address and cargo details so the scope can be reviewed and clearly quoted.",
      h1: "Reviewed transport services in Arar",
      intro:
        "Naqlk lets Arar customers record a transport need using information that supports a realistic decision. The request captures service type, both addresses, items, and preferred date, with notes or photos available to clarify size and access.",
      service:
        "Customers can request furniture or general-goods transport within Arar or to another enabled destination. Intercity journeys are reviewed for distance and resources, while packing and loading or unloading remain optional and appear as separate approved items.",
      coverage:
        "Service acceptance in Arar depends on the real locations, access, and timing. Activating the city in the request form does not imply every site or destination is covered.",
    },
  },
  {
    code: "AJF",
    slug: "sakaka",
    arName: "سكاكا",
    enName: "Sakaka",
    faq: ["options", "intercity", "tracking"],
    ar: {
      title: "خدمات نقل منظمة للأثاث والبضائع في سكاكا | نقلك",
      meta: "نظّم طلب نقل في سكاكا مع بيانات المنقولات والوصول، واختر الخدمات الإضافية المناسبة قبل استلام عرض السعر.",
      h1: "تنظيم نقل الأثاث والبضائع في سكاكا",
      intro:
        "يركز مسار نقلك في سكاكا على المعلومات التي تحدد نطاق العمل فعلياً. يسجل العميل عناوين الرحلة ووصف القطع والكميات والموعد، ويضيف أي قيود عند البوابة أو داخل المبنى قبل أن يراجع الفريق الطلب.",
      service:
        "تتوفر إمكانية طلب النقل المحلي للأثاث والبضائع العامة، أو تقديم طلب إلى مدينة مفعلة أخرى. يمكن اختيار التغليف والمساعدة في التحميل والتنزيل، وتُراجع هذه الخدمات مع حجم الحمولة حتى يعكس العرض العمل الموافق عليه فقط.",
      coverage:
        "تُقيم نقاط سكاكا وفق الإحداثيات والعنوان وشروط الوصول في الوقت المطلوب. لا تدرج الصفحة مناطق فرعية أو مسارات غير موثقة لزيادة الانطباع بالتغطية.",
    },
    en: {
      title: "Organized Furniture and Goods Transport in Sakaka | Naqlk",
      meta: "Organize a Sakaka transport request with item and access data, selecting suitable optional services before the quotation.",
      h1: "Organize furniture and goods transport in Sakaka",
      intro:
        "The Naqlk flow in Sakaka focuses on information that defines the actual work. Customers record the journey addresses, items, quantities, and preferred date, adding any gate or building restrictions before the team reviews the request.",
      service:
        "Furniture and general-goods transport can be requested locally or to another enabled city. Packing and loading or unloading may be selected, then assessed against cargo volume so the quotation reflects only the approved work.",
      coverage:
        "Sakaka points are evaluated using coordinates, the written address, and access conditions for the requested time. No unverified sub-area or route list is published to inflate the impression of coverage.",
    },
  },
  {
    code: "ABT",
    slug: "al-bahah",
    arName: "الباحة",
    enName: "Al Bahah",
    faq: ["local", "options", "guest"],
    ar: {
      title: "خدمات نقل تراعي الوصول في الباحة | نقلك",
      meta: "اطلب نقل الأثاث أو البضائع في الباحة مع تفاصيل الطريق والمدخل والحمولة، ليتم تقييم التنفيذ وإرسال عرض واضح.",
      h1: "خدمات نقل مدروسة في الباحة",
      intro:
        "تفاصيل الطريق ومدخل الموقع مهمة عند التخطيط للنقل في الباحة ذات الطبيعة المرتفعة. يتيح نموذج نقلك إضافة إحداثيات دقيقة ووصف للمبنى والمنقولات، حتى يبني الفريق مراجعته على الموقع الحقيقي لا على افتراض عام.",
      service:
        "يمكن طلب نقل الأثاث والبضائع العامة داخل الباحة، أو تقديم طلب رحلة إلى مدينة مفعلة عندما تسمح تفاصيل التشغيل. تساعد صور القطع والطوابق ومساحة التوقف في التقييم، ويمكن إدراج التغليف أو التحميل والتنزيل كخدمات اختيارية.",
      coverage:
        "لا تعد الصفحة بأن كل طريق أو موقع في الباحة مناسب للمركبة. تُراجع ملاحظات الوصول والعنوان والتوقيت لكل طلب، وقد يحتاج الفريق إلى توضيح قبل اعتماد العرض.",
    },
    en: {
      title: "Transport Planned for Access Conditions in Al Bahah | Naqlk",
      meta: "Request furniture or goods transport in Al Bahah with road, entrance, and cargo details reviewed before execution and quotation.",
      h1: "Reviewed transport services in Al Bahah",
      intro:
        "Road and entrance details matter when planning transport in Al Bahah's elevated setting. The Naqlk form captures precise coordinates, building notes, and item information so the team reviews the real site instead of relying on a broad assumption.",
      service:
        "Furniture and general-goods transport can be requested within Al Bahah, or to an enabled city when operating details allow. Item photos, floor information, and stopping space support assessment, with packing or loading and unloading available as optional services.",
      coverage:
        "The page does not promise that every Al Bahah road or site suits the vehicle. Access notes, address, and timing are reviewed for each request, and clarification may be required before quotation approval.",
    },
  },
];

export const EDITORIAL_CITY_RECORDS = profiles.flatMap((profile) =>
  ["ar", "en"].map((locale) => ({
    cityCode: profile.code,
    cityName: locale === "ar" ? profile.arName : profile.enName,
    locale,
    slug: profile.slug,
    seoTitle: profile[locale].title,
    metaDescription: profile[locale].meta,
    pageHeading: profile[locale].h1,
    introduction: profile[locale].intro,
    serviceAreaContent: profile[locale].service,
    neighborhoodCoverageText: profile[locale].coverage,
    faqs: profile.faq.map((key, index) => ({
      ...faqSets[locale][key](locale === "ar" ? profile.arName : profile.enName),
      displayOrder: (index + 1) * 10,
    })),
  })),
);

export const EDITORIAL_CITY_CODES = profiles.map((profile) => profile.code);
