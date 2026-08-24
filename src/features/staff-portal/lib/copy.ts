import type { AppLocale } from "@/i18n/routing";

export function getPortalCopy(locale: AppLocale) {
  const ar = locale === "ar";
  return {
    account: ar ? "حسابي الشخصي" : "Personal Account",
    actionCenter: ar ? "يحتاج إلى انتباهك" : "Needs your attention",
    activity: ar ? "سجل النشاط" : "Activity Log",
    administration: ar ? "الإدارة" : "Administration",
    businessSettings: ar ? "إعدادات الأعمال" : "Business Settings",
    dashboard: ar ? "لوحة العمل" : "Dashboard",
    finance: ar ? "المالية" : "Finance",
    notifications: ar ? "التنبيهات" : "Notifications",
    operations: ar ? "العمليات" : "Operations",
    quality: ar ? "خدمة العملاء والجودة" : "Customer Service & Quality",
    roles: ar ? "الأدوار والصلاحيات" : "Roles & Permissions",
    sales: ar ? "المبيعات" : "Sales",
    search: ar ? "البحث برقم NQ" : "Search NQ reference",
    seo: ar ? "إدارة SEO المحلي" : "Local SEO",
    settings: ar ? "إدارة الموقع" : "Site Management",
    signOut: ar ? "تسجيل الخروج" : "Sign out",
    users: ar ? "المستخدمون" : "Users",
  };
}
