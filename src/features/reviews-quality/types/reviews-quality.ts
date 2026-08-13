export type CustomerDriverRating = {
  display_name: string;
  id: string;
  rating: number | null;
};

export type CustomerReview = {
  comment: string | null;
  created_at: string;
  handling_rating: number | null;
  overall_rating: number;
  publication_consent: boolean;
  punctuality_rating: number | null;
  updated_at: string;
  version: number;
};

export type CustomerReviewContext = {
  drivers: CustomerDriverRating[];
  review: CustomerReview | null;
  state: "eligible";
};

export type QualityInboxItem = {
  created_at: string;
  customer_name: string;
  id: string;
  is_featured: boolean;
  job_number: string;
  order_number: string;
  overall_rating: number;
  publication_consent: boolean;
  publication_status: string;
  quality_alert_id: string | null;
  quality_alert_status: string | null;
  reference_number: string;
  updated_at: string;
};

export type QualityInboxPage = {
  items: QualityInboxItem[];
  page: number;
  page_size: number;
  total: number;
};

export type QualityReviewDetail = {
  driver_ratings: Array<{ display_name: string; driver_id: string; rating: number }>;
  job: { job_number: string; status: string };
  lead: { customer_name: string; reference_number: string };
  quality_alert: null | {
    id: string;
    resolution_summary: string | null;
    status: string;
  };
  quality_notes: Array<{ actor_name: string | null; created_at: string; id: string; note: string }>;
  review: CustomerReview & {
    id: string;
    is_featured: boolean;
    publication_status: string;
  };
};
