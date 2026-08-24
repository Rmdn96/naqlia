export type CustomerAccountDashboard = {
  orders: Array<{
    currency: string;
    execution_status: string;
    id: string;
    job_id: string | null;
    job_number: string | null;
    job_status: string | null;
    order_number: string;
    reference_number: string;
    review_available: boolean;
    review_submitted: boolean;
    total_amount: number;
  }>;
  profile: {
    created_at: string;
    display_name: string | null;
    email: string;
    email_verified: boolean;
    mobile_number: string | null;
    mobile_verified: boolean;
    preferred_locale: "ar" | "en";
    updated_at: string;
  };
  quotations: Array<{
    currency: string;
    expires_at: string;
    id: string;
    quotation_number: string;
    reference_number: string;
    revision_number: number;
    status: string;
    total_amount: number;
  }>;
  requests: Array<{
    id: string;
    reference_number: string;
    service_name_ar: string;
    service_name_en: string;
    status: string;
    submitted_at: string;
  }>;
};
